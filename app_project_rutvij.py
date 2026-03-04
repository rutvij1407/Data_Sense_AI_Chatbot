import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()

<<<<<<< HEAD
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
API_KEY_AVAILABLE = bool(ANTHROPIC_API_KEY)

=======
>>>>>>> 0ea113ce920599aa1623f30bde40ae60e34e6f08
st.set_page_config(
    page_title="DataSense AI | Analytics Chatbot",
    page_icon="🔴",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
    }
    
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        border-right: 2px solid #dc143c;
    }
    
    h1 {
        color: #dc143c !important;
        font-family: 'Helvetica Neue', sans-serif;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(220, 20, 60, 0.3);
    }
    
    h2, h3 {
        color: #ff6b6b !important;
        font-family: 'Helvetica Neue', sans-serif;
    }
    
    [data-testid="stMetricValue"] {
        color: #dc143c !important;
        font-size: 2rem !important;
        font-weight: 700 !important;
    }
    
    [data-testid="stMetricLabel"] {
        color: #ffffff !important;
    }
    
    .stButton > button {
        background: linear-gradient(90deg, #dc143c 0%, #ff4757 100%);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 10px 25px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 20, 60, 0.6);
    }
    
    [data-testid="stChatMessage"] {
        background-color: rgba(26, 26, 46, 0.8) !important;
        border-radius: 15px;
        border-left: 4px solid #dc143c;
        padding: 15px;
        margin: 10px 0;
    }
    
    .stTextInput > div > div > input {
        background-color: #1a1a2e;
        color: white;
        border: 2px solid #dc143c;
        border-radius: 10px;
    }
    
    [data-testid="stFileUploader"] {
        background-color: rgba(26, 26, 46, 0.5);
        border: 2px dashed #dc143c;
        border-radius: 15px;
        padding: 20px;
    }
    
    .stDataFrame {
        border: 2px solid #dc143c;
        border-radius: 10px;
    }
    
    .streamlit-expanderHeader {
        background-color: #1a1a2e;
        color: #dc143c !important;
        border-radius: 10px;
    }
    
    .stSuccess {
        background-color: rgba(220, 20, 60, 0.2);
        border-left: 4px solid #dc143c;
    }
    
    .metric-card {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid #dc143c;
        box-shadow: 0 4px 15px rgba(220, 20, 60, 0.2);
        text-align: center;
        margin: 10px 0;
    }
    
    .metric-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #dc143c;
    }
    
    .metric-label {
        font-size: 1rem;
        color: #a0a0a0;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
    
    hr {
        border: 1px solid #dc143c;
        opacity: 0.3;
    }
</style>
""", unsafe_allow_html=True)

<<<<<<< HEAD
MAX_REQUESTS_PER_SESSION = 30

=======
>>>>>>> 0ea113ce920599aa1623f30bde40ae60e34e6f08
if "messages" not in st.session_state:
    st.session_state.messages = []
if "df" not in st.session_state:
    st.session_state.df = None
if "file_name" not in st.session_state:
    st.session_state.file_name = None
<<<<<<< HEAD
if "request_count" not in st.session_state:
    st.session_state.request_count = 0
=======
>>>>>>> 0ea113ce920599aa1623f30bde40ae60e34e6f08

def get_data_summary(df):
    """Generate a concise summary of the dataframe for the AI"""
    summary = {
        "columns": list(df.columns),
        "shape": df.shape,
        "dtypes": df.dtypes.astype(str).to_dict(),
        "sample": df.head(3).to_dict(),
        "numeric_stats": df.describe().to_dict() if len(df.select_dtypes(include=['number']).columns) > 0 else {},
        "missing": df.isnull().sum().to_dict()
    }
    return str(summary)

def create_metric_card(label, value, icon):
    """Create a styled metric card"""
    return f"""
    <div class="metric-card">
        <div style="font-size: 2rem; margin-bottom: 10px;">{icon}</div>
        <div class="metric-value">{value}</div>
        <div class="metric-label">{label}</div>
    </div>
    """

with st.sidebar:
<<<<<<< HEAD
    if not API_KEY_AVAILABLE:
        st.warning("Set ANTHROPIC_API_KEY in your .env file to enable AI features.")
=======
>>>>>>> 0ea113ce920599aa1623f30bde40ae60e34e6f08
    st.markdown("""
    <div style="text-align: center; padding: 20px 0;">
        <h1 style="font-size: 2.5rem; margin: 0;">🔴</h1>
        <h2 style="color: #dc143c; margin: 0;">DataSense AI</h2>
        <p style="color: #666; font-size: 0.9rem;">Intelligent Data Analytics</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    st.markdown("### 📁 Upload Dataset")
    uploaded_file = st.file_uploader(
        "Drop your CSV or Excel file",
        type=["csv", "xlsx", "xls"],
        help="Supported formats: CSV, Excel"
    )
    
    if uploaded_file:
        try:
            if uploaded_file.name.endswith('.csv'):
                st.session_state.df = pd.read_csv(uploaded_file)
            else:
                st.session_state.df = pd.read_excel(uploaded_file)
            st.session_state.file_name = uploaded_file.name
            st.success(f"✅ Loaded successfully!")
        except Exception as e:
            st.error(f"Error loading file: {e}")
    
    if st.session_state.df is not None:
        st.markdown("---")
        st.markdown("### 📊 Dataset Info")
        st.markdown(f"**File:** {st.session_state.file_name}")
        st.markdown(f"**Rows:** {len(st.session_state.df):,}")
        st.markdown(f"**Columns:** {len(st.session_state.df.columns)}")
        
        with st.expander("View Columns"):
            for col in st.session_state.df.columns:
                dtype = st.session_state.df[col].dtype
                st.markdown(f"• **{col}** ({dtype})")
    
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #666; font-size: 0.8rem;">
        Built by Rutvij<br>
        Powered by Claude AI
    </div>
    """, unsafe_allow_html=True)

st.markdown("""
<div style="text-align: center; padding: 20px 0;">
    <h1>🤖 DataSense AI</h1>
    <p style="color: #a0a0a0; font-size: 1.2rem;">
        Your Intelligent Data Analytics Assistant
    </p>
</div>
""", unsafe_allow_html=True)

if st.session_state.df is not None:
    df = st.session_state.df
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(create_metric_card("Total Rows", f"{len(df):,}", "📊"), unsafe_allow_html=True)
    with col2:
        st.markdown(create_metric_card("Columns", len(df.columns), "📋"), unsafe_allow_html=True)
    with col3:
        missing = df.isnull().sum().sum()
        st.markdown(create_metric_card("Missing Values", f"{missing:,}", "⚠️"), unsafe_allow_html=True)
    with col4:
        numeric_cols = len(df.select_dtypes(include=['number']).columns)
        st.markdown(create_metric_card("Numeric Cols", numeric_cols, "🔢"), unsafe_allow_html=True)
    
    st.markdown("---")
    
    with st.expander("📋 Preview Dataset", expanded=False):
        st.dataframe(
            df.head(10),
            use_container_width=True,
            hide_index=True
        )
    
    if len(df.select_dtypes(include=['number']).columns) > 0:
        with st.expander("📈 Quick Statistics", expanded=False):
            st.dataframe(
                df.describe().round(2),
                use_container_width=True
            )
    
    st.markdown("---")
    
    st.markdown("""
    <h3 style="text-align: center;">💬 Ask Questions About Your Data</h3>
    <p style="text-align: center; color: #666;">
        Try: "Show a bar chart of...", "What's the average...", "Find correlations..."
    </p>
    """, unsafe_allow_html=True)

else:
    st.markdown("""
    <div style="text-align: center; padding: 50px 20px;">
        <h2 style="color: #dc143c;">Welcome to DataSense AI</h2>
        <p style="color: #a0a0a0; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
            Upload your dataset to get started. I can help you analyze data, 
            create visualizations, find patterns, and answer questions about your data.
        </p>
        <br>
        <p style="color: #666;">
            👈 Use the sidebar to upload a CSV or Excel file
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <div style="font-size: 2rem;">📊</div>
            <h4 style="color: #dc143c;">Data Analysis</h4>
            <p style="color: #666; font-size: 0.9rem;">Get instant insights and statistics from your data</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <div style="font-size: 2rem;">📈</div>
            <h4 style="color: #dc143c;">Visualizations</h4>
            <p style="color: #666; font-size: 0.9rem;">Create beautiful charts with natural language</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <div style="font-size: 2rem;">🤖</div>
            <h4 style="color: #dc143c;">AI Powered</h4>
            <p style="color: #666; font-size: 0.9rem;">Powered by Claude AI for intelligent responses</p>
        </div>
        """, unsafe_allow_html=True)

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if "figure" in message:
            st.plotly_chart(message["figure"], use_container_width=True)

<<<<<<< HEAD
if not API_KEY_AVAILABLE:
    st.info("Set ANTHROPIC_API_KEY in your .env file to start asking AI questions about your data.")
else:
    if st.session_state.request_count >= MAX_REQUESTS_PER_SESSION:
        st.warning("You have reached the free AI usage limit for this session. Please restart the app to continue.")
    else:
        prompt = st.chat_input("Ask about your data...")
        if prompt:
            if st.session_state.df is None:
                st.warning("⚠️ Please upload a dataset first!")
            else:
                st.session_state.messages.append({"role": "user", "content": prompt})
                with st.chat_message("user"):
                    st.markdown(prompt)
                
                with st.chat_message("assistant"):
                    with st.spinner("🔍 Analyzing..."):
                        try:
                            df = st.session_state.df
                            data_summary = get_data_summary(df)
                            
                            system_prompt = """You are DataSense AI, a professional data analyst assistant.
=======
if prompt := st.chat_input("Ask about your data..."):
    if st.session_state.df is None:
        st.warning("⚠️ Please upload a dataset first!")
    else:
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        with st.chat_message("assistant"):
            with st.spinner("🔍 Analyzing..."):
                try:
                    df = st.session_state.df
                    data_summary = get_data_summary(df)
                    
                    system_prompt = """You are DataSense AI, a professional data analyst assistant.
>>>>>>> 0ea113ce920599aa1623f30bde40ae60e34e6f08

RULES:
1. Be concise and professional
2. When asked for visualizations, provide Python code using plotly
3. Always use the variable name 'df' for the dataframe
4. Store the figure in a variable called 'fig'
5. Use the template='plotly_dark' for dark theme charts
6. Use color_discrete_sequence=['dc143c', 'ff6b6b', 'ff8e8e'] for colors
7. Format code in ```python blocks
8. Keep explanations brief but insightful

EXAMPLE CHART CODE:
```python
fig = px.bar(df, x='column', y='value', template='plotly_dark',
             color_discrete_sequence=['dc143c'])
fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
```"""
<<<<<<< HEAD
                            
                            client = Anthropic(api_key=ANTHROPIC_API_KEY)
                            
                            response = client.messages.create(
                                model="claude-sonnet-4-20250514",
                                max_tokens=512,
                                system=system_prompt,
                                messages=[
                                    {"role": "user", "content": f"Dataset summary:\n{data_summary}\n\nQuestion: {prompt}"}
                                ]
                            )
                            
                            st.session_state.request_count += 1
                            
                            answer = response.content[0].text
                            st.markdown(answer)
                            
                            fig = None
                            if "```python" in answer:
                                code = answer.split("```python")[1].split("```")[0]
                                unsafe_keywords = [
                                    "import ", "import\t", "import\n",
                                    "open(", "os.", "sys.", "__import__",
                                    "subprocess", "eval(", "exec("
                                ]
                                if any(kw in code for kw in unsafe_keywords):
                                    st.error("⚠️ Refused to run unsafe chart code generated by AI.")
                                else:
                                    try:
                                        exec_globals = {
                                            "__builtins__": {"len": len, "range": range},
                                            "pd": pd, 
                                            "px": px, 
                                            "go": go, 
                                            "df": df,
                                            "st": st
                                        }
                                        exec(code, exec_globals)
                                        if "fig" in exec_globals:
                                            fig = exec_globals["fig"]
                                            st.plotly_chart(fig, use_container_width=True)
                                    except Exception as e:
                                        st.error(f"⚠️ Could not render chart: {e}")
                            
                            message_data = {"role": "assistant", "content": answer}
                            if fig:
                                message_data["figure"] = fig
                            st.session_state.messages.append(message_data)
                            
                        except Exception as e:
                            st.error(f"❌ Error: {e}")
=======
                    
                    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
                    
                    response = client.messages.create(
                        model="claude-sonnet-4-20250514",
                        max_tokens=1024,
                        system=system_prompt,
                        messages=[
                            {"role": "user", "content": f"Dataset summary:\n{data_summary}\n\nQuestion: {prompt}"}
                        ]
                    )
                    
                    answer = response.content[0].text
                    st.markdown(answer)
                    
                    fig = None
                    if "```python" in answer:
                        code = answer.split("```python")[1].split("```")[0]
                        try:
                            exec_globals = {
                                "pd": pd, 
                                "px": px, 
                                "go": go, 
                                "df": df,
                                "st": st
                            }
                            exec(code, exec_globals)
                            if "fig" in exec_globals:
                                fig = exec_globals["fig"]
                                st.plotly_chart(fig, use_container_width=True)
                        except Exception as e:
                            st.error(f"⚠️ Could not render chart: {e}")
                    
                    message_data = {"role": "assistant", "content": answer}
                    if fig:
                        message_data["figure"] = fig
                    st.session_state.messages.append(message_data)
                    
                except Exception as e:
                    st.error(f"❌ Error: {e}")
>>>>>>> 0ea113ce920599aa1623f30bde40ae60e34e6f08
