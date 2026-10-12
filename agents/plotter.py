# agents/plotter.py
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from workflow.states import ScriptState
from dotenv import load_dotenv
from memory.vector_memory import VectorMemory

load_dotenv()

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
memory = VectorMemory()

# Define the prompt
PLOTTER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a creative screenplay plotter. Generate structured story outlines with clear scenes."),
    ("human", "User request: {user_input}\n\nCreate a high-level story arc with scenes.")
])

def plotter_agent(state: ScriptState) -> dict:
    chain = PLOTTER_PROMPT | llm
    response = chain.invoke({"user_input": state["user_input"]})

    outline = response.content
    memory.save("outline", outline)

    return {"outline": outline}