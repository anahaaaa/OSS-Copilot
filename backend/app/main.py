from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv
from app.database import SessionLocal
from app.models.user import User
from app.models.repository import Repo
from app.models.issue import Issue
from app.models.issue_embedding import IssueEmbedding
from app.models.repo_chunk import RepoChunk
from app.models.scan_job import ScanJob
from app.models.user_feedback import UserFeedback

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")


@app.get("/")
def home():
    return {
        "message": "OSS Copilot Backend Running"
    }


@app.get("/auth/github")
def github_auth(code: str):

    token_url = "https://github.com/login/oauth/access_token"

    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code
    }

    headers = {
        "Accept": "application/json"
    }

    response = requests.post(
        token_url,
        json=payload,
        headers=headers
    )

    access_token = response.json().get("access_token")

    if not access_token:
        return {"error": "Failed to get access token"}

    user_response = requests.get(
        "https://api.github.com/user",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    repos_response = requests.get(
        "https://api.github.com/user/repos",
        headers = {
            "Authorization" : f"Bearer {access_token}"
        }
    )

    user_data = user_response.json()
    repos_data = repos_response.json()

    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.github_id == user_data["id"])
            .first()
        )

        if not existing_user:

            new_user = User(
                github_id = user_data["id"],
                username=user_data["login"],
                avatar_url=user_data.get("avatar_url"),
                bio=user_data.get("bio")
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)


        else:

            existing_user.username = user_data["login"]
            existing_user.avatar_url = user_data.get("avatar_url")
            existing_user.bio = user_data.get("bio")

            db.commit()

            new_user = existing_user

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()

    return {
        "user_id": str(new_user.id),
        "user": user_data,
        "repos": repos_data
    }