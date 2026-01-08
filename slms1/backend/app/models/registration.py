"""Registration and Waitlist models."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class RegistrationStatus(str, Enum):
    """Registration status values."""

    REGISTERED = "registered"
    WAITLISTED = "waitlisted"
    CONFIRMED = "confirmed"
    WITHDRAWN = "withdrawn"
    EXCLUDED = "excluded"
    COMPLETED = "completed"


class AttendanceStatus(str, Enum):
    """Attendance status (marked by lecturer)."""

    ATTENDED = "attended"
    EXCLUDED = "excluded"
    WITHDRAWN = "withdrawn"


class WaitlistStatus(str, Enum):
    """Waitlist entry status."""

    WAITING = "waiting"
    PROMOTED = "promoted"
    EXPIRED = "expired"
    DECLINED = "declined"


class Registration(BaseModel):
    """Student registration for learning opportunities."""

    __tablename__ = "registrations"

    student_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )
    learning_opportunity_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("learning_opportunities.id", ondelete="CASCADE"),
        nullable=False,
    )

    registration_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )
    status: Mapped[RegistrationStatus] = mapped_column(
        String(20),
        default=RegistrationStatus.REGISTERED,
    )

    # Eligibility check results (stored for audit)
    eligibility_check_passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    eligibility_check_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    eligibility_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Waitlist position (if applicable)
    waitlist_position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    waitlist_added_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Lecturer actions (attendance marking)
    attendance_status: Mapped[AttendanceStatus | None] = mapped_column(String(20), nullable=True)
    attendance_updated_by: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    attendance_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attendance_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="registrations")
    learning_opportunity: Mapped["LearningOpportunity"] = relationship(back_populates="registrations")

    __table_args__ = (
        # Ensure unique registration per student per learning opportunity
        {"sqlite_autoincrement": True},
    )


class WaitlistEntry(BaseModel):
    """Waitlist entry for learning opportunities that exceed capacity."""

    __tablename__ = "waitlist_entries"

    learning_opportunity_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("learning_opportunities.id", ondelete="CASCADE"),
        nullable=False,
    )
    student_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )

    position: Mapped[int] = mapped_column(Integer, nullable=False)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )
    status: Mapped[WaitlistStatus] = mapped_column(String(20), default=WaitlistStatus.WAITING)
    promoted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    learning_opportunity: Mapped["LearningOpportunity"] = relationship(back_populates="waitlist_entries")
    student: Mapped["Student"] = relationship()


# Forward references
from app.models.student import Student  # noqa: E402
from app.models.learning_opportunity import LearningOpportunity  # noqa: E402
