from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, embed_user, embed_issue, recommend, scan
import app.models

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(embed_user.router)
app.include_router(embed_issue.router)
app.include_router(recommend.router)
app.include_router(scan.router)


@app.get("/")
def home():
    return {
        "message": "OSS Copilot Backend Running"
    }