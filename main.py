# main.py
from workflow.graph import build_workflow
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set")

workflow_app = build_workflow()

api = FastAPI(title="Cinema Agent API")
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (Auth & Profile)
from routers.auth import router as auth_router
from routers.profile import router as profile_router

api.include_router(auth_router)
api.include_router(profile_router)

class RunRequest(BaseModel):
    user_input: str
    user_action: str | None = None  # full_run | rewrite_scene | rewrite_characters | rewrite_plot
    target_scene: int | None = None

@api.post("/api/run")
def run(req: RunRequest):
    try:
        state_input = {
            "user_input": req.user_input,
            "user_action": req.user_action or "full_run",
        }
        if req.target_scene:
            state_input["target_scene"] = req.target_scene

        result = workflow_app.invoke(state_input)

        # Normalize outputs for UI
        return {
            "outline": result.get("outline", ""),
            "characters": result.get("characters", ""),
            "dialogues": result.get("dialogues", []),
            "final_script": result.get("final_script", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve static frontend
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

api.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

@api.get("/")
def index():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not found. Please build static files."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:api", host="0.0.0.0", port=8000, reload=False)