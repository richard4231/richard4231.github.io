"""Assessment / Leistungsnachweis models."""

from datetime import date, datetime, time
from decimal import Decimal
from enum import Enum
from uuid import UUID

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class AssessmentType(str, Enum):
    """Assessment types."""

    WRITTEN_EXAM = "written_exam"
    ORAL_EXAM = "oral_exam"
    PROJECT = "project"
    PRESENTATION = "presentation"
    PAPER = "paper"
    PORTFOLIO = "portfolio"


class AssessmentRegStatus(str, Enum):
    """Assessment registration status."""

    REGISTERED = "registered"
    CONFIRMED = "confirmed"
    ATTENDED = "attended"
    ABSENT = "absent"
    WITHDRAWN = "withdrawn"


class Assessment(BaseModel):
    """Assessment / Leistungsnachweis linked to a learning opportunity."""

    __tablename__ = "assessments"

    learning_opportunity_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("learning_opportunities.id", ondelete="CASCADE"),
        nullable=False,
    )

    name_de: Mapped[str] = mapped_column(String(200), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(200), nullable=True)
    name_en: Mapped[str | None] = mapped_column(String(200), nullable=True)

    assessment_type: Mapped[AssessmentType] = mapped_column(String(50), nullable=False)

    # Scheduling
    scheduled_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    scheduled_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    room_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("rooms.id"),
        nullable=True,
    )

    # Registration window
    registration_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    registration_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Grading
    weight_percentage: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    passing_grade: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("4.0"))  # Swiss: 4.0 passes

    is_active: Mapped[bool] = mapped_column(default=True)

    # Relationships
    learning_opportunity: Mapped["LearningOpportunity"] = relationship(back_populates="assessments")
    room: Mapped["Room | None"] = relationship()
    registrations: Mapped[list["AssessmentRegistration"]] = relationship(back_populates="assessment")


class AssessmentRegistration(BaseModel):
    """Student registration for an assessment."""

    __tablename__ = "assessment_registrations"

    assessment_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
    )
    student_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )
    registration_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("registrations.id"),
        nullable=True,
    )

    registration_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )
    status: Mapped[AssessmentRegStatus] = mapped_column(
        String(20),
        default=AssessmentRegStatus.REGISTERED,
    )

    # Results
    grade: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)  # Swiss: 1.0-6.0
    grade_entered_by: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    grade_entered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    assessment: Mapped["Assessment"] = relationship(back_populates="registrations")
    student: Mapped["Student"] = relationship()
    course_registration: Mapped["Registration | None"] = relationship()


# Forward references
from app.models.learning_opportunity import LearningOpportunity  # noqa: E402
from app.models.schedule import Room  # noqa: E402
from app.models.student import Student  # noqa: E402
from app.models.registration import Registration  # noqa: E402
