from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import users

app = FastAPI(title="Financial Tracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api"

app.include_router(users.router, prefix=PREFIX)


@app.get("/health")
def health():
    return {"status": "ok"}
