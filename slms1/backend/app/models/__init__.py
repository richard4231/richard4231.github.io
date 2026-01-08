"""SQLAlchemy ORM models."""

from app.models.base import Base, BaseModel, AuditMixin, TimestampMixin
from app.models.user import User, Role, Permission, UserType
from app.models.student import Student, StudentProgram, StudentFavorite, StudentStatus
from app.models.lecturer import Lecturer
from app.models.academic import Department, Program, Module, TranscriptEntry, DegreeType
from app.models.learning_opportunity import (
    AcademicPeriod,
    LearningOpportunity,
    PeriodType,
    LOStatus,
    WeekPattern,
)
from app.models.schedule import Room, Schedule, RoomType
from app.models.registration import (
    Registration,
    WaitlistEntry,
    RegistrationStatus,
    AttendanceStatus,
    WaitlistStatus,
)
from app.models.assessment import (
    Assessment,
    AssessmentRegistration,
    AssessmentType,
    AssessmentRegStatus,
)
from app.models.payment import Payment, PaymentType, PaymentStatus, PaymentMethod
from app.models.audit import AuditLog, DataProcessingRecord, ConsentRecord, AuditAction

__all__ = [
    # Base
    "Base",
    "BaseModel",
    "AuditMixin",
    "TimestampMixin",
    # User
    "User",
    "Role",
    "Permission",
    "UserType",
    # Student
    "Student",
    "StudentProgram",
    "StudentFavorite",
    "StudentStatus",
    # Lecturer
    "Lecturer",
    # Academic
    "Department",
    "Program",
    "Module",
    "TranscriptEntry",
    "DegreeType",
    # Learning Opportunity
    "AcademicPeriod",
    "LearningOpportunity",
    "PeriodType",
    "LOStatus",
    "WeekPattern",
    # Schedule
    "Room",
    "Schedule",
    "RoomType",
    # Registration
    "Registration",
    "WaitlistEntry",
    "RegistrationStatus",
    "AttendanceStatus",
    "WaitlistStatus",
    # Assessment
    "Assessment",
    "AssessmentRegistration",
    "AssessmentType",
    "AssessmentRegStatus",
    # Payment
    "Payment",
    "PaymentType",
    "PaymentStatus",
    "PaymentMethod",
    # Audit
    "AuditLog",
    "DataProcessingRecord",
    "ConsentRecord",
    "AuditAction",
]
