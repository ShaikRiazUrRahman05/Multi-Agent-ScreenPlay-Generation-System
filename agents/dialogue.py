from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from workflow.states import ScriptState
from dotenv import load_dotenv  
from memory.vector_memory import VectorMemory
import re

load_dotenv()

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
memory = VectorMemory()

# Prompt for Dialogue Agent
DIALOGUE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a screenplay dialogue writer. "
               "Expand the story outline into actual scene dialogues. "
               "Ensure each character speaks consistently with their role and personality."),
    ("human",
     "Story outline:\n{outline}\n\n"
     "Characters:\n{characters}\n\n"
     "{user_prompt}\n\n"
     "Relevant prior context (may be empty):\n{recall}")
])

def dialogue_agent(state: ScriptState) -> dict:
    recall = memory.recall("prior dialogues and character motivations")

    # Determine user instruction
    is_rewrite = state.get("user_action") == "rewrite_scene" and state.get("target_scene") is not None
    scene_no = state.get("target_scene") if is_rewrite else None
    if is_rewrite:
        user_prompt = f"Rewrite Scene {scene_no} only. Keep other scenes intact and unchanged. Keep scene numbering consistent."
    else:
        user_prompt = "Write dialogues for all scenes. Format clearly as Scene 1, Scene 2, etc."

    # Prefer state context; fallback to vector memory
    outline = state.get("outline") or memory.recall("outline") or memory.recall("story outline")
    characters = state.get("characters") or memory.recall("characters") or memory.recall("character descriptions")

    chain = DIALOGUE_PROMPT | llm
    response = chain.invoke({
        "outline": outline or "",
        "characters": characters or "",
        "recall": recall,
        "user_prompt": user_prompt
    })

    new_dialogue_text = response.content

    def split_scenes(text: str) -> list[tuple[int, str]]:
        # Split text into (scene_number, content) tuples using common headings
        lines = text.splitlines()
        chunks: list[tuple[int, list[str]]] = []
        current_num: int | None = None
        current_buf: list[str] = []
        scene_header = re.compile(r"^\s*(?:#{1,3}\s*)?(?:\*\*)?\s*Scene\s+(\d+)\b", re.IGNORECASE)
        for line in lines:
            m = scene_header.match(line)
            if m:
                # flush previous
                if current_num is not None:
                    chunks.append((current_num, current_buf))
                current_num = int(m.group(1))
                current_buf = [line]
            else:
                current_buf.append(line)
        if current_num is not None:
            chunks.append((current_num, current_buf))
        # If none detected, return single chunk 0
        if not chunks:
            return [(0, text.splitlines())]
        return [(n, "\n".join(buf).strip()) for n, buf in chunks]

    if is_rewrite and scene_no is not None:
        # Merge with previous dialogues to preserve context
        prior_dialogues_text = memory.recall("dialogues")
        prior_chunks = split_scenes(prior_dialogues_text) if prior_dialogues_text else []
        new_chunks = split_scenes(new_dialogue_text)

        # Take rewritten scene from new_chunks; otherwise keep old
        merged_map: dict[int, str] = {n: c for n, c in prior_chunks}
        for n, c in new_chunks:
            if n == int(scene_no):
                merged_map[n] = c

        # Maintain numeric order
        scene_numbers = sorted(merged_map.keys()) if merged_map else [int(scene_no)]
        merged_list = [merged_map[n] for n in scene_numbers]
        merged_text = "\n\n".join(merged_list).strip()

        dialogues = merged_list
        memory.save("dialogues", merged_text)
    else:
        dialogues = new_dialogue_text.split("\n\n")
        memory.save("dialogues", new_dialogue_text)

    # Include outline/characters so downstream Editor has them
    return {"dialogues": dialogues, "outline": outline, "characters": characters}
