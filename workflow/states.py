from typing import TypedDict, List, Optional, Literal

class ScriptState(TypedDict, total=False):
    user_input: str
    outline: Optional[str]
    characters: Optional[str]
    dialogues: Optional[List[str]]
    final_script: Optional[str]

    user_action: Optional[Literal["full_run", "rewrite_scene", "rewrite_characters", "rewrite_plot"]]
    target_scene: Optional[int]  # e.g., rewrite scene 4