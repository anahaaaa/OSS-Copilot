from app.database import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, BigInteger, DateTime, VARCHAR, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy import ForeignKey
from datetime import datetime
import uuid

class Repo(Base):

    __tablename__ = "repositories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )

    github_repo_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        unique=True
    )

    repo_url: Mapped[str] =  mapped_column(
        String(255)
    )

    owner_name: Mapped[str | None] = mapped_column(
        String(100)
    )

    repo_name: Mapped[str] = mapped_column(
        String(255)
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    language: Mapped[str | None] = mapped_column(
        String(100)
    )

    stars: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    forks: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    github_updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    last_synched_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    owner = relationship(
        "User",
        back_populates="repositories"
    )

    issues = relationship(
        "Issue",
        back_populates="repository"
    )

    chunks = relationship(
        "RepoChunk",
        back_populates="repository"
    )

    scan_jobs = relationship(
        "ScanJob",
        back_populates="repository"
    )