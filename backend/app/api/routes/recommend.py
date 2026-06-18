from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.user import User
from app.models.user_embedding import UserEmbedding
from app.database import get_db
from app.api.routes.dependencies import get_current_user

router = APIRouter()

@router.get("/users/me/recommendations")
def get_recommendations(current_user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):

    try:

        user_embedding = (
            db.query(UserEmbedding)
            .filter(
                UserEmbedding.user_id == current_user.id
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

    except Exception as e:

        db.rollback()
        raise e