from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from workflow.states import ScriptState
from dotenv import load_dotenv
from memory.vector_memory import VectorMemory

load_dotenv()

# Initialize LLM (reuse config everywhere for consistency)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
memory = VectorMemory()

# Prompt for the Character Agent
CHARACTER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a screenplay character developer. "
               "Your task is to extract the key characters from the outline "
               "and describe their roles, motivations, and personalities in detail."),
    ("human", "Story outline:\n{outline}\n\nGenerate character descriptions.")
])

def character_agent(state: ScriptState) -> dict:
    recall = memory.recall("outline and prior characters")

    # Support rewrite paths where outline may not be present in input state
    outline = state.get("outline") or memory.recall("story outline from previous run")

    chain = CHARACTER_PROMPT | llm
    response = chain.invoke({
        "outline": outline or "",
        "recall": recall
    })

    characters = response.content
    memory.save("characters", characters)

    # Return outline as well so downstream nodes have it in rewrite paths
    return {"characters": characters, "outline": outline}