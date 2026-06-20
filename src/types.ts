/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Institution {
  id: string; // e.g. "uct", "dut", "wits", "ukzn"
  name: string;
  location: string;
  activeListings: number;
  totalApplicants: number;
  totalStudents: number;
  lastActivityDate: string;
  status: "Active" | "Pending";
  domain: string; // e.g. "myuct.ac.za", "dut4life.ac.za"
}

export type FundingType = "Merit-Based" | "Financial Need" | "Open Merit" | "Departmental" | "Special Grant";

export type ApplicationStatus = "Draft" | "Open" | "Closing Soon" | "Closed" | "Filled";

export interface Faculty {
  id: string;
  name: string;
  institutionId: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  facultyId: string;
  isActive: boolean;
}

export interface Programme {
  id: string;
  name: string;
  departmentId: string;
  isActive: boolean;
}

export interface Bursary {
  id: string;
  name: string;
  institutionId: string; // locked to this uni
  targetingScope: "Programme" | "Department" | "Faculty" | "Institution";
  targetFacultyId?: string; // Null if scope is Institution
  targetDepartmentId?: string; // Null if scope is Institution/Faculty
  targetProgrammeId?: string; // Null if scope is anything above Programme
  faculty: string; // Legacy/compatible string representation
  programme?: string; // Legacy/compatible string representation
  minGPA: number; // e.g. 65, 75, 85, etc.
  deadline: string; // YYYY-MM-DD
  fundingType: FundingType;
  slots: number;
  applicantCount: number;
  status: ApplicationStatus;
  description: string;
  requiredDocuments: string[]; // e.g. ["ID Copy", "Academic Transcript", "Motivational Letter"]
}

export interface StudentProfile {
  fullName: string;
  saIdNumber: string;
  email: string;
  phoneNumber: string;
  institutionId: string;
  facultyId: string; // foreign key
  departmentId: string; // foreign key
  programmeId: string; // foreign key
  degreeName: string; // free text degree title for display purposes only
  faculty: string; // compatible string
  programme: string; // compatible string
  yearOfStudy: string;
  gpa: number;
  fundingStatus: "Unfunded" | "Partially Funded" | "Fully Funded" | null;
}

export interface BursaryApplication {
  id: string;
  bursaryId: string;
  studentId: string; // saIdNumber or email as key
  studentName: string;
  studentEmail: string;
  studentGPA: number;
  studentFaculty: string;
  uploadedDocuments: string[]; // actual uploaded file keys
  submittedAt: string;
  status: "Received" | "Under Review" | "Eligible" | "Approved" | "Declined";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  ipAddress: string;
}

export interface Sponsor {
  id: string;
  name: string;
  quota: string;
  focus: string;
}
