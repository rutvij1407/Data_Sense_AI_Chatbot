"""Answer a question from retrieved chunks.

Three answer modes, best available is used by default:
  claude      written by Claude from the retrieved passages (needs ANTHROPIC_API_KEY)
  local       written by a small open model through llama.cpp (free, offline, no key)
  extractive  the passage sentences closest to the question (no model at all)
All three refuse to answer when the best retrieved match is too weak.
"""
import os, re, shutil, subprocess, tempfile
from pathlib import Path
import numpy as np

ABSTAIN = "I could not find that in the documents."
SYSTEM = ("Answer the question in one or two complete sentences using only the numbered passages. "
          "State the specific fact asked for, then add the passage number in brackets, like [1]. "
          "If the passages do not contain the answer, reply exactly: " + ABSTAIN)

def _sentences(text):
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [p.strip(" -*") for p in parts if len(p.split()) >= 4]

def extractive(retriever, question, hits, n=2):
    cands = [(c, s) for c, _ in hits for s in _sentences(c.text)]
    if not cands:
        return hits[0][0].text[:300]
    vecs = np.array(list(retriever.model.embed([s for _, s in cands])))
    vecs /= np.linalg.norm(vecs, axis=1, keepdims=True)
    q = np.array(list(retriever.model.query_embed([question])))[0]
    top = np.argsort(-(vecs @ (q / np.linalg.norm(q))))[:n]
    return " ".join(cands[i][1] for i in sorted(top))

def llm(question, hits, model="claude-sonnet-4-20250514"):
    from anthropic import Anthropic
    ctx = "\n\n".join(f"[{i+1}] ({c.file}, {c.heading})\n{c.text}" for i, (c, _) in enumerate(hits))
    r = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"]).messages.create(
        model=model, max_tokens=400, system=SYSTEM,
        messages=[{"role": "user", "content": f"Passages:\n{ctx}\n\nQuestion: {question}"}])
    return r.content[0].text

LOCAL_MODEL = Path(os.getenv("RAG_LOCAL_MODEL", Path.home() / ".cache" / "datasense-rag" / "qwen2.5-1.5b-instruct-q4_k_m.gguf"))

PORT = int(os.getenv("RAG_LOCAL_PORT", "8089"))
_server = None

def local_available():
    return shutil.which("llama-server") is not None and LOCAL_MODEL.exists()

def _start_server():
    """Start llama.cpp's server once per process and wait until it answers."""
    global _server
    if _server is not None:
        return
    import atexit, time, urllib.request
    _server = subprocess.Popen(["llama-server", "-m", str(LOCAL_MODEL), "--port", str(PORT), "-c", "4096",
                                "--log-disable"], stdin=subprocess.DEVNULL,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    atexit.register(_server.terminate)
    for _ in range(120):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/health", timeout=1); return
        except Exception:
            time.sleep(0.5)
    raise RuntimeError("local model server did not start")

def local(question, hits):
    """Free local generation with llama.cpp and a small open model. No key, no network."""
    import json, urllib.request
    _start_server()
    ctx = "\n\n".join(f"[{i+1}] ({c.file}, {c.heading})\n{c.text}" for i, (c, _) in enumerate(hits))
    body = {"messages": [{"role": "system", "content": SYSTEM},
                         {"role": "user", "content": f"Passages:\n{ctx}\n\nQuestion: {question}"}],
            "temperature": 0, "max_tokens": 200}
    req = urllib.request.Request(f"http://127.0.0.1:{PORT}/v1/chat/completions", json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    out = json.load(urllib.request.urlopen(req, timeout=120))["choices"][0]["message"]["content"]
    return out.strip() or ABSTAIN

def available_modes():
    modes = ["extractive"]
    if local_available(): modes.append("local")
    if os.getenv("ANTHROPIC_API_KEY"): modes.append("claude")
    return modes

def answer(retriever, question, k=3, min_score=0.5, mode=None):
    """Return (answer_text, hits). hits are [(chunk, score)] so the UI can show sources.
    mode: extractive, local, claude, or None to use the best one available."""
    hits = retriever.search(question, k=k, method="hybrid")
    if retriever.best_dense(question) < min_score:
        return ABSTAIN, hits
    mode = mode or available_modes()[-1]
    fn = {"claude": lambda: llm(question, hits), "local": lambda: local(question, hits),
          "extractive": lambda: extractive(retriever, question, hits)}[mode]
    return fn(), hits
