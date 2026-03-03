## DataSense AI Chatbot – Interview Questions and Answers

Use these questions to prepare for interviews about this project. They cover architecture, technologies, design decisions, and trade-offs.

---

### 1. What is DataSense AI and what problem does it solve?

**Answer (example):**
DataSense AI is an AI-powered analytics chatbot that helps users explore and understand their tabular data (CSV/Excel) without writing code. Users upload a dataset and then ask natural-language questions like “What are the top categories by revenue?” or “Show a bar chart of sales by month.” The app combines Python data tooling (Pandas, Plotly) with Anthropic’s Claude model to generate insights and visualizations quickly, making data analysis more accessible to non-technical users.

---

### 2. What is the tech stack used in this project?

**Answer (example):**
The core stack is:

- **Python** as the main language.
- **Streamlit** for the web UI and layout.
- **Pandas** for data loading and manipulation.
- **Plotly (Express + Graph Objects)** for interactive charts.
- **Anthropic (Claude)** as the LLM powering the chatbot.
- **python-dotenv** and environment variables for secure API key management.

The project is currently a single-page Streamlit app, with a roadmap to move toward a React + Next.js frontend and a separate backend service.

---

### 3. How does the data flow from file upload to AI answer?

**Answer (example):**
1. The user uploads a CSV or Excel file through the Streamlit sidebar.
2. The app loads it into a Pandas DataFrame (`df`) using `pd.read_csv()` or `pd.read_excel()`.
3. A helper function `get_data_summary(df)` computes a compact summary: columns, dtypes, shape, a small sample, numeric stats, and missing-value info.
4. When the user asks a question, the app builds a prompt that includes this dataset summary plus the question, and sends it to Claude through the Anthropic SDK.
5. Claude returns a text response, which may also contain Python/Plotly code in a ```python block for visualizations.
6. The app displays the text answer and, if safe, executes the Plotly code to render interactive charts.

---

### 4. How do you make sure the Anthropic API key is not exposed in Git or the frontend?

**Answer (example):**
The key is never hard-coded. Instead:

- It is stored in a `.env` file as `ANTHROPIC_API_KEY=...`.
- `python-dotenv` loads this file at startup, and the app reads the key using `os.getenv("ANTHROPIC_API_KEY")`.
- `.gitignore` explicitly ignores `.env`, so it’s not committed to GitHub.
- The app only uses the key on the server side (inside the Python backend code); it is never sent to the browser or embedded in frontend JavaScript.

In a future React/Next.js architecture, the key would remain in server-side environment variables and only be accessed from API routes.

---

### 5. How do you prevent the app from running if the API key is missing?

**Answer (example):**
At startup, the app reads `ANTHROPIC_API_KEY` from the environment and stores:

- `ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")`
- `API_KEY_AVAILABLE = bool(ANTHROPIC_API_KEY)`

If the key is missing, the sidebar shows a warning (“Set ANTHROPIC_API_KEY in your .env file to enable AI features”) and the main chat area shows an info message instead of rendering the chat input. This means users can still upload data and see basic stats, but they can’t send questions to the AI until the key is configured correctly.

---

### 6. How do you control or limit Claude API costs in this app?

**Answer (example):**
There are two main cost-control mechanisms:

1. **Usage limiting per session:**  
   The app tracks `st.session_state.request_count` and caps it using `MAX_REQUESTS_PER_SESSION`. Once that limit is reached, the app displays a warning and stops sending further API calls. This prevents a single user/session from spamming the API.

2. **Response size limiting:**  
   Each Claude API call explicitly sets a relatively low `max_tokens` (e.g. 512) to limit the amount of generated text. Combined with a reasonable per-session call limit and a smaller model tier, this keeps the monthly spend under control (e.g. below \$5 for light usage).

In a production setup, you could add additional safeguards such as IP-based rate limiting or tracking approximate token usage in a small database.

---

### 7. How do you generate charts from natural language questions?

**Answer (example):**
The model is instructed via a **system prompt** to always:

- Use the dataframe variable `df`.
- Build a `fig` object using Plotly (e.g. `fig = px.bar(...)`).
- Use a dark theme (`template='plotly_dark'`) and a specific color palette.

When the response contains a ```python code block, the app extracts the code, performs basic safety checks to filter out dangerous statements, then executes it in a restricted environment where `df`, `pd`, `px`, `go`, and `st` are available. If the code successfully defines a `fig` variable, the app renders it using `st.plotly_chart(fig, use_container_width=True)`.

---

### 8. What security concerns exist around executing model-generated code, and how do you mitigate them?

**Answer (example):**
Executing arbitrary model-generated code is risky because it could access the filesystem, run shell commands, or otherwise abuse Python’s capabilities. To mitigate this:

- The app **filters** the code string for unsafe patterns such as `import`, `open(`, `os.`, `sys.`, `subprocess`, `eval(`, or `exec(`. If any of these are detected, the app refuses to execute the code and shows an error.
- The app runs the code with a **restricted globals dict** where `__builtins__` is reduced to a few safe built-ins (e.g. `len`, `range`) plus the necessary libraries (`pd`, `px`, `go`, `df`, `st`). This prevents accessing powerful built-ins like `open` or `__import__`.

In a more advanced production environment, this logic could be moved into a hardened sandbox or a separate process with strict timeouts and resource limits.

---

### 9. How does Streamlit manage session state in this project?

**Answer (example):**
Streamlit manages per-user state via `st.session_state`. In this app, we use it to persist:

- `messages`: the full chat history between the user and the AI.
- `df`: the uploaded Pandas DataFrame.
- `file_name`: the uploaded file’s name.
- `request_count`: how many Claude API calls have been made in this session.

This allows the app to maintain conversation context and dataset context across reruns, while still keeping the UI code declarative.

---

### 10. How would you migrate this project to a React + Next.js frontend?

**Answer (example):**
I would follow these steps:

1. **Define the Next.js architecture:**  
   Use the App Router with clearly separated concerns: pages for upload/analysis and components for `FileUpload`, `DatasetInfo`, `MetricCards`, `ChatPanel`, and `ChartView`.

2. **Expose a backend API:**  
   Either:
   - Wrap the existing Python logic (data loading, summary, and Claude calls) in a FastAPI/Flask backend and call it from Next.js API routes, or
   - Reimplement the core logic in Node/TypeScript directly in the Next.js API.

3. **Move UI responsibilities to React:**  
   Transform the current Streamlit UI into reusable React components, preserving the same layout and styling, but letting Next.js/Vercel handle client-side rendering and routing.

4. **Keep the API key on the server:**  
   Configure `ANTHROPIC_API_KEY` as a Vercel environment variable, and only use it from server-side code or API routes.

`GITHUB_ISSUES.md` already contains an epic issue and sub-issues for this migration.

---

### 11. What are some trade-offs of using Streamlit for the initial version?

**Answer (example):**
**Pros:**

- Extremely fast to prototype data apps.
- Tight integration with Python and data libraries like Pandas and Plotly.
- Minimal boilerplate – everything is in one file.

**Cons:**

- Limited control over frontend behavior and routing compared to React/Next.js.
- Harder to integrate with modern frontend ecosystems and design systems.
- Not natively supported on Vercel; deployment often requires separate hosting.

For an MVP data analytics tool, Streamlit was a good choice. For a production-ready, consumer-facing app, a dedicated React/Next.js frontend is more flexible.

---

### 12. How would you test this project?

**Answer (example):**
I would start by writing unit tests for:

- `get_data_summary(df)`: verify it returns the correct keys and sensible values for a small test DataFrame.
- Data loading: confirm that CSV and Excel files are parsed correctly and that errors are handled gracefully.

Later, I’d add:

- Tests for the Claude integration layer (mocking the Anthropic client).
- End-to-end tests of the API (after refactoring into a backend service).

Testing the Streamlit UI can be done either via Streamlit’s experimental testing tools or by separating logic from the UI and testing the logic modules directly.

---

### 13. How do you handle missing values and data types in this app?

**Answer (example):**
The app doesn’t mutate the uploaded data automatically, but it does **analyze** missing values and dtypes:

- The `get_data_summary(df)` function reports `dtypes` per column and a `missing` dict with counts of nulls per column.
- The numeric statistics (`df.describe()`) are shown in the UI to help spot outliers and issues.

If needed, further preprocessing (imputation, type conversion) could be added as a next step before sending summaries to the model, but the current version focuses on exploration and visualization rather than data cleaning.

---

### 14. How do you see this project evolving in the future?

**Answer (example):**
Short term:

- Improve security around code execution and add more robust cost controls.
- Add tests and better logging.

Medium term:

- Split the monolithic Streamlit file into separate modules for data handling, AI calls, and UI.
- Introduce a proper backend service (Python or Node) that can be reused by different frontends.

Long term:

- Full React + Next.js frontend deployed on Vercel.
- User accounts, saved analyses, and richer visualization templates.
- More advanced analytics, such as forecasting and anomaly detection.

All of these steps are partially captured in the GitHub issue list included in `GITHUB_ISSUES.md`.

