from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
import asyncio
import os
import httpx

from app.database import get_db
from app.models.user import User
from app.models.repository import Repo
from app.auth.jwt import create_access_token

router = APIRouter()

CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

@router.get("/auth/github")
async def github_auth(code: str, db: Session = Depends(get_db)):

    async with httpx.AsyncClient() as client:

        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code
        },
            headers={
            "Accept": "application/json"
        }
        )

        access_token = token_response.json().get("access_token")

        if not access_token:
            return {"error": "Failed to get access token"}
        
        auth_headers = {
                "Authorization" : f"Bearer {access_token}"
            }

        user_response, repos_response = await asyncio.gather(
            client.get("https://api.github.com/user", headers=auth_headers),
            client.get("https://api.github.com/user/repos", headers = auth_headers))

    user_data = user_response.json()
    repos_data = repos_response.json()

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

        for repo_data in repos_data:

            existing_repo = (
                db.query(Repo)
                .filter(Repo.github_repo_id == repo_data["id"])
                .first()
            )

            if not existing_repo:

                new_repo = Repo(
                    github_repo_id = repo_data["id"],
                    user_id = new_user.id,
                    owner_name=repo_data["owner"]["login"],
                    repo_url = repo_data["html_url"],
                    repo_name = repo_data["name"],
                    description = repo_data.get("description"),
                    language = repo_data.get("language"),
                    stars = repo_data["stargazers_count"],
                    forks = repo_data["forks_count"]

                )

                db.add(new_repo)

            else:

                existing_repo.repo_name = repo_data["name"]
                existing_repo.repo_url = repo_data["html_url"]

                existing_repo.owner_name = (
                    repo_data["owner"]["login"]
                )

                existing_repo.description = repo_data.get(
                    "description"
                )

                existing_repo.language = repo_data.get(
                    "language"
                )

                existing_repo.stars = repo_data[
                    "stargazers_count"
                ]

                existing_repo.forks = repo_data[
                    "forks_count"
                ]

        db.commit()
        user_id = str(new_user.id)
        jwt_token = create_access_token(user_id)

    except Exception as e:
        db.rollback()
        raise e
    

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": str(new_user.id),
            "username": new_user.username,
            "avatar_url": new_user.avatar_url,
            "public_repos": user_data["public_repos"],
            "followers": user_data["followers"],
        }
    }
