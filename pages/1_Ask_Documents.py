"""Ask questions about documents (RAG). Answers cite the passages they came from."""
import sys, textwrap
from pathlib import Path
import streamlit as st

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from rag.chunking import split_document
from rag.retrieval import Retriever
from rag.answer import answer, available_modes, ABSTAIN

st.set_page_config(page_title="Ask Documents | DataSense AI", page_icon="🔴", layout="wide")
st.title("Ask your documents")
st.caption("Upload text or markdown files and ask questions. Answers come only from the retrieved passages, and the sources are shown.")

SAMPLES = [ROOT / "README.md", ROOT / "docs" / "CODE_EXPLANATION.md"]
MIN_SCORE = 0.64  # chosen on the dev split in rag/data/testset.json

@st.cache_resource(show_spinner="Indexing documents")
def build(docs):
    chunks = [c for name, text in docs for c in split_document(name, text)]
    return Retriever(chunks)

uploaded = st.sidebar.file_uploader("Documents (.md or .txt)", type=["md", "txt"], accept_multiple_files=True)
docs = [(f.name, f.getvalue().decode("utf8", errors="replace")) for f in uploaded] or \
       [(p.name, p.read_text(encoding="utf8")) for p in SAMPLES]
st.sidebar.write("Using: " + (", ".join(n for n, _ in docs)))
modes = available_modes()
mode = st.sidebar.selectbox("Answer mode", modes, index=len(modes) - 1,
                            help="claude needs ANTHROPIC_API_KEY, local needs llama.cpp and a model file, extractive needs nothing")

retriever = build(tuple(docs))
q = st.chat_input("Ask about the documents")
if q:
    with st.chat_message("user"):
        st.write(q)
    with st.chat_message("assistant"):
        with st.spinner("Searching and answering"):
            text, hits = answer(retriever, q, k=3, min_score=MIN_SCORE, mode=mode)
        st.write(text)
        if text != ABSTAIN:
            with st.expander("Sources"):
                for i, (c, s) in enumerate(hits, 1):
                    st.markdown(f"**[{i}] {c.file}, {c.heading}** (similarity {s:.2f})")
                    st.text(textwrap.shorten(c.text, 260, placeholder=" ..."))
