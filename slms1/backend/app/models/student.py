"""Student model and related entities."""

from datetime import date, datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class StudentStatus(str, Enum):
    """Student enrollment status."""

    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    GRADUATED = "graduated"
    WITHDRAWN = "withdrawn"
    SUSPENDED = "suspended"


class Student(BaseModel):
    """Student model with personal and academic data."""

    __tablename__ = "students"

    # Link to user
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Academic identifiers
    matriculation_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    # Personal data
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    nationality: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ahv_number: Mapped[str | None] = mapped_column(String(16), nullable=True)  # Encrypted

    # Address (Swiss format)
    street: Mapped[str | None] = mapped_column(String(200), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    canton: Mapped[str | None] = mapped_column(String(2), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="Switzerland")

    # Academic info
    enrollment_date: Mapped[date] = mapped_column(Date, nullable=False)
    expected_graduation: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[StudentStatus] = mapped_column(String(20), default=StudentStatus.ACTIVE)

    # GDPR/nDSG compliance
    data_consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    data_consent_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    data_retention_until: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="student")
    programs: Mapped[list["StudentProgram"]] = relationship(back_populates="student", lazy="selectin")
    registrations: Mapped[list["Registration"]] = relationship(back_populates="student")
    favorites: Mapped[list["StudentFavorite"]] = relationship(back_populates="student")
    transcript_entries: Mapped[list["TranscriptEntry"]] = relationship(back_populates="student")
    payments: Mapped[list["Payment"]] = relationship(back_populates="student")


class StudentProgram(BaseModel):
    """Student enrollment in academic programs."""

    __tablename__ = "student_programs"

    student_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )
    program_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("programs.id"),
        nullable=False,
    )
    enrollment_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active")
    expected_completion: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_completion: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="programs")
    program: Mapped["Program"] = relationship(back_populates="student_programs")


class StudentFavorite(BaseModel):
    """Student favorites (modules, learning opportunities, etc.)."""

    __tablename__ = "student_favorites"

    student_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # module, learning_opportunity, lecturer
    entity_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="favorites")


# Forward references
from app.models.user import User  # noqa: E402
from app.models.academic import Program, TranscriptEntry  # noqa: E402
from app.models.registration import Registration  # noqa: E402
from app.models.payment import Payment  # noqa: E402
