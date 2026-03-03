# DataSense AI Chatbot – GitHub issues

Use these as templates to open issues in your repo ([rutvij1407](https://github.com/rutvij1407)). They cover migration to React/Next.js, structure, security, and maintainability.

---

## 1. [Epic] Migrate from Streamlit to React + Next.js frontend

**Labels:** `enhancement`, `epic`, `react`, `nextjs`

**Description**

The app is currently a single Streamlit (Python) UI. To improve scalability, deployment options, and frontend control, we should move to a **React + Next.js** frontend with a separate API (Python or Node).

**Acceptance criteria**

- [ ] Next.js app with App Router
- [ ] React components for: file upload, dataset info, chat, metric cards, chart display
- [ ] API route(s) for: file upload, dataset summary, chat/completion (proxy to Anthropic or backend)
- [ ] Same features: CSV/Excel upload, data summary, AI chat, Plotly charts
- [ ] Environment variable for API key (e.g. `ANTHROPIC_API_KEY`) used only server-side

**Notes**

- Keep Python backend for data processing and Claude API if desired, or reimplement in Node.
- Consider `next-auth` or similar if you add auth later.

---

## 2. Replace inline HTML/CSS in Streamlit with reusable components (or remove when moving to React)

**Labels:** `refactor`, `maintainability`

**Description**

`app_project_rutvij.py` uses large blocks of inline HTML/CSS in `st.markdown(..., unsafe_allow_html=True)` and string-based “metric cards”. This is hard to maintain and not reusable.

**Current issues**

- ~120 lines of CSS in a Python string (lines 18–132)
- Metric cards built with f-strings and raw HTML (e.g. `create_metric_card()`)
- Sidebar and hero sections use inline HTML

**Proposed direction**

- **If staying on Streamlit:** Extract CSS to a `.css` file and load it; use Streamlit components or small helpers instead of raw HTML strings.
- **If migrating to React:** Delete this once equivalent React components exist (metric cards, layout, chat UI).

---

## 3. Fix duplicate/typo: `requirments.txt` vs `requirements.txt`

**Labels:** `bug`, `documentation`, `good first issue`

**Description**

There are two requirement files:

- `requirements.txt` – no `openpyxl`
- `requirments.txt` – has `openpyxl` (needed for Excel)

The second filename is a typo (`requirments` → `requirements`).

**Acceptance criteria**

- [ ] Single source of truth: keep `requirements.txt` only
- [ ] Add `openpyxl` to `requirements.txt` (used for `pd.read_excel()` in the app)
- [ ] Remove `requirments.txt`
- [ ] Update README if it references `requirments.txt`

---

## 4. Security: Avoid `exec()` on LLM-generated code

**Labels:** `security`, `bug`

**Description**

In `app_project_rutvij.py` (around 361–372), the app extracts Python code from the model’s response and runs it with `exec(code, exec_globals)`. Executing arbitrary (even model-generated) code in the same process as the app is risky (e.g. file system access, imports, infinite loops).

**Suggested mitigations**

- Run the snippet in a **subprocess** with a timeout and restricted environment.
- Or use a **sandboxed execution** (e.g. restricted `exec` with a minimal globals dict and no `__builtins__` or limited builtins).
- Or move chart generation to a **backend-only** step: model returns structured chart spec (e.g. JSON), backend builds the Plotly figure and returns image/JSON; frontend never runs code.

**Acceptance criteria**

- [ ] No unrestricted `exec()` of user or model-generated code in the main app process; use one of the options above.
- [ ] Timeout and resource limits on code execution.

---

## 5. Improve README and project documentation

**Labels:** `documentation`, `good first issue`

**Description**

`README.md` only contains the project title. New contributors and future you will need setup and run instructions.

**Suggested sections**

- Project title and short description (DataSense AI – data analytics chatbot).
- Tech stack (Streamlit, Pandas, Plotly, Anthropic/Claude).
- Prerequisites (Python 3.x).
- Setup: `python -m venv venv`, `source venv/bin/activate` (or Windows equivalent), `pip install -r requirements.txt`.
- Environment: create `.env` with `ANTHROPIC_API_KEY`.
- Run: `streamlit run app_project_rutvij.py`.
- Optional: screenshots, link to GitHub repo, license.

---

## 6. Consolidate dependency list and pin versions

**Labels:** `maintenance`, `dependencies`

**Description**

- Two requirement files (see issue #3).
- No version pins in `requirements.txt`/`requirments.txt`, which can lead to breaking changes after `pip install`.

**Acceptance criteria**

- [ ] Single `requirements.txt` with all needed packages (including `openpyxl`).
- [ ] Pin major (or major.minor) versions, e.g. `streamlit>=1.28,<2`, `anthropic>=0.18`, `pandas>=2.0`, `plotly>=5.18`, `python-dotenv>=1.0`, `openpyxl>=3.1`.

---

## 7. Add API key validation and clear error messages

**Labels:** `ux`, `bug`

**Description**

If `ANTHROPIC_API_KEY` is missing or invalid, the app only fails when the user sends a message, with a generic exception. Users should get a clear message at startup or when they first try to chat.

**Acceptance criteria**

- [ ] On startup (or on first chat): check that `os.getenv("ANTHROPIC_API_KEY")` is set and non-empty.
- [ ] If missing: show a clear message in the UI (e.g. “Set ANTHROPIC_API_KEY in .env”) and optionally disable the chat input.
- [ ] If API returns 401: show a user-friendly “Invalid API key” message instead of raw traceback.

---

## 8. Split monolith: separate UI, API, and data logic

**Labels:** `refactor`, `architecture`

**Description**

All logic lives in one file (`app_project_rutvij.py`): UI, session state, data loading, summary generation, Claude calls, and code execution. This makes testing and a future React/Next.js migration harder.

**Suggested structure (before or during migration)**

- `data/` or `lib/`: data loading (CSV/Excel), `get_data_summary()`, and any pandas helpers.
- `api/` or `services/`: Claude client, prompt building, and (if kept) safe chart code execution.
- `app_project_rutvij.py`: only Streamlit UI and session state (or replace by Next.js frontend + API).

**Acceptance criteria**

- [ ] Data loading and summary logic in a separate module.
- [ ] Claude + chart-generation (or chart spec) logic in a separate module.
- [ ] Streamlit script (or Next.js app) only orchestrates UI and calls these modules.

---

## 9. Add basic tests

**Labels:** `testing`, `good first issue`

**Description**

There are no tests. Refactoring and migration to React/Next.js are safer with at least a few tests.

**Suggested tests**

- `get_data_summary()`: given a small DataFrame, returns a dict with expected keys (columns, shape, dtypes, sample, etc.).
- Data loading: small CSV/Excel files load without error and produce expected columns/rows.
- (After refactor) API/service: given a mock DataFrame and a simple prompt, the service returns a non-empty response (or expected structure).

**Acceptance criteria**

- [ ] `pytest` (or preferred runner) in `requirements-dev.txt` or `requirements.txt`.
- [ ] At least one test for data summary and one for data loading; optional one for API/service.

---

## 10. [React/Next.js] Design frontend structure and first components

**Labels:** `enhancement`, `react`, `nextjs`

**Description**

Part of the migration to React + Next.js. Define a clear component and page structure before implementing.

**Suggested structure**

- **Pages:** Home (upload + welcome), optional “Analyze” page after upload.
- **Components:**
  - `FileUpload`: drag-and-drop CSV/Excel.
  - `DatasetInfo`: file name, rows, columns, column list.
  - `MetricCards`: row count, column count, missing values, numeric columns.
  - `ChatPanel`: message list + input; optional code/chart block rendering.
  - `ChartView`: render Plotly (e.g. via `react-plotly.js` or image from API).

**Acceptance criteria**

- [ ] Next.js project created (e.g. `npx create-next-app`).
- [ ] Folder structure: `app/`, `components/`, `lib/` or `services/`.
- [ ] Stub components for the list above; one page that composes them (can be static data first).

---

## 11. [React/Next.js] Implement backend API for chat and data

**Labels:** `enhancement`, `react`, `nextjs`, `backend`

**Description**

Next.js frontend needs an API for:

1. Uploading a file and receiving dataset summary (and maybe column list).
2. Sending chat messages and receiving AI response + optional chart (e.g. Plotly JSON or image).

**Options**

- **Option A:** Next.js API routes call a **Python backend** (FastAPI/Flask) that keeps current logic (pandas, Claude, Plotly).
- **Option B:** Next.js API routes only; reimplement data summary and Claude integration in Node/TypeScript; chart spec → server-side Plotly or client-side `react-plotly.js`.

**Acceptance criteria**

- [ ] POST endpoint for file upload; returns summary (and/or column list).
- [ ] POST endpoint for chat; accepts message + optional context (e.g. dataset summary); returns assistant message and optional chart payload.
- [ ] API key stored in env and used only on server; no key in client bundle.

---

## 12. Environment and deployment checklist

**Labels:** `documentation`, `devops`

**Description**

Document how to run the app in development and how to deploy (e.g. Vercel for Next.js, or Streamlit Cloud / Docker for current app).

**Acceptance criteria**

- [ ] README or `docs/` describes: local env vars (`.env`), local run, and one deployment path.
- [ ] `.env.example` with `ANTHROPIC_API_KEY=` (no real value).
- [ ] `.gitignore` already ignores `.env` (currently it does).

---

## Summary

| # | Title                                              | Labels                          |
|---|----------------------------------------------------|----------------------------------|
| 1 | Migrate to React + Next.js                         | enhancement, epic, react, nextjs |
| 2 | Replace inline HTML/CSS                             | refactor, maintainability        |
| 3 | Fix requirments.txt typo and merge with requirements | bug, documentation               |
| 4 | Security: sandbox or replace exec()                | security, bug                    |
| 5 | Improve README                                     | documentation                    |
| 6 | Single requirements + version pins                | maintenance, dependencies        |
| 7 | API key validation and errors                      | ux, bug                          |
| 8 | Split monolith into modules                        | refactor, architecture           |
| 9 | Add basic tests                                    | testing                          |
|10 | [Next.js] Frontend structure and components        | enhancement, react, nextjs       |
|11 | [Next.js] Backend API for chat and data            | enhancement, nextjs, backend     |
|12 | Environment and deployment docs                    | documentation, devops            |

You can copy each block into a new GitHub issue in your repo. If you want, we can next turn this into a single `ISSUE_TEMPLATE` or start implementing one of these (e.g. fix requirements and README, or scaffold a Next.js app).
