from app.database import Base

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from datetime import datetime
import uuid


class ScanJob(Base):

    __tablename__ = "scan_jobs"

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

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    error_message: Mapped[str | None] = mapped_column(
        Text
    )

    repository = relationship(
        "Repo",
        back_populates="scan_jobs"
    )