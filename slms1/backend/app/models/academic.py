"""Academic structure models: Department, Program, Module."""

from datetime import date
from decimal import Decimal
from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, Numeric, String, Table, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModel


class DegreeType(str, Enum):
    """Academic degree types."""

    BACHELOR = "bachelor"
    MASTER = "master"
    PHD = "phd"
    DIPLOMA = "diploma"
    CERTIFICATE = "certificate"


class Department(BaseModel):
    """Academic department / Fachbereich."""

    __tablename__ = "departments"

    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name_de: Mapped[str] = mapped_column(String(200), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(200), nullable=True)
    name_en: Mapped[str | None] = mapped_column(String(200), nullable=True)
    faculty: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    programs: Mapped[list["Program"]] = relationship(back_populates="department")
    modules: Mapped[list["Module"]] = relationship(back_populates="department")
    lecturers: Mapped[list["Lecturer"]] = relationship(
        back_populates="primary_department",
        foreign_keys="Lecturer.department_id",
    )
    all_lecturers: Mapped[list["Lecturer"]] = relationship(
        secondary="lecturer_departments",
        back_populates="departments",
    )


class Program(BaseModel):
    """Academic program / Studiengang."""

    __tablename__ = "programs"

    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name_de: Mapped[str] = mapped_column(String(200), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(200), nullable=True)
    name_en: Mapped[str | None] = mapped_column(String(200), nullable=True)

    degree_type: Mapped[DegreeType] = mapped_column(String(20), nullable=False)
    department_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("departments.id"),
        nullable=True,
    )

    required_ects: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_semesters: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    department: Mapped["Department | None"] = relationship(back_populates="programs")
    modules: Mapped[list["Module"]] = relationship(
        secondary="program_modules",
        back_populates="programs",
    )
    student_programs: Mapped[list["StudentProgram"]] = relationship(back_populates="program")


class Module(BaseModel):
    """Academic module / Modul."""

    __tablename__ = "modules"

    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name_de: Mapped[str] = mapped_column(String(200), nullable=False)
    name_fr: Mapped[str | None] = mapped_column(String(200), nullable=True)
    name_en: Mapped[str | None] = mapped_column(String(200), nullable=True)

    description_de: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)

    department_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("departments.id"),
        nullable=True,
    )

    ects_credits: Mapped[Decimal] = mapped_column(Numeric(4, 1), nullable=False)
    level: Mapped[str | None] = mapped_column(String(20), nullable=True)  # bachelor, master, doctoral

    is_elective: Mapped[bool] = mapped_column(Boolean, default=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    valid_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Relationships
    department: Mapped["Department | None"] = relationship(back_populates="modules")
    programs: Mapped[list["Program"]] = relationship(
        secondary="program_modules",
        back_populates="modules",
    )
    lecturers: Mapped[list["Lecturer"]] = relationship(
        secondary="module_lecturers",
        back_populates="modules",
    )
    prerequisites: Mapped[list["Module"]] = relationship(
        secondary="module_prerequisites",
        primaryjoin="Module.id == module_prerequisites.c.module_id",
        secondaryjoin="Module.id == module_prerequisites.c.prerequisite_module_id",
    )
    learning_opportunities: Mapped[list["LearningOpportunity"]] = relationship(back_populates="module")


class TranscriptEntry(BaseModel):
    """Student transcript entry / Leistungsnachweis-Eintrag."""

    __tablename__ = "transcript_entries"

    student_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )
    module_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("modules.id"),
        nullable=False,
    )
    learning_opportunity_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("learning_opportunities.id"),
        nullable=True,
    )
    academic_period_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("academic_periods.id"),
        nullable=False,
    )

    final_grade: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)  # Swiss: 1.0-6.0
    ects_earned: Mapped[Decimal | None] = mapped_column(Numeric(4, 1), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # passed, failed, in_progress, withdrawn

    verified_by: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    verified_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="transcript_entries")
    module: Mapped["Module"] = relationship()
    academic_period: Mapped["AcademicPeriod"] = relationship()


# Association tables
program_modules = Table(
    "program_modules",
    Base.metadata,
    Column(
        "program_id",
        PGUUID(as_uuid=True),
        ForeignKey("programs.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "module_id",
        PGUUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("is_mandatory", Boolean, default=True),
    Column("recommended_semester", Integer, nullable=True),
)

module_lecturers = Table(
    "module_lecturers",
    Base.metadata,
    Column(
        "module_id",
        PGUUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "lecturer_id",
        PGUUID(as_uuid=True),
        ForeignKey("lecturers.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("role", String(50), default="primary"),  # primary, co-lecturer, assistant
)

module_prerequisites = Table(
    "module_prerequisites",
    Base.metadata,
    Column(
        "module_id",
        PGUUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "prerequisite_module_id",
        PGUUID(as_uuid=True),
        ForeignKey("modules.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("is_mandatory", Boolean, default=True),
    Column("minimum_grade", Numeric(3, 2), nullable=True),
)


# Forward references
from app.models.lecturer import Lecturer  # noqa: E402
from app.models.student import Student, StudentProgram  # noqa: E402
from app.models.learning_opportunity import LearningOpportunity, AcademicPeriod  # noqa: E402
