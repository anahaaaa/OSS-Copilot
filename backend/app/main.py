from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
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
from datetime import datetime
from app.models.user_embedding import UserEmbedding

from app.services.embedding_service import embed_text
from app.services.issue_service import create_issue_text
from app.services.skill_service import extract_skills

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

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()

    return {
        "user_id": user_id,
        "user": user_data,
        "repos": repos_data
    }

@app.post("/scan")
def scan_repository(
        owner: str,
        repo: str
    ):


    db = SessionLocal()
    try: 
        repo_record = (
            db.query(Repo)
            .filter(
                Repo.owner_name == owner,
                Repo.repo_name == repo
            )
            .first()
        )

        if not repo_record:

            repo_meta = requests.get(
                f"https://api.github.com/repos/{owner}/{repo}"
            ).json()


            if "id" not in repo_meta:
                return {
                    "error": "Repository not found"
                }
            new_repo = Repo(

            
            github_repo_id=repo_meta["id"],
            user_id=None,   # because this is an external repo

            owner_name=owner,
            repo_name=repo,

            repo_url=repo_meta["html_url"],

            description=repo_meta.get("description"),

            language=repo_meta.get("language"),

            stars=repo_meta["stargazers_count"],

            forks=repo_meta["forks_count"]
        )

            db.add(new_repo)
            db.commit()
            db.refresh(new_repo)

            repo_record = new_repo
        

        issue_response = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/issues",
        params={
                "state":"open",
                "per_page": 100
            }
        )
        issues_data = issue_response.json()

        for issue_data in issues_data:

            if "pull_request" in issue_data:
                continue

            exisiting_issue = (
                db.query(Issue)
                .filter(
                    Issue.github_issue_id == issue_data["id"]
                ).first()
            )

            labels = [label["name"] for label in issue_data["labels"]]

            if not exisiting_issue:

                new_issue = Issue(
                github_issue_id=issue_data["id"],

                repo_id=repo_record.id,

                title=issue_data["title"],

                body=issue_data.get("body"),

                labels=labels,

                issue_url=issue_data["html_url"],

                comments_count=issue_data["comments"],

                is_open=(
                    issue_data["state"] == "open"
                ),

                github_created_at=datetime.fromisoformat(
                    issue_data["created_at"].replace("Z", "+00:00")
                ),

                github_updated_at=datetime.fromisoformat(
                    issue_data["updated_at"].replace("Z", "+00:00")
                )
            )
                
                db.add(new_issue)
                
            else:

                continue
                    
        db.commit()

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()

    return {
        "message": "Issues synced",
        "repository": f"{owner}/{repo}",
        "count": len(issues_data)
    }

@app.post("/embed")
def embed_issues():

    db = SessionLocal()

    try:

        issues = db.query(Issue).all()

        embedded_count = 0

        for issue in issues:

            existing_embedding = (
                db.query(IssueEmbedding)
                .filter(
                    IssueEmbedding.issue_id == issue.id
                )
                .first()
            )

            if existing_embedding:
                continue

            issue_text = create_issue_text(issue)

            vector = embed_text(issue_text)

            issue_embedding = IssueEmbedding(
                issue_id=issue.id,
                embedding=vector
            )

            db.add(issue_embedding)

            embedded_count += 1

        db.commit()

        return {
            "message": "Embeddings generated",
            "count": embedded_count
        }

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()

@app.post("/users/{user_id}/embed")
def embed_user(user_id: str):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            return {
                "error": "User not found"
            }

        repositories = (
            db.query(Repo)
            .filter(Repo.user_id == user.id)
            .all()
        )

        repo_descriptions = [
            repo.description
            for repo in repositories
            if repo.description
        ]

        if not repo_descriptions:
            return {
                "error": "No repository descriptions found"
            }

        skills_data = extract_skills(
            repo_descriptions[:5]
        )

        user.skill_profile = skills_data

        skills_text = f"""
Skills:
{", ".join(skills_data["skills"])}

Domains:
{", ".join(skills_data["domains"])}

Experience:
{skills_data["experience_level"]}
"""

        vector = embed_text(skills_text)
        existing_embedding = (
            db.query(UserEmbedding)
            .filter(UserEmbedding.user_id == user.id)
            .first()
        )
        if not existing_embedding:

            new_embedding = UserEmbedding(
                user_id=user.id,
                embedding=vector
            )

            db.add(new_embedding)

        else:

            existing_embedding.embedding = vector

        db.commit()

        return {
            "message": "User profile embedded",
            "skills": skills_data
        }

    except Exception as e:

        db.rollback()
        raise e

    finally:

        db.close()


@app.get("/users/{user_id}/recommendations")
def get_recommendations(user_id: str):

    db = SessionLocal()

    try:

        user_embedding = (
            db.query(UserEmbedding)
            .filter(
                UserEmbedding.user_id == user_id
            )
            .first()
        )


        if not user_embedding:

            return {
                "error": "User embedding not found"
            }

        vector_str = "[" + ",".join(
            map(str, user_embedding.embedding.tolist())
        ) + "]"

        print(vector_str[:200])
        results = db.execute(
            text("""
            SELECT
                issues.title,
                issues.issue_url,
                issues.labels,

                issue_embeddings.embedding
                <=> CAST(:user_embedding AS vector)
                AS distance

            FROM issue_embeddings
            JOIN issues
                ON issues.id = issue_embeddings.issue_id

            ORDER BY distance
            LIMIT 10
            """),
            {
                "user_embedding": vector_str
            }
        )

        recommendations = []

        for row in results:

            recommendations.append(
                {
                    "title": row.title,
                    "url": row.issue_url,
                    "labels": row.labels,
                    "score": float(row.distance)
                }
            )

        return recommendations

    finally:

        db.close()