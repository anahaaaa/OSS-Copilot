from app.database import Base

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Boolean,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from datetime import datetime
import uuid


class UserFeedback(Base):

    __tablename__ = "user_feedback"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "issue_id",
            name="uq_user_issue_feedback"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    issue_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("issues.id"),
        nullable=False
    )

    liked: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


    scan_jobs = relationship(
        "ScanJob",
        back_populates="repository"
    )