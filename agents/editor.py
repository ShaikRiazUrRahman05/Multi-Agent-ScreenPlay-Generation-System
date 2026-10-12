from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from workflow.states import ScriptState
from memory.vector_memory import VectorMemory

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.6)
memory = VectorMemory()

# Prompt for Editor Agent
EDITOR_PROMPT = ChatPromptTemplate.from_messages([
    ("system", 
     "You are an experienced screenplay editor. "
     "Your task is to refine and unify the story into a coherent screenplay. "
     "Keep the characters consistent, dialogues natural, and scenes flowing logically. "
     "Format it like a screenplay, with Scene headings, Character names in uppercase, and dialogues properly indented."),
    ("human", 
     "Outline:\n{outline}\n\n"
     "Characters:\n{characters}\n\n"
     "Dialogues:\n{dialogues}\n\n"
     "Polish this into a final screenplay draft.")
])

def editor_agent(state: ScriptState) -> dict:
    recall = memory.recall("story continuity, past edits, and characters")

    chain = EDITOR_PROMPT | llm
    response = chain.invoke({
        "outline": state["outline"],
        "characters": state["characters"],
        "dialogues": "\n".join(state["dialogues"]),
        "recall": recall
    })

    final_script = response.content
    memory.save("final_script", final_script)

    return {"final_script": final_script}