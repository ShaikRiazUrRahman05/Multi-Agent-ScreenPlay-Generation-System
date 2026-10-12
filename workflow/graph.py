from langgraph.graph import StateGraph, START, END
from workflow.states import ScriptState
from agents.plotter import plotter_agent
from agents.character import character_agent
from agents.dialogue import dialogue_agent
from agents.editor import editor_agent

def route_after_entry(state: ScriptState):
    """Decide initial node based on requested action"""
    action = state.get("user_action")
    if action == "rewrite_scene":
        return "Dialogue"      # run Dialogue -> Editor
    if action == "rewrite_characters":
        return "Character"     # run Character -> Dialogue -> Editor
    if action == "rewrite_plot":
        return "Plotter"       # run full chain from Plotter
    return "Plotter"           # default full pipeline

def build_workflow():
    workflow = StateGraph(ScriptState)

    # Nodes
    workflow.add_node("Plotter", plotter_agent)
    workflow.add_node("Character", character_agent)
    workflow.add_node("Dialogue", dialogue_agent)
    workflow.add_node("Editor", editor_agent)


    workflow.add_conditional_edges(START, route_after_entry, {
        "Dialogue": "Dialogue",
        "Character": "Character",
        "Plotter": "Plotter"
    })

    # Normal edges
    workflow.add_edge("Plotter", "Character")
    workflow.add_edge("Character", "Dialogue")
    workflow.add_edge("Dialogue", "Editor")
    workflow.add_edge("Editor", END)

    return workflow.compile()
