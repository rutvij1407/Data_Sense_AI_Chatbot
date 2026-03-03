## DataSense AI Chatbot – Code Walkthrough (Line by Line Overview)

This document explains the main parts of `app_project_rutvij.py`: what each section does, why it exists, and which technologies are involved.

For convenience, references like “L1–L10” correspond to approximate line ranges in the file.

---

### 1. Imports and environment setup (L1–L12)

- `import streamlit as st`  
  Imports Streamlit, the Python framework used to build the web UI.

- `import pandas as pd`  
  Imports Pandas for reading and manipulating tabular data (CSV/Excel).

- `import plotly.express as px` and `import plotly.graph_objects as go`  
  Imports Plotly for building interactive charts. `px` is high-level, `go` is lower-level and more flexible.

- `from anthropic import Anthropic`  
  Imports the Anthropic Python SDK, which is used to call the Claude LLM.

- `from dotenv import load_dotenv`  
  Imports `python-dotenv` to load environment variables (like `ANTHROPIC_API_KEY`) from a `.env` file.

- `import os`  
  Imports the standard library `os` module to access environment variables.

- `load_dotenv()`  
  Loads key/value pairs from `.env` into the environment, so `os.getenv("ANTHROPIC_API_KEY")` works.

- `ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")`  
  Reads the Claude API key from the environment. If this is `None` or empty, AI features will be disabled.

- `API_KEY_AVAILABLE = bool(ANTHROPIC_API_KEY)`  
  Simple boolean flag to check if the key is present; used later to conditionally render the chat UI.

**Technologies involved:** Python, `python-dotenv`, Anthropic SDK, environment variables.

---

### 2. Streamlit page configuration (L14–L19)

- `st.set_page_config(...)`  
  Configures the overall app:
  - `page_title`: Title shown in the browser tab.
  - `page_icon`: Emoji icon.
  - `layout="wide"`: Uses the full-width layout.
  - `initial_sidebar_state="expanded"`: Opens the sidebar by default.

**Why:** Provides a better default UI experience and branding for the app.

---

### 3. Global CSS styling (L21–L136)

- `st.markdown("""<style> ... </style>""", unsafe_allow_html=True)`  
  Injects a big block of custom CSS into the Streamlit app. This customizes:
  - Background gradients for the main app and sidebar.
  - Heading styles (`h1`, `h2`, `h3`).
  - Metric value and label styles.
  - Button styles (gradients, hover effects, shadows).
  - Chat message container appearance.
  - Input field styles.
  - File uploader box styling.
  - DataFrame and expander styling.

**Why:** Streamlit’s default styling is minimal; this CSS makes the app look more like a polished product, with a dark theme matching the DataSense AI brand.

**Technologies:** Streamlit (with `unsafe_allow_html`), HTML/CSS.

---

### 4. Global constants and session state initialization (L138–L147)

- `MAX_REQUESTS_PER_SESSION = 30`  
  Sets a hard cap on how many AI requests a single user session can make. This helps control Claude API costs.

- `if "messages" not in st.session_state: ...`  
  Initializes a list to store the chat history (`messages`). Each entry is a dict with at least `role` and `content`, and optionally a `figure`.

- `if "df" not in st.session_state: ...`  
  Stores the uploaded dataset (`df`) so it persists during the session.

- `if "file_name" not in st.session_state: ...`  
  Stores the uploaded file’s name for display in the sidebar.

- `if "request_count" not in st.session_state: ...`  
  Tracks how many Claude API calls have been made in this session to enforce `MAX_REQUESTS_PER_SESSION`.

**Why:** Streamlit re-runs the script on each interaction, so using `st.session_state` is key to preserving state between runs.

---

### 5. `get_data_summary(df)` – dataset summarization helper (L149–L159)

This function builds a compact textual summary of the dataset to send to the LLM:

- `columns`: list of column names.
- `shape`: number of rows and columns.
- `dtypes`: data types per column, converted to strings.
- `sample`: the first 3 rows as a Python dict.
- `numeric_stats`: `df.describe()` for numeric columns, or `{}` if none.
- `missing`: count of missing values per column.

The function returns `str(summary)`, which is a stringified Python dict. This gives the model enough context to answer questions intelligently without sending the full dataset.

**Technologies:** Pandas, basic Python data structures.

---

### 6. `create_metric_card(label, value, icon)` – small HTML component (L161–L169)

This function returns an HTML string for a metric card:

- Wraps content in a `<div class="metric-card">` styled in the CSS above.
- Shows an icon, a large value, and a label.

Later in the UI, `st.markdown(create_metric_card(...), unsafe_allow_html=True)` is used to render these cards (for total rows, columns, missing values, numeric columns).

**Why:** Avoids repeating raw HTML strings for each metric card; keeps styling consistent.

---

### 7. Sidebar layout: branding, file upload, and dataset info (L171–220)

The `with st.sidebar:` block builds the entire sidebar:

- If the API key is missing, it shows a warning at the top so the user knows AI features are disabled.
- Displays the DataSense AI branding (icon, title, subtitle) using custom HTML.
- Adds a horizontal rule (`st.markdown("---")`).
- Adds a file uploader with:
  - Label: “Drop your CSV or Excel file”.
  - Accepted types: `["csv", "xlsx", "xls"]`.
  - A tooltip explaining supported formats.

When a file is uploaded:

- If it ends with `.csv`, it is loaded via `pd.read_csv(uploaded_file)`.
- Otherwise, `pd.read_excel(uploaded_file)` is used (requires `openpyxl`).
- The loaded DataFrame and file name are stored in `st.session_state`.
- Success and error messages are shown as Streamlit notifications.

If a dataset is present (`st.session_state.df is not None`):

- The sidebar shows dataset info: file name, row/column counts.
- An expander lists each column with its data type.

Finally, there’s a footer with “Built by Rutvij” and “Powered by Claude AI”.

**Technologies:** Streamlit components (`st.sidebar`, `st.file_uploader`, `st.expander`, notifications), Pandas.

---

### 8. Main header / hero section (L222–229)

This `st.markdown` block uses HTML to render:

- A large title: “🤖 DataSense AI”.
- A subtitle: “Your Intelligent Data Analytics Assistant”.

It is centered and styled according to the CSS defined earlier.

**Purpose:** Gives the app a clear, branded entry point for users.

---

### 9. Main body when a dataset is loaded (L231–270)

If `st.session_state.df` is not `None`, the main area shows:

- **Metric cards**:
  - Total rows.
  - Number of columns.
  - Total missing values.
  - Number of numeric columns.
  Each card is rendered with `create_metric_card(...)`.

- A horizontal rule separating metrics from details.

- **Dataset preview** in an expander:
  - Shows the first 10 rows with `st.dataframe`, wide layout, and hidden index.

- **Quick statistics** in another expander:
  - If there are numeric columns, `df.describe().round(2)` is shown as a table.

- A small “Ask Questions About Your Data” section that encourages the user to ask AI-powered questions and gives example queries.

**Technologies:** Streamlit layout (columns, expanders), Pandas for stats, HTML for styling.

---

### 10. Main body when no dataset is loaded (L272–314)

If no dataset is present:

- Renders a welcome section with:
  - A welcome heading.
  - A short paragraph explaining what the app does.
  - A hint pointing to the sidebar to upload a file.

- Displays three metric-like cards (Data Analysis, Visualizations, AI Powered) with icons and short descriptions. These show off features before the user uploads any data.

**Purpose:** Improves user experience for first-time visitors and guides them to the file uploader.

---

### 11. Rendering chat history (L316–320)

The app loops through `st.session_state.messages`:

- For each `message`, it uses `st.chat_message(message["role"])` to render user and assistant bubbles.
- Displays the markdown content.
- If the message includes a `figure`, it calls `st.plotly_chart` to display it.

**Why:** This keeps the full chat history visible across interactions, creating a proper conversational UI.

---

### 12. Handling API key availability and usage limits (L322–327)

The next block checks:

- If `API_KEY_AVAILABLE` is `False`, an info message is shown: the user is told to set `ANTHROPIC_API_KEY` in `.env`.
- If the key is present but `request_count` has reached `MAX_REQUESTS_PER_SESSION`, the app shows a warning that the free AI usage limit has been hit and stops accepting new questions.

**Goal:** Clear communication about configuration issues and protection against uncontrolled costs.

---

### 13. Chat input and AI request handling (L328–371)

When the API key is available and the request limit has not been reached:

- The app renders `prompt = st.chat_input("Ask about your data...")`.
- If the user submits a non-empty prompt:
  - If no dataset is loaded, it warns the user to upload a dataset first.
  - Otherwise, it:
    - Appends the user message to `st.session_state.messages`.
    - Renders the user message bubble.
    - Shows a spinner (“🔍 Analyzing…”).

Inside the spinner:

- It retrieves the current `df` and calls `get_data_summary(df)` to build a summary.
- It constructs a `system_prompt` that tells Claude how to behave:
  - Be concise and professional.
  - Use Plotly for charts.
  - Always reference `df`.
  - Create a `fig` variable.
  - Use a dark Plotly template and a specific color palette.
  - Format chart code in ```python blocks.

- It creates a Claude client: `client = Anthropic(api_key=ANTHROPIC_API_KEY)`.
- It calls `client.messages.create(...)` with:
  - `model="claude-sonnet-4-20250514"` (current chosen model).
  - `max_tokens=512` to limit response size.
  - The `system_prompt`.
  - A user message containing the dataset summary and the user’s question.

- After receiving the response, it increments `request_count` and then:
  - Extracts the answer text.
  - Displays it in the assistant chat bubble.

**Technologies:** Anthropic Claude SDK, Streamlit chat components, prompt engineering.

---

### 14. Safe execution of model-generated chart code (L378–403)

If the answer text contains a ```python block:

1. The app extracts the code between ```python and the closing ``` markers.
2. It defines a list of `unsafe_keywords` such as:
   - `"import "`, `"open("`, `"os."`, `"sys."`, `"subprocess"`, `"eval("`, `"exec("`, etc.
3. If any of these patterns appear in the code, the app refuses to run it and shows an error message.
4. If the code passes the safety check:
   - It creates a restricted `exec_globals` dictionary:
     - `__builtins__` is limited to safe functions like `len` and `range`.
     - Only the necessary libraries and objects are exposed: `pd`, `px`, `go`, `df`, and `st`.
   - It runs `exec(code, exec_globals)`.
   - If `fig` appears in `exec_globals`, it assumes a valid Plotly figure was created and renders it with `st.plotly_chart`.

If any exception occurs during execution or plotting, the app catches it and shows a user-friendly error.

**Why:** This design allows flexible chart creation from natural language, while reducing the risk of arbitrary code execution.

---

### 15. Storing the assistant response and optional figure (L405–408)

Finally, the app:

- Builds a `message_data` dict with the assistant’s text answer.
- Adds the `figure` if one was successfully created.
- Appends this `message_data` to `st.session_state.messages`, so it will be rendered the next time the script runs.

**Effect:** The entire conversation, including charts, becomes part of the scrolling chat history.

---

### 16. Summary of key technologies and patterns

- **Streamlit** for rapid UI development and session state handling.
- **Pandas** for reading and summarizing tabular data.
- **Plotly** for interactive, styled visualizations.
- **Anthropic (Claude)** for natural-language understanding and generation of explanations/plotting code.
- **Environment variables + python-dotenv** for secure API key management.
- **Basic security measures** for executing model-generated code (keyword filtering, restricted builtins).
- **Cost-control mechanics** via per-session request caps and limited `max_tokens`.

Together, these choices make DataSense AI a strong demonstration project: it shows that you understand both modern data tooling and how to safely integrate a large language model into a data analytics workflow.

