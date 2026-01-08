"""Learning Opportunity endpoints - central API for courses/events."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import LOStatus

router = APIRouter()


@router.get("")
async def list_learning_opportunities(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    academic_period_id: UUID | None = None,
    module_id: UUID | None = None,
    status: LOStatus | None = None,
) -> dict:
    """List learning opportunities with filters."""
    return {"message": "List LOs - implementation pending"}


@router.get("/search")
async def search_learning_opportunities(
    q: str,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=50),
) -> dict:
    """Search learning opportunities."""
    return {"message": f"Search LOs for '{q}' - implementation pending"}


@router.post("")
async def create_learning_opportunity(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create a new learning opportunity (admin)."""
    return {"message": "Create LO - implementation pending"}


@router.get("/{lo_id}")
async def get_learning_opportunity(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get learning opportunity details."""
    return {"message": f"Get LO {lo_id} - implementation pending"}


@router.patch("/{lo_id}")
async def update_learning_opportunity(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Update learning opportunity (admin or lecturer within edit window)."""
    # TODO: Check if user is admin or assigned lecturer
    # TODO: If lecturer, check if within edit window
    return {"message": f"Update LO {lo_id} - implementation pending"}


# Schedule management
@router.get("/{lo_id}/schedule")
async def get_schedule(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get schedule for learning opportunity."""
    return {"message": f"LO {lo_id} schedule - implementation pending"}


@router.post("/{lo_id}/schedule")
async def add_schedule_entry(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Add schedule entry to learning opportunity."""
    return {"message": f"Add schedule to LO {lo_id} - implementation pending"}


# Registration
@router.get("/{lo_id}/registrations")
async def get_registrations(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get registered students (lecturer/admin)."""
    return {"message": f"LO {lo_id} registrations - implementation pending"}


@router.post("/{lo_id}/register")
async def register_for_lo(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Register current student for learning opportunity."""
    # TODO: Get current user from auth
    # TODO: Check eligibility (prerequisites, capacity)
    # TODO: Add to waitlist if full
    return {"message": f"Register for LO {lo_id} - implementation pending"}


@router.post("/{lo_id}/withdraw")
async def withdraw_from_lo(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Withdraw current student from learning opportunity."""
    return {"message": f"Withdraw from LO {lo_id} - implementation pending"}


# Waitlist
@router.get("/{lo_id}/waitlist")
async def get_waitlist(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get waitlist for learning opportunity (lecturer/admin)."""
    return {"message": f"LO {lo_id} waitlist - implementation pending"}


@router.post("/{lo_id}/waitlist/promote")
async def promote_from_waitlist(
    lo_id: UUID,
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Promote student from waitlist to registered (lecturer/admin)."""
    return {"message": f"Promote student {student_id} from waitlist - implementation pending"}


# Attendance (Lecturer)
@router.patch("/{lo_id}/attendance")
async def mark_attendance(
    lo_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Mark student attendance status (lecturer).

    Body should contain:
    - student_id: UUID
    - status: "attended" | "excluded" | "withdrawn"
    - notes: optional string
    """
    return {"message": f"Mark attendance for LO {lo_id} - implementation pending"}
