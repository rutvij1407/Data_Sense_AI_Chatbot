<<<<<<< HEAD
# DataSense AI – Analytics Chatbot

An AI-powered **data analytics chatbot** that lets you:

- Upload CSV or Excel files
- See quick dataset stats and summaries
- Ask natural-language questions about your data
- Get AI-generated insights and Plotly visualizations

The core app is built with **Python + Streamlit + Pandas + Plotly + Anthropic (Claude)**.

---

## 1. Project structure

- `app_project_rutvij.py` – main Streamlit app
- `requirements.txt` – Python dependencies (single source of truth)
- `GITHUB_ISSUES.md` – design/issue backlog and future React/Next.js migration plan

---

## 2. Prerequisites

- Python **3.9+**
- An Anthropic (Claude) API key

---

## 3. Setup and run locally

1. **Clone the repo** (or download the folder).
2. (Recommended) Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate       # macOS / Linux
   # venv\Scripts\activate       # Windows (PowerShell or cmd)
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file** in the project root:

   ```bash
   touch .env
   ```

   Add your Anthropic key (do NOT commit this file):

   ```bash
   ANTHROPIC_API_KEY=sk-...
   ```

5. **Run the app**:

   ```bash
   streamlit run app_project_rutvij.py
   ```

6. Open the URL shown in the terminal (usually `http://localhost:8501`).

---

## 4. High-level architecture

- **Frontend UI**: Streamlit app (`app_project_rutvij.py`)
  - Sidebar: file upload and dataset info
  - Main area: metric cards, preview, statistics, chat UI, and charts
- **Data layer**: Pandas DataFrame created from uploaded CSV/Excel
- **Visualization**: Plotly Express / Graph Objects charts rendered directly in Streamlit
- **AI layer**: Anthropic Claude API
  - The app builds a **dataset summary**
  - Sends summary + user question to Claude
  - Displays the model’s explanation
  - Optionally executes safe Plotly code returned by the model to render charts

For future work, see `GITHUB_ISSUES.md` for a full list of planned improvements including a **React + Next.js** frontend and Vercel deployment.

---

## 5. Notes on deployment (Vercel / Next.js)

This project currently runs as a **Streamlit app**, which is ideal for Python data workflows but not natively hosted on Vercel.

The recommended path to Vercel is:

1. Create a **separate React + Next.js frontend** that:
   - Runs on Vercel
   - Talks to a backend API (Python or Node) for data analysis and Claude calls
2. Keep the current Streamlit app as:
   - A reference implementation of the analysis logic, or
   - A backend service (e.g. rewritten with FastAPI/Flask) for the Next.js frontend.

Concrete steps and issue breakdown are documented in `GITHUB_ISSUES.md`.
=======
# chatbot_for_data-analysis
>>>>>>> 0ea113ce920599aa1623f30bde40ae60e34e6f08
