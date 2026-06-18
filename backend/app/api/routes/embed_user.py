from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.repository import Repo
from app.models.user_embedding import UserEmbedding
from app.database import get_db
from app.services.skill_service import extract_skills
from app.services.embedding_service import embed_text
from app.api.routes.dependencies import get_current_user

router = APIRouter()

@router.post("/users/{user_id}/embed")
def embed_user(current_user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):

    try:

        user = current_user

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
