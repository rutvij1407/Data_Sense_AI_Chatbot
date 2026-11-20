**DataSense AI: Chat With Your Data**

A web app where you upload a CSV or Excel file, ask questions in plain English and get answers with interactive charts.

Live demo: https://data-sense-chatbot.vercel.app

![Home screen with the sample dataset](docs/screenshots/demo_home.png)

**Try it without any setup**

The hosted version runs in demo mode. It loads a synthetic sales dataset and replays six recorded example chats, so you can see how the product works without any live AI calls and without an API key. Pick an example question and watch the answer and chart appear.

![A recorded answer](docs/screenshots/demo_summary.png)

![A recorded chart](docs/screenshots/demo_chart.png)

The recorded answers are not typed by hand. A script (nextjs/scripts/generate-demo.mjs) generates the sample data and calculates every figure in the answers from it, so the demo always matches the data.

**What it does**

* Upload a CSV, XLSX or XLS file and see its shape, columns, missing values and a preview.
* Ask questions in plain English about the data.
* Get short answers with the key numbers in bold, and interactive Plotly charts on request.
* In live mode, answers come from the Claude API using a summary of the dataset. Only a summary is sent, not the whole file: column names and types, basic statistics, value counts and the first ten rows.

**Two versions**

* Next.js web app (folder nextjs): the version that is deployed. It has a demo mode and a live mode.
* Streamlit app (app_project_rutvij.py): the original Python prototype, kept for reference.

**How demo mode works**

* The app asks /api/config whether to run in demo mode. It does when no ANTHROPIC_API_KEY is set, or when DEMO_MODE is set to true.
* In demo mode the chat never calls the API. It matches your question to a recorded chat and replays it with a typing effect.
* If the config call fails, the app falls back to demo mode, so it can never make an AI call by accident.
* The chat route answers with a 503 error when no key is set.

**Run the web app locally**

1. Go to the nextjs folder and run npm install.
2. Run npm run dev and open localhost on port 3000. With no key set you get demo mode.
3. For live mode, create nextjs/.env.local containing ANTHROPIC_API_KEY with your own key. Never commit this file. It is already ignored by git.
4. To force demo mode even when a key is present, set DEMO_MODE to true.

To rebuild the sample data and recorded chats, run node scripts/generate-demo.mjs inside the nextjs folder.

**Ask your documents (RAG)**

The Streamlit app has a second page, Ask Documents, that answers questions from text and markdown files instead of a CSV. It retrieves the most relevant passages, writes an answer from only those passages, and shows the sources with similarity scores. It declines to answer when nothing relevant is found.

![Ask Documents page](docs/screenshots/rag_documents.png)

How it works (code in the rag folder):

* Chunking: documents are split by section heading and paragraph, so every chunk keeps its heading.
* Retrieval: BM25 keyword search and dense embeddings (BAAI/bge-small-en-v1.5, run locally with fastembed) combined with reciprocal rank fusion.
* Answering: three modes. Claude (needs ANTHROPIC_API_KEY), a small local open model (Qwen2.5 1.5B through llama.cpp, free and offline), or an extractive fallback that returns the closest sentences. The best available mode is used.
* Abstaining: if the best dense similarity is below 0.64, the answer is "I could not find that in the documents." The threshold was chosen on a separate dev split.

Measured results on a test set I wrote by hand (30 answerable and 4 unanswerable questions about this repo's README and code walkthrough, 30 passages in total). Run python -m rag.evaluate to reproduce.

| Retriever | Right section ranked first | Right section in top 3 | MRR |
|---|---|---|---|
| BM25 | 47% | 77% | 0.64 |
| Dense embeddings | 57% | 83% | 0.71 |
| Hybrid (used) | 63% | 83% | 0.76 |

| Answer mode | Answer accuracy | Declined the 4 unanswerable questions |
|---|---|---|
| Extractive | 53% (16 of 30) | 3 of 4 |
| Local Qwen2.5 1.5B | 83% (25 of 30) | 3 of 4 |
| Claude | not measured yet, needs an API key | not measured yet |

Accuracy counts an answer as correct only if it contains the expected key words, so a correct answer worded differently is scored as a miss. Both modes wrongly declined one answerable question. The test set is small and all questions are about one project's documentation, so treat these as a baseline, not a benchmark.

**Tech stack**

Next.js 14, React 18, TypeScript, Tailwind CSS, Plotly, Papa Parse and SheetJS for file parsing, Framer Motion, and the Anthropic API for live mode. Deployed on Vercel.

**Repository layout**

* nextjs/app: pages and API routes (chat, parse, config)
* nextjs/components: chat, charts, dataset views and layout
* nextjs/hooks: chat, dataset and demo mode logic
* nextjs/lib/demo: the sample data and the matching of questions to recorded chats
* nextjs/scripts: the demo data generator
* app_project_rutvij.py: the Streamlit prototype (see requirements.txt)
* pages/1_Ask_Documents.py: the document question answering page
* rag: chunking, retrieval, answering and the evaluation script with its test set
* docs: extra notes and screenshots

**Author**

Rutvij Reddy Vakati, MS in Data Analytics Engineering, George Mason University.
LinkedIn: https://linkedin.com/in/vakati-rutvij-1167rutvij
GitHub: https://github.com/rutvij1407
