<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1IBF42mHHfX4deDtT29DrzSFD57L0IrDd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend (FastAPI)

This repo also includes a Python FastAPI backend under [../backend](../backend).

**Prerequisites:** Python 3.11+

### Windows (PowerShell)

From the repo root:

1. Create + activate venv (first time only):
   - `py -m venv .venv`
   - `./.venv/Scripts/Activate.ps1`
2. Install backend deps:
   - `python -m pip install -r backend/requirements.txt`
3. Configure keys in [../backend/.env](../backend/.env):
   - `LLM_PROVIDER=groq`
   - `GROQ_API_KEY=...`
   - `GROQ_MODEL=llama-3.1-8b-instant` (or another Groq-supported model)
4. Start the backend:
   - `python -m uvicorn main:app --app-dir backend --reload --port 8000`

### Notes

- If you see “Groq SDK is not installed”, it almost always means you started Uvicorn from a different Python install than your venv. The command above forces the venv interpreter.
- The backend loads env vars from `backend/.env` regardless of working directory.
