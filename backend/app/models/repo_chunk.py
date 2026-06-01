from app.database import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    Text,
    Integer,
    ForeignKey,
    UniqueConstraint,
    String
)

from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

import uuid


class RepoChunk(Base):
    __tablename__ = "repo_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    repo_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("repositories.id"),
        nullable=False
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    chunk_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    embedding: Mapped[list[float]] = mapped_column(
        Vector(1536),
        nullable=False
    )


    repository = relationship(
        "Repo",
        back_populates="chunks"
    )

    __table_args__ = (
        UniqueConstraint(
            "repo_id",
            "chunk_index",
            name="uq_repo_chunk_index"
        ),
    )
