"""Learning Opportunity and Academic Period models."""

from datetime import date, datetime, time
from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Table, Text, Time
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModel


class PeriodType(str, Enum):
    """Academic period types."""

    SEMESTER = "semester"
    BLOCK_WEEK = "block_week"


class LOStatus(str, Enum):
    """Learning opportunity status."""

    DRAFT = "draft"
    PUBLISHED = "published"
    REGISTRATION_OPEN = "registration_open"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class WeekPattern(str, Enum):
    """Week patterns for scheduling (Schienen/Tracks)."""

    ALL = "all"            # All weeks
    ODD = "odd"            # Track A: Odd weeks (ungerade)
    EVEN = "even"          # Track B: Even weeks (gerade)
    FIRST_HALF = "first_half"   # Track C: First half of semester
    SECOND_HALF = "second_half"  # Track D: Second half of semester


class AcademicPeriod(BaseModel):
    """Academic period (Semester, Block week)."""

    __tablename__ = "academic_periods"

    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # HS2025, FS2026, BW2025-1
    name_de: Mapped[str] = mapped_column(String(100), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(100), nullable=True)
    name_en: Mapped[str | None] = mapped_column(String(100), nullable=True)

    period_type: Mapped[PeriodType] = mapped_column(String(20), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Registration windows
    registration_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    registration_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    late_registration_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    withdrawal_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    learning_opportunities: Mapped[list["LearningOpportunity"]] = relationship(back_populates="academic_period")


class LearningOpportunity(BaseModel):
    """Learning Opportunity / Lerngelegenheit - instance of a module in a period."""

    __tablename__ = "learning_opportunities"

    module_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("modules.id"),
        nullable=False,
    )
    academic_period_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("academic_periods.id"),
        nullable=False,
    )

    # Description specific to this offering
    description_de: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    terms_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Capacity management
    max_participants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    min_participants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    waitlist_threshold: Mapped[int] = mapped_column(Integer, default=30)

    # Schedule track (Schiene)
    track: Mapped[WeekPattern | None] = mapped_column(String(20), nullable=True)

    # Status
    status: Mapped[LOStatus] = mapped_column(String(20), default=LOStatus.DRAFT)

    # Edit windows for lecturers
    lecturer_edit_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lecturer_edit_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Room requirements
    room_type_required: Mapped[str | None] = mapped_column(String(50), nullable=True)
    room_capacity_required: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    module: Mapped["Module"] = relationship(back_populates="learning_opportunities")
    academic_period: Mapped["AcademicPeriod"] = relationship(back_populates="learning_opportunities")
    lecturers: Mapped[list["Lecturer"]] = relationship(
        secondary="learning_opportunity_lecturers",
        back_populates="learning_opportunities",
    )
    schedules: Mapped[list["Schedule"]] = relationship(back_populates="learning_opportunity")
    registrations: Mapped[list["Registration"]] = relationship(back_populates="learning_opportunity")
    waitlist_entries: Mapped[list["WaitlistEntry"]] = relationship(back_populates="learning_opportunity")
    assessments: Mapped[list["Assessment"]] = relationship(back_populates="learning_opportunity")

    @property
    def current_participant_count(self) -> int:
        """Count of confirmed participants."""
        return len([r for r in self.registrations if r.status in ("registered", "confirmed")])

    @property
    def is_full(self) -> bool:
        """Check if learning opportunity has reached capacity."""
        if self.max_participants is None:
            return False
        return self.current_participant_count >= self.max_participants


# Association table for learning opportunity lecturers
learning_opportunity_lecturers = Table(
    "learning_opportunity_lecturers",
    Base.metadata,
    Column(
        "learning_opportunity_id",
        PGUUID(as_uuid=True),
        ForeignKey("learning_opportunities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "lecturer_id",
        PGUUID(as_uuid=True),
        ForeignKey("lecturers.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("role", String(50), default="primary"),
)


# Forward references
from app.models.academic import Module  # noqa: E402
from app.models.lecturer import Lecturer  # noqa: E402
from app.models.schedule import Schedule  # noqa: E402
from app.models.registration import Registration, WaitlistEntry  # noqa: E402
from app.models.assessment import Assessment  # noqa: E402
