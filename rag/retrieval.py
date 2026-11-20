"""Three retrievers over a list of chunks: BM25 (keywords), dense embeddings, and a hybrid of both.

Dense embeddings run locally with fastembed (BAAI/bge-small-en-v1.5), so no API key or network
call is needed after the model downloads once.
"""
import re
import numpy as np
from rank_bm25 import BM25Okapi

_TOKEN = re.compile(r"[a-z0-9_]+")
def tokenize(text):
    return _TOKEN.findall(text.lower())

class Retriever:
    def __init__(self, chunks, model_name="BAAI/bge-small-en-v1.5"):
        from fastembed import TextEmbedding
        self.chunks = chunks
        docs = [f"{c.heading}. {c.text}" for c in chunks]
        self.bm25 = BM25Okapi([tokenize(d) for d in docs])
        self.model = TextEmbedding(model_name)
        self.vecs = np.array(list(self.model.embed(docs)))
        self.vecs /= np.linalg.norm(self.vecs, axis=1, keepdims=True)

    def _dense_scores(self, q):
        v = np.array(list(self.model.query_embed([q])))[0]
        return self.vecs @ (v / np.linalg.norm(v))

    def search(self, q, k=3, method="hybrid"):
        """Return [(chunk, score)] best first. Score for dense/hybrid is cosine of the best dense match."""
        dense = self._dense_scores(q)
        bm = self.bm25.get_scores(tokenize(q))
        if method == "bm25":
            order = np.argsort(-bm)
        elif method == "dense":
            order = np.argsort(-dense)
        else:  # reciprocal rank fusion
            rank = lambda s: {i: r for r, i in enumerate(np.argsort(-s))}
            rb, rd = rank(bm), rank(dense)
            fused = {i: 1 / (60 + rb[i]) + 1 / (60 + rd[i]) for i in rb}
            order = sorted(fused, key=fused.get, reverse=True)
        return [(self.chunks[i], float(dense[i])) for i in order[:k]]

    def best_dense(self, q):
        return float(self._dense_scores(q).max())
