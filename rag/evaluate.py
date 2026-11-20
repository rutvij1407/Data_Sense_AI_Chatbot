"""Measure retrieval and answer quality on a small hand written test set.

Run:  python -m rag.evaluate   scores every answer mode available on this machine
      (extractive always, local if llama-cli and the model file exist, claude if ANTHROPIC_API_KEY is set)

The test set (rag/data/testset.json) has a dev split, used only to pick the abstain threshold,
and a test split that is scored. Every question names the document section that holds the answer
and the words that a correct answer must contain, and this script checks those gold labels
against the documents before scoring so a typo in the test set cannot inflate or hurt a score.
"""
import argparse, json
from pathlib import Path
import numpy as np
from .chunking import load_paths
from .retrieval import Retriever
from .answer import answer, available_modes, ABSTAIN

ROOT = Path(__file__).resolve().parent.parent
DOCS = [ROOT / "README.md", ROOT / "docs" / "CODE_EXPLANATION.md"]
K = 3

def is_gold(chunk, item):
    return chunk.file == item["file"] and item["section"].lower() in chunk.heading.lower()

def validate(items, chunks):
    for it in items:
        if it.get("answerable") is False:
            continue
        gold = [c for c in chunks if is_gold(c, it)]
        assert gold, f"no section matches: {it}"
        text = " ".join(c.text for c in gold).lower()
        assert any(a.lower() in text for a in it["answers"]), f"gold answer not in gold section: {it}"

def retrieval_scores(ret, items, method):
    h1 = h3 = rr = 0
    for it in items:
        hits = [c for c, _ in ret.search(it["q"], k=10, method=method)]
        rank = next((i + 1 for i, c in enumerate(hits) if is_gold(c, it)), None)
        h1 += rank == 1; h3 += bool(rank and rank <= K); rr += 1 / rank if rank else 0
    n = len(items)
    return {"hit@1": h1 / n, f"hit@{K}": h3 / n, "MRR": rr / n}

def pick_threshold(ret, dev):
    best = (-1, 0.5)
    for t in np.arange(0.40, 0.80, 0.01):
        ok = 0
        for it in dev:
            s = ret.best_dense(it["q"])
            ok += (s < t) if it.get("answerable") is False else (s >= t)
        best = max(best, (ok, round(float(t), 2)))
    return best[1]

def main():
    
    data = json.loads((ROOT / "rag" / "data" / "testset.json").read_text())
    chunks = load_paths(DOCS)
    validate(data["dev"] + data["test"], chunks)
    ret = Retriever(chunks)
    answerable = [i for i in data["test"] if i.get("answerable") is not False]
    unans = [i for i in data["test"] if i.get("answerable") is False]
    out = {"chunks": len(chunks), "test_answerable": len(answerable), "test_unanswerable": len(unans)}
    out["retrieval"] = {m: retrieval_scores(ret, answerable, m) for m in ["bm25", "dense", "hybrid"]}
    t = pick_threshold(ret, data["dev"]); out["abstain_threshold"] = t

    out["answer"] = {}
    for mode in available_modes():
        correct = wrong_abstain = 0; misses = []
        for it in answerable:
            text, _ = answer(ret, it["q"], k=K, min_score=t, mode=mode)
            ok = any(x.lower() in text.lower() for x in it["answers"])
            correct += ok; wrong_abstain += text == ABSTAIN
            if not ok: misses.append({"q": it["q"], "got": text[:160]})
        good = sum(answer(ret, it["q"], k=K, min_score=t, mode=mode)[0] == ABSTAIN for it in unans)
        out["answer"][mode] = {"accuracy": correct / len(answerable), "wrongly_abstained": wrong_abstain,
                               "abstained_on_unanswerable": f"{good}/{len(unans)}", "misses": misses}
        print(mode, {k: v for k, v in out["answer"][mode].items() if k != "misses"})
    (ROOT / "rag" / "results.json").write_text(json.dumps(out, indent=2))
    print(json.dumps({k: v for k, v in out.items() if k != "answer"}, indent=2))
    for mode, r in out["answer"].items():
        for m in r["misses"]: print(mode, "MISS:", m)

if __name__ == "__main__":
    main()
