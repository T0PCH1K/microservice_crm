from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.logs import router as logs_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(logs_router)
