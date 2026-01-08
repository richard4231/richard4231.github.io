/**
 * Shared TypeScript types for SLMS Frontend
 */

// Base types
export type UUID = string;

// User types
export type UserType = 'student' | 'lecturer' | 'admin';

export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  preferredLanguage: string;
  isActive: boolean;
  lastLoginAt?: string;
}

// Student types
export type StudentStatus = 'active' | 'on_leave' | 'graduated' | 'withdrawn' | 'suspended';

export interface Student {
  id: UUID;
  userId: UUID;
  matriculationNumber: string;
  dateOfBirth: string;
  enrollmentDate: string;
  status: StudentStatus;
  street?: string;
  postalCode?: string;
  city?: string;
  canton?: string;
  country: string;
}

// Lecturer types
export interface Lecturer {
  id: UUID;
  userId: UUID;
  employeeId?: string;
  departmentId?: UUID;
  title?: string;
  position?: string;
  officeLocation?: string;
  isActive: boolean;
}

// Academic types
export type DegreeType = 'bachelor' | 'master' | 'phd' | 'diploma' | 'certificate';

export interface Department {
  id: UUID;
  code: string;
  nameDe: string;
  nameFr?: string;
  nameEn?: string;
  isActive: boolean;
}

export interface Program {
  id: UUID;
  code: string;
  nameDe: string;
  nameFr?: string;
  nameEn?: string;
  degreeType: DegreeType;
  requiredEcts?: number;
  durationSemesters?: number;
  isActive: boolean;
}

export interface Module {
  id: UUID;
  code: string;
  nameDe: string;
  nameFr?: string;
  nameEn?: string;
  descriptionDe?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  departmentId?: UUID;
  ectsCredits: number;
  level?: string;
  isElective: boolean;
  isMandatory: boolean;
  isActive: boolean;
}

// Learning Opportunity types
export type LOStatus = 'draft' | 'published' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled';
export type WeekPattern = 'all' | 'odd' | 'even' | 'first_half' | 'second_half';

export interface AcademicPeriod {
  id: UUID;
  code: string;
  nameDe: string;
  nameFr?: string;
  nameEn?: string;
  periodType: 'semester' | 'block_week';
  startDate: string;
  endDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  isActive: boolean;
}

export interface LearningOpportunity {
  id: UUID;
  moduleId: UUID;
  academicPeriodId: UUID;
  descriptionDe?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  termsConditions?: string;
  maxParticipants?: number;
  minParticipants?: number;
  waitlistThreshold: number;
  track?: WeekPattern;
  status: LOStatus;
  lecturerEditStart?: string;
  lecturerEditEnd?: string;
  // Computed
  currentParticipantCount?: number;
  isFull?: boolean;
}

// Schedule types
export type RoomType = 'lecture_hall' | 'seminar' | 'lab' | 'computer_lab' | 'exam_hall';

export interface Room {
  id: UUID;
  code: string;
  name?: string;
  building?: string;
  floor?: string;
  capacity: number;
  roomType: RoomType;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  hasComputers: boolean;
  isAccessible: boolean;
  isActive: boolean;
}

export interface Schedule {
  id: UUID;
  learningOpportunityId: UUID;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string;
  endTime: string;
  weekPattern: WeekPattern;
  specificDate?: string;
  roomId?: UUID;
  isOnline: boolean;
  onlineMeetingUrl?: string;
}

// Registration types
export type RegistrationStatus = 'registered' | 'waitlisted' | 'confirmed' | 'withdrawn' | 'excluded' | 'completed';
export type AttendanceStatus = 'attended' | 'excluded' | 'withdrawn';
export type WaitlistStatus = 'waiting' | 'promoted' | 'expired' | 'declined';

export interface Registration {
  id: UUID;
  studentId: UUID;
  learningOpportunityId: UUID;
  registrationDate: string;
  status: RegistrationStatus;
  waitlistPosition?: number;
  attendanceStatus?: AttendanceStatus;
  attendanceNotes?: string;
}

export interface WaitlistEntry {
  id: UUID;
  learningOpportunityId: UUID;
  studentId: UUID;
  position: number;
  addedAt: string;
  status: WaitlistStatus;
  promotedAt?: string;
}

// Assessment types
export type AssessmentType = 'written_exam' | 'oral_exam' | 'project' | 'presentation' | 'paper' | 'portfolio';

export interface Assessment {
  id: UUID;
  learningOpportunityId: UUID;
  nameDe: string;
  nameFr?: string;
  nameEn?: string;
  assessmentType: AssessmentType;
  scheduledDate?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  roomId?: UUID;
  registrationStart?: string;
  registrationEnd?: string;
  weightPercentage?: number;
  passingGrade: number;
  isActive: boolean;
}

// Payment types
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'einzahlungsschein' | 'twint';

export interface Payment {
  id: UUID;
  studentId: UUID;
  paymentTypeId: UUID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
}

// API types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiError {
  detail: string;
  status: number;
}

// Eligibility check
export interface EligibilityCheckResult {
  eligible: boolean;
  reasons: string[];
  missingPrerequisites: Module[];
  warnings: string[];
}
