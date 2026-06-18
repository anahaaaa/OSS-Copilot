from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import os
import requests

from app.models.user import User
from app.models.repository import Repo
from app.models.issue import Issue
from app.database import get_db
from app.api.routes.dependencies import get_current_user


router = APIRouter()

@router.post("/scan")
def scan_repository(
        repo: str,
        owner: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    
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
            user_id=None,   

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

    except HTTPException:
        raise   
    except Exception as e:
        db.rollback()
        raise e

    return {
        "message": "Issues synced",
        "repository": f"{owner}/{repo}",
        "count": len(issues_data)
    }