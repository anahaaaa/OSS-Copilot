from app.database import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, BigInteger, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
        )

    github_id : Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        nullable=False
        )

    username: Mapped[str] = mapped_column(
        String(100),
        nullable=False
        )

    avatar_url: Mapped[str | None] = mapped_column(
        String(255)
        )
    
    bio: Mapped[str | None] = mapped_column(
        Text
    )

    skill_profile: Mapped[dict | None] = mapped_column(
        JSONB
    )

    experience_level: Mapped[str | None] = mapped_column(
        String(20)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    repositories = relationship(
        "Repo",
        back_populates="owner"
    )

    feedback = relationship(
        "UserFeedback",
        back_populates="user"
    )

    embedding = relationship(
        "UserEmbedding",
        back_populates="user",
        uselist=False
    )