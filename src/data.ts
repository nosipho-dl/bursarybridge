/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Institution, Bursary, BursaryApplication, AuditLog, Faculty, Department, Programme } from "./types";

export const initialInstitutions: Institution[] = [
  {
    id: "uct",
    name: "University of Cape Town",
    location: "Western Cape, SA",
    activeListings: 4,
    totalApplicants: 124,
    totalStudents: 15600,
    lastActivityDate: "2 mins ago",
    status: "Active",
    domain: "myuct.ac.za"
  },
  {
    id: "wits",
    name: "University of the Witwatersrand",
    location: "Gauteng, SA",
    activeListings: 3,
    totalApplicants: 118,
    totalStudents: 14200,
    lastActivityDate: "1 hour ago",
    status: "Active",
    domain: "students.wits.ac.za"
  },
  {
    id: "ukzn",
    name: "University of KwaZulu-Natal",
    location: "KwaZulu-Natal, SA",
    activeListings: 3,
    totalApplicants: 86,
    totalStudents: 9800,
    lastActivityDate: "Yesterday",
    status: "Active",
    domain: "stu.ukzn.ac.za"
  },
  {
    id: "dut",
    name: "Durban University of Technology",
    location: "KwaZulu-Natal, SA",
    activeListings: 2,
    totalApplicants: 52,
    totalStudents: 6100,
    lastActivityDate: "3 hours ago",
    status: "Active",
    domain: "dut4life.ac.za"
  },
  {
    id: "up",
    name: "University of Pretoria",
    location: "Gauteng, SA",
    activeListings: 0,
    totalApplicants: 21,
    totalStudents: 4500,
    lastActivityDate: "12 mins ago",
    status: "Pending",
    domain: "tuks.co.za"
  },
  {
    id: "stellenbosch",
    name: "Stellenbosch University",
    location: "Western Cape, SA",
    activeListings: 2,
    totalApplicants: 74,
    totalStudents: 8100,
    lastActivityDate: "Yesterday",
    status: "Active",
    domain: "maties.ac.za"
  }
];

// DYNAMIC ACCADEMIC STRUCTURE SEED DATA
export const initialFaculties: Faculty[] = [
  // --- UCT STRUCT ---
  { id: "fac-uct-ebe", name: "Engineering & the Built Environment (EBE)", institutionId: "uct", isActive: true },
  { id: "fac-uct-commerce", name: "Faculty of Commerce", institutionId: "uct", isActive: true },
  { id: "fac-uct-health", name: "Faculty of Health Sciences", institutionId: "uct", isActive: true },
  { id: "fac-uct-humanities", name: "Faculty of Humanities", institutionId: "uct", isActive: true },

  // --- DUT STRUCT ---
  { id: "fac-dut-applied", name: "Faculty of Applied Sciences", institutionId: "dut", isActive: true },
  { id: "fac-dut-eng", name: "Faculty of Engineering & the Built Environment", institutionId: "dut", isActive: true },
  { id: "fac-dut-mgmt", name: "Faculty of Management Sciences", institutionId: "dut", isActive: true },

  // --- WITS STRUCT ---
  { id: "fac-wits-science", name: "Faculty of Science", institutionId: "wits", isActive: true },
  { id: "fac-wits-clm", name: "Faculty of Commerce, Law and Management", institutionId: "wits", isActive: true },
  { id: "fac-wits-humanities", name: "Faculty of Humanities", institutionId: "wits", isActive: true }
];

export const initialDepartments: Department[] = [
  // --- UCT ---
  // EBE
  { id: "dep-uct-ebe-electrical", name: "Department of Electrical Engineering", facultyId: "fac-uct-ebe", isActive: true },
  { id: "dep-uct-ebe-computer", name: "Department of Computer Science", facultyId: "fac-uct-ebe", isActive: true },
  { id: "dep-uct-ebe-civil", name: "Department of Civil Engineering", facultyId: "fac-uct-ebe", isActive: true },
  // Commerce
  { id: "dep-uct-com-finance", name: "Department of Finance and Tax", facultyId: "fac-uct-commerce", isActive: true },
  { id: "dep-uct-com-mgmt", name: "School of Management Studies", facultyId: "fac-uct-commerce", isActive: true },
  // Health
  { id: "dep-uct-health-med", name: "Department of Medicine", facultyId: "fac-uct-health", isActive: true },
  // Humanities
  { id: "dep-uct-hum-arts", name: "Department of Fine Art", facultyId: "fac-uct-humanities", isActive: true },

  // --- DUT ---
  // Applied Sciences
  { id: "dep-dut-app-biotech", name: "Department of Biotechnology and Food Technology", facultyId: "fac-dut-applied", isActive: true },
  { id: "dep-dut-app-chemistry", name: "Department of Chemistry", facultyId: "fac-dut-applied", isActive: true },
  // Engineering
  { id: "dep-dut-eng-civil", name: "Department of Civil Engineering & Surveying", facultyId: "fac-dut-eng", isActive: true },
  { id: "dep-dut-eng-electric", name: "Department of Electrical Power Engineering", facultyId: "fac-dut-eng", isActive: true },
  // Management Sciences
  { id: "dep-dut-mgmt-hospitality", name: "Department of Hospitality and Tourism", facultyId: "fac-dut-mgmt", isActive: true },

  // --- WITS ---
  // Science
  { id: "dep-wits-sci-cs", name: "School of Computer Science & applied Mathematics", facultyId: "fac-wits-science", isActive: true },
  // CLM
  { id: "dep-wits-clm-economics", name: "School of Economics and Finance", facultyId: "fac-wits-clm", isActive: true }
];

export const initialProgrammes: Programme[] = [
  // --- UCT ---
  // Electrical
  { id: "prog-uct-ee-mechatronics", name: "BSc in Mechatronics", departmentId: "dep-uct-ebe-electrical", isActive: true },
  { id: "prog-uct-ee-elec", name: "BSc in Electrical Engineering", departmentId: "dep-uct-ebe-electrical", isActive: true },
  // Computer Science
  { id: "prog-uct-cs-compsci", name: "BSc in Computer Science", departmentId: "dep-uct-ebe-computer", isActive: true },
  // Civil Engineering
  { id: "prog-uct-civil-eng", name: "BSc in Civil Engineering", departmentId: "dep-uct-ebe-civil", isActive: true },
  // Commerce
  { id: "prog-uct-com-econ", name: "BCom in Economics and Finance", departmentId: "dep-uct-com-finance", isActive: true },
  { id: "prog-uct-com-mktg", name: "BBusSc in Marketing", departmentId: "dep-uct-com-mgmt", isActive: true },
  // Health Sciences
  { id: "prog-uct-hlth-mbchb", name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)", departmentId: "dep-uct-health-med", isActive: true },
  // Fine Arts
  { id: "prog-uct-hum-fineart", name: "Bachelor of Arts in Fine Art", departmentId: "dep-uct-hum-arts", isActive: true },

  // --- DUT ---
  // Applied Science - Biotech
  { id: "prog-dut-biotech-dip", name: "Diploma in Biotechnology", departmentId: "dep-dut-app-biotech", isActive: true },
  { id: "prog-dut-food-adv", name: "Advanced Diploma in Food Technology", departmentId: "dep-dut-app-biotech", isActive: true },
  // Applied Science - Chem
  { id: "prog-dut-indchem-bsc", name: "Bachelor of Applied Science in Industrial Chemistry", departmentId: "dep-dut-app-chemistry", isActive: true },
  // Engineering - Civil
  { id: "prog-dut-civil-btech", name: "BTech in Civil Engineering", departmentId: "dep-dut-eng-civil", isActive: true },
  // Management - Hospitality
  { id: "prog-dut-hospitality-dip", name: "Diploma in Hospitality Management", departmentId: "dep-dut-mgmt-hospitality", isActive: true },

  // --- WITS ---
  // Computer Science / Math
  { id: "prog-wits-cs", name: "BSc in Computational Science", departmentId: "dep-wits-sci-cs", isActive: true },
  // CLM Econ
  { id: "prog-wits-bcom", name: "BCom in Accounting Science", departmentId: "dep-wits-clm-economics", isActive: true }
];

export const initialBursaries: Bursary[] = [
  // UCT Bursaries
  {
    id: "bursary-uct-stem",
    name: "Standard Chartered STEM Innovation Grant",
    institutionId: "uct",
    targetingScope: "Faculty",
    targetFacultyId: "fac-uct-ebe",
    faculty: "Engineering & the Built Environment (EBE)",
    programme: "All EBE Programmes",
    minGPA: 70,
    deadline: "2026-06-25",
    fundingType: "Merit-Based",
    slots: 10,
    applicantCount: 2,
    status: "Closing Soon",
    description: "Supports brilliant South African undergraduate students pursuing technological research or engineering inside EBE with high merit. Covers full tuition, computer allowances, and living stipends.",
    requiredDocuments: ["ID Copy", "Academic Transcript", "Motivational Letter", "Proof of Registration"]
  },
  {
    id: "bursary-uct-tech",
    name: "Investec Technology Leaders Scholarship",
    institutionId: "uct",
    targetingScope: "Programme",
    targetProgrammeId: "prog-uct-cs-compsci",
    faculty: "Engineering & the Built Environment (EBE)",
    programme: "BSc in Computer Science",
    minGPA: 75,
    deadline: "2026-07-20",
    fundingType: "Merit-Based",
    slots: 15,
    applicantCount: 1,
    status: "Open",
    description: "Designed for missing-middle students in Computer Science locked out of traditional NSFAS funding due to family income thresholds but who have excellent academic records.",
    requiredDocuments: ["ID Copy", "Academic Transcript", "Motivational Letter"]
  },
  {
    id: "bursary-uct-merit",
    name: "Discovery Health Merit Award",
    institutionId: "uct",
    targetingScope: "Department",
    targetDepartmentId: "dep-uct-health-med",
    faculty: "Faculty of Health Sciences",
    programme: "Department of Medicine",
    minGPA: 80,
    deadline: "2026-07-31",
    fundingType: "Merit-Based",
    slots: 5,
    applicantCount: 0,
    status: "Open",
    description: "Prestigious award covering medical, clinical research, or biomedical study costs for top-performing upper-year students in the Department of Medicine.",
    requiredDocuments: ["ID Copy", "Academic Transcript", "Motivational Letter", "Proof of Registration"]
  },
  {
    id: "bursary-uct-social",
    name: "Corporate Civic Outreach Fund",
    institutionId: "uct",
    targetingScope: "Institution",
    faculty: "Institution-wide",
    programme: "All Programmes",
    minGPA: 65,
    deadline: "2026-08-15",
    fundingType: "Departmental",
    slots: 8,
    applicantCount: 0,
    status: "Open",
    description: "A discretionary grant supporting students across any faculty at UCT who can demonstrate extensive volunteer community work.",
    requiredDocuments: ["ID Copy", "Academic Transcript"]
  },

  // DUT Bursaries
  {
    id: "bursary-dut-engineering",
    name: "Ethekwini Municipality Civil Engineering Bursary",
    institutionId: "dut",
    targetingScope: "Department",
    targetDepartmentId: "dep-dut-eng-civil",
    faculty: "Faculty of Engineering & the Built Environment",
    programme: "Department of Civil Engineering & Surveying",
    minGPA: 65,
    deadline: "2026-06-18",
    fundingType: "Financial Need",
    slots: 12,
    applicantCount: 0,
    status: "Closing Soon",
    description: "Targeted support for local Durban civil engineering diploma and degree students who are fully or partially unfunded and demonstrate commitment to municipal infrastructure.",
    requiredDocuments: ["ID Copy", "Academic Transcript", "Proof of Registration"]
  },
  {
    id: "bursary-dut-business",
    name: "Toyota SA Hospitality Management Grant",
    institutionId: "dut",
    targetingScope: "Programme",
    targetProgrammeId: "prog-dut-hospitality-dip",
    faculty: "Faculty of Management Sciences",
    programme: "Diploma in Hospitality Management",
    minGPA: 60,
    deadline: "2026-07-15",
    fundingType: "Open Merit",
    slots: 8,
    applicantCount: 0,
    status: "Open",
    description: "A partial financial aid bursary to cover textbook stipends and outstanding registration fees for students in Hospitality Management.",
    requiredDocuments: ["ID Copy", "Academic Transcript", "Motivational Letter"]
  },

  // Wits Bursaries
  {
    id: "bursary-wits-tech",
    name: "Silicon Johannesburg Hardware & IoT Grant",
    institutionId: "wits",
    targetingScope: "Faculty",
    targetFacultyId: "fac-wits-science",
    faculty: "Faculty of Science",
    programme: "All Science Programmes",
    minGPA: 75,
    deadline: "2026-07-12",
    fundingType: "Merit-Based",
    slots: 6,
    applicantCount: 0,
    status: "Open",
    description: "Supplements tuition and laboratory expenses for electronics, computer, and mathematical science specialists looking to solve South African logistics challenges.",
    requiredDocuments: ["ID Copy", "Academic Transcript", "Motivational Letter"]
  }
];

export const initialApplications: BursaryApplication[] = [
  {
    id: "app-1",
    bursaryId: "bursary-uct-stem",
    studentId: "9901015678082",
    studentName: "Sipho Khumalo",
    studentEmail: "sipho@myuct.ac.za",
    studentGPA: 82,
    studentFaculty: "Engineering & the Built Environment (EBE)",
    uploadedDocuments: ["ID Copy", "Academic Transcript"],
    submittedAt: "2026-06-11 14:32",
    status: "Under Review"
  },
  {
    id: "app-2",
    bursaryId: "bursary-uct-stem",
    studentId: "0103125678081",
    studentName: "Leandra Naidoo",
    studentEmail: "leandra@myuct.ac.za",
    studentGPA: 78,
    studentFaculty: "Engineering & the Built Environment (EBE)",
    uploadedDocuments: ["ID Copy", "Academic Transcript", "Motivational Letter", "Proof of Registration"],
    submittedAt: "2026-06-12 09:15",
    status: "Approved"
  },
  {
    id: "app-3",
    bursaryId: "bursary-uct-tech",
    studentId: "9901015678082",
    studentName: "Sipho Khumalo",
    studentEmail: "sipho@myuct.ac.za",
    studentGPA: 82,
    studentFaculty: "Engineering & the Built Environment (EBE)",
    uploadedDocuments: ["ID Copy", "Academic Transcript", "Motivational Letter"],
    submittedAt: "2026-06-11 15:44",
    status: "Under Review"
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-12 23:10:04",
    user: "System Daemon",
    role: "System",
    action: "Automated closing-soon flags parsed for UCT",
    ipAddress: "127.0.0.1"
  },
  {
    id: "log-2",
    timestamp: "2026-06-12 18:41:22",
    user: "UCT Institution Admin (Dr. Amanda Naidoo)",
    role: "Institution Admin",
    action: "Approved application for Leandra Naidoo (Investec Leaders Portfolio)",
    ipAddress: "196.24.44.82"
  },
  {
    id: "log-3",
    timestamp: "2026-06-12 11:24:55",
    user: "Super Admin (Global System Admin)",
    role: "Super Admin",
    action: "Onboarded Durban University of Technology dynamic catalog schema",
    ipAddress: "196.24.40.12"
  }
];
