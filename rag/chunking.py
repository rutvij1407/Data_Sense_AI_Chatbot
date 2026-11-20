"""Split markdown documents into overlapping free text chunks that keep their section heading."""
import re
from dataclasses import dataclass
from pathlib import Path

MAX_WORDS = 140

@dataclass
class Chunk:
    file: str
    heading: str
    text: str

    @property
    def id(self):
        return f"{self.file}::{self.heading}"

def _is_heading(line):
    s = line.strip()
    return s.startswith("#") or (s.startswith("**") and s.endswith("**") and len(s) < 90)

def _clean_heading(line):
    return re.sub(r"^#+\s*|\*\*", "", line.strip()).strip()

def split_document(name, text):
    """Group lines under their nearest heading, then cut long sections at paragraph breaks."""
    sections, heading, buf = [], "Introduction", []
    for line in text.splitlines():
        if _is_heading(line):
            if "".join(buf).strip():
                sections.append((heading, "\n".join(buf)))
            heading, buf = _clean_heading(line), []
        else:
            buf.append(line)
    if "".join(buf).strip():
        sections.append((heading, "\n".join(buf)))

    chunks = []
    for heading, body in sections:
        paras = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]
        cur, words = [], 0
        for p in paras:
            n = len(p.split())
            if cur and words + n > MAX_WORDS:
                chunks.append(Chunk(name, heading, "\n\n".join(cur))); cur, words = [], 0
            cur.append(p); words += n
        if cur:
            chunks.append(Chunk(name, heading, "\n\n".join(cur)))
    return chunks

def load_paths(paths):
    out = []
    for p in map(Path, paths):
        out += split_document(p.name, p.read_text(encoding="utf8"))
    return out
