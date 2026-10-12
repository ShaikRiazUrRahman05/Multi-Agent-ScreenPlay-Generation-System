# Multi-Agent Screenplay Generation System

An AI-powered screenplay generation platform that transforms a simple movie idea into a structured screenplay through a coordinated pipeline of specialized AI agents.

Built with **Python, FastAPI, LangGraph, OpenAI, MongoDB, and React**, the system separates story planning, character development, dialogue writing, and screenplay refinement into distinct stages.

## Overview

Creating a screenplay involves more than generating text. It requires a coherent plot, consistent characters, engaging dialogue, and a polished narrative.

This project addresses that challenge through a multi-agent workflow in which each agent focuses on a specific creative responsibility. LangGraph coordinates the workflow, while language models generate and refine the screenplay at each stage.

## Key Features

- **Multi-Agent Workflow:** Specialized agents collaborate to develop and refine a screenplay.
- **Plot Generation:** Develops the initial story structure from a user-provided movie idea.
- **Character Development:** Builds character profiles and motivations that support the story.
- **Dialogue Generation:** Produces dialogue aligned with the characters and narrative.
- **Screenplay Refinement:** Reviews and improves the generated content for consistency and readability.
- **Persistent Memory:** Uses vector-based memory to support relevant context retrieval across interactions.
- **User Authentication:** Provides registration, login, and profile management backed by MongoDB.
- **Multiple Frontends:** Includes a lightweight JavaScript interface and a React-based application.

## Architecture

The application follows a modular architecture with a dedicated backend, agent workflow, memory layer, database integration, and frontend interfaces.

```text
                    User Idea
                        |
                        v
                 FastAPI Backend
                        |
                        v
                LangGraph Workflow
                        |
                        v
                 Plotter Agent
                        |
                        v
                Character Agent
                        |
                        v
                 Dialogue Agent
                        |
                        v
                  Editor Agent
                        |
                        v
               Refined Screenplay
                        |
                        v
                  User Interface
```

The workflow is organized into specialized stages, making the system easier to extend, test, and maintain.

## Tech Stack

| Component | Technologies |
|---|---|
| Backend | Python, FastAPI |
| Agent Orchestration | LangGraph |
| Language Models | OpenAI API |
| Memory | Vector-based retrieval |
| Database | MongoDB |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS and component-based UI |
| Additional Interface | HTML, CSS, JavaScript |

## Project Structure

```text
.
├── agents/
│   ├── plotter.py
│   ├── character.py
│   ├── dialogue.py
│   └── editor.py
├── core/
│   └── security.py
├── db/
│   └── mongo.py
├── frontend/
│   └── src/
├── memory/
│   └── vector_memory.py
├── routers/
│   ├── auth.py
│   └── profile.py
├── schemas/
│   └── user.py
├── static/
├── workflow/
│   ├── graph.py
│   └── states.py
├── main.py
└── requirements.txt
```

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Python 3.10 or a compatible version for the dependencies
- Node.js and npm
- MongoDB
- An OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/ShaikRiazUrRahman05/Multi-Agent-ScreenPlay-Generation-System.git
cd Multi-Agent-ScreenPlay-Generation-System
```

### 2. Set up the backend

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

On Windows, activate it using:

```bash
venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the variables required by your application.

For example:

```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
```

Use the exact variable names expected by your implementation. Keep real credentials private and never commit your `.env` file.

### 4. Start the backend

```bash
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` to access the backend.

If enabled, interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 5. Run the React frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Use the local URL printed by Vite to access the frontend.

The repository also contains a lightweight interface under `static/`; follow the backend configuration for accessing it.

## How It Works

1. **Input:** The user submits a short movie concept.
2. **Plot generation:** The Plotter Agent develops the story direction.
3. **Character development:** The Character Agent establishes the characters and their motivations.
4. **Dialogue writing:** The Dialogue Agent creates dialogue consistent with the narrative.
5. **Editing:** The Editor Agent refines the generated screenplay.
6. **Output:** The application presents the resulting screenplay through its interface.

LangGraph manages the workflow and state transitions between the stages, while the memory layer supports contextual retrieval where configured.

