from app.database import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    String,
    Text,
    BigInteger,
    DateTime,
    Boolean,
    Integer,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB

from datetime import datetime
import uuid


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    github_issue_id: Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        nullable=False
    )

    repo_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("repositories.id"),
        nullable=False
    )

    issue_url: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    body: Mapped[str | None] = mapped_column(
        Text
    )

    labels: Mapped[dict | None] = mapped_column(
        JSONB
    )

    difficulty: Mapped[str | None] = mapped_column(
        String(50)
    )

    is_open: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    github_created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    github_updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    comments_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    repository = relationship(
        "Repo",
        back_populates="issues"
    )

    embedding = relationship(
        "IssueEmbedding",
        back_populates="issue",
        uselist=False
    )

    feedback = relationship(
        "UserFeedback",
        back_populates="issue"
    )