from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.issue import Issue
from app.models.issue_embedding import IssueEmbedding
from app.database import get_db
from app.api.routes.dependencies import get_current_user
from app.services.issue_service import create_issue_text
from app.services.embedding_service import embed_text

router = APIRouter()

@router.post("/embed")
def embed_issues( current_user : User = Depends(get_current_user),
                    db: Session = Depends(get_db)):

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
