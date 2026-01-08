"""Schedule and Room models."""

from datetime import date, time
from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text, Time
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.learning_opportunity import WeekPattern


class RoomType(str, Enum):
    """Room types."""

    LECTURE_HALL = "lecture_hall"
    SEMINAR = "seminar"
    LAB = "lab"
    COMPUTER_LAB = "computer_lab"
    EXAM_HALL = "exam_hall"


class Room(BaseModel):
    """Room / Raum model."""

    __tablename__ = "rooms"

    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # HG-F-1, ETZ-E-8
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    building: Mapped[str | None] = mapped_column(String(100), nullable=True)
    floor: Mapped[str | None] = mapped_column(String(10), nullable=True)

    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    room_type: Mapped[RoomType] = mapped_column(String(50), nullable=False)

    # Equipment
    has_projector: Mapped[bool] = mapped_column(Boolean, default=False)
    has_whiteboard: Mapped[bool] = mapped_column(Boolean, default=False)
    has_video_conference: Mapped[bool] = mapped_column(Boolean, default=False)
    has_computers: Mapped[bool] = mapped_column(Boolean, default=False)
    computer_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Accessibility
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=True)  # Wheelchair accessible
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    schedules: Mapped[list["Schedule"]] = relationship(back_populates="room")


class Schedule(BaseModel):
    """Schedule entry for learning opportunities."""

    __tablename__ = "schedules"

    learning_opportunity_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("learning_opportunities.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Time slot
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 1=Monday, 7=Sunday
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    # Recurrence pattern (Schiene)
    week_pattern: Mapped[WeekPattern] = mapped_column(String(20), default=WeekPattern.ALL)

    # Specific date (for block weeks or exceptions)
    specific_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Room
    room_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("rooms.id"),
        nullable=True,
    )

    # Virtual meeting
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    online_meeting_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relationships
    learning_opportunity: Mapped["LearningOpportunity"] = relationship(back_populates="schedules")
    room: Mapped["Room | None"] = relationship(back_populates="schedules")

    @property
    def day_name(self) -> str:
        """Return day name in German."""
        days = {
            1: "Montag",
            2: "Dienstag",
            3: "Mittwoch",
            4: "Donnerstag",
            5: "Freitag",
            6: "Samstag",
            7: "Sonntag",
        }
        return days.get(self.day_of_week, "Unbekannt")


# Forward reference
from app.models.learning_opportunity import LearningOpportunity  # noqa: E402
