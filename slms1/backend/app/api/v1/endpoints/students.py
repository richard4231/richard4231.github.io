"""Student management endpoints (Admin/Power User)."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import Student, StudentStatus

router = APIRouter()


@router.get("")
async def list_students(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: StudentStatus | None = None,
    search: str | None = None,
) -> dict:
    """List all students with pagination and filters."""
    query = select(Student)

    if status:
        query = query.where(Student.status == status)

    if search:
        # TODO: Add full-text search on name, matriculation number
        pass

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    students = result.scalars().all()

    return {
        "items": [s.to_dict() for s in students],
        "skip": skip,
        "limit": limit,
        "total": len(students),  # TODO: Get actual count
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_student(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create a new student."""
    # TODO: Implement with Pydantic schema
    return {"message": "Create student - implementation pending"}


@router.get("/{student_id}")
async def get_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get student by ID."""
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    return student.to_dict()


@router.patch("/{student_id}")
async def update_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Update student data."""
    # TODO: Implement with Pydantic schema
    return {"message": f"Update student {student_id} - implementation pending"}


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Soft delete a student."""
    # TODO: Implement soft delete
    pass


@router.get("/{student_id}/enrollments")
async def get_student_enrollments(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get student's program enrollments."""
    return {"message": f"Student {student_id} enrollments - implementation pending"}


@router.get("/{student_id}/registrations")
async def get_student_registrations(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get student's learning opportunity registrations."""
    return {"message": f"Student {student_id} registrations - implementation pending"}


@router.get("/{student_id}/transcript")
async def get_student_transcript(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get student's academic transcript."""
    return {"message": f"Student {student_id} transcript - implementation pending"}


@router.get("/{student_id}/payments")
async def get_student_payments(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get student's payment history."""
    return {"message": f"Student {student_id} payments - implementation pending"}


@router.post("/{student_id}/emails")
async def send_student_email(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Send email to student."""
    return {"message": f"Send email to student {student_id} - implementation pending"}
