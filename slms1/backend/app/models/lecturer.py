"""Lecturer model and related entities."""

from uuid import UUID

from sqlalchemy import Boolean, Column, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModel


class Lecturer(BaseModel):
    """Lecturer model with department and module assignments."""

    __tablename__ = "lecturers"

    # Link to user
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Employee info
    employee_id: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    department_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("departments.id"),
        nullable=True,
    )

    # Academic title and position
    title: Mapped[str | None] = mapped_column(String(50), nullable=True)  # Prof., Dr., PD Dr.
    position: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Contact
    office_location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    office_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="lecturer")
    primary_department: Mapped["Department | None"] = relationship(
        back_populates="lecturers",
        foreign_keys=[department_id],
    )
    departments: Mapped[list["Department"]] = relationship(
        secondary="lecturer_departments",
        back_populates="all_lecturers",
    )
    modules: Mapped[list["Module"]] = relationship(
        secondary="module_lecturers",
        back_populates="lecturers",
    )
    learning_opportunities: Mapped[list["LearningOpportunity"]] = relationship(
        secondary="learning_opportunity_lecturers",
        back_populates="lecturers",
    )


# Association table for lecturer-department many-to-many
lecturer_departments = Table(
    "lecturer_departments",
    Base.metadata,
    Column(
        "lecturer_id",
        PGUUID(as_uuid=True),
        ForeignKey("lecturers.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "department_id",
        PGUUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("is_primary", Boolean, default=False),
)


# Forward references
from app.models.user import User  # noqa: E402
from app.models.academic import Department, Module  # noqa: E402
from app.models.learning_opportunity import LearningOpportunity  # noqa: E402
