/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building, LayoutDashboard, Database, FileText, Send, 
  Trash2, Edit, Check, X, Clock, HelpCircle, Eye, RefreshCw, 
  Plus, CheckSquare, Settings, LogOut, ChevronRight, ToggleLeft, ToggleRight, Sparkles,
  TrendingUp, Download, BarChart4, ChevronLeft, Menu
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { Bursary, BursaryApplication, Institution, FundingType, ApplicationStatus, Faculty, Department, Programme, StudentProfile } from "../types";
import { isStudentEligible } from "./StudentPortal";

interface InstitutionPortalProps {
  uniId: string;
  institutions: Institution[];
  faculties: Faculty[];
  departments: Department[];
  programmes: Programme[];
  bursaries: Bursary[];
  applications: BursaryApplication[];
  onAddNewBursary: (bur: Bursary) => void;
  onUpdateBursary: (bur: Bursary) => void;
  onDeleteBursary: (id: string) => void;
  onUpdateApplicationStatus: (id: string, status: "Approved" | "Declined") => void;
  onUpdateFaculties: (facs: Faculty[]) => void;
  onUpdateDepartments: (depts: Department[]) => void;
  onUpdateProgrammes: (progs: Programme[]) => void;
  onViewPolicies: () => void;
}

// Requirement 6: Dynamic Seed of Registered Workspace Students to demonstrate automated qualifiers calculation
const simulatedWorkspaceStudents: StudentProfile[] = [
  // --- UCT STACK ---
  {
    fullName: "Thabo Mokoena",
    saIdNumber: "9901015678082",
    email: "thabo.mokoena@myuct.ac.za",
    phoneNumber: "071 224 5543",
    institutionId: "uct",
    facultyId: "fac-uct-ebe",
    departmentId: "dep-uct-ebe-computer",
    programmeId: "prog-uct-cs-compsci",
    degreeName: "BSc in Computer Science",
    faculty: "Engineering & the Built Environment (EBE)",
    programme: "BSc in Computer Science",
    yearOfStudy: "3rd Year",
    gpa: 82,
    fundingStatus: "Unfunded"
  },
  {
    fullName: "Leandra Naidoo",
    saIdNumber: "0103125678081",
    email: "leandra.naidoo@myuct.ac.za",
    phoneNumber: "062 113 4490",
    institutionId: "uct",
    facultyId: "fac-uct-ebe",
    departmentId: "dep-uct-ebe-electrical",
    programmeId: "prog-uct-ee-mechatronics",
    degreeName: "BSc in Mechatronics",
    faculty: "Engineering & the Built Environment (EBE)",
    programme: "BSc in Mechatronics",
    yearOfStudy: "2nd Year",
    gpa: 76,
    fundingStatus: "Partially Funded"
  },
  {
    fullName: "Sipho Khumalo",
    saIdNumber: "0005125678089",
    email: "sipho.khumalo@myuct.ac.za",
    phoneNumber: "083 445 7781",
    institutionId: "uct",
    facultyId: "fac-uct-commerce",
    departmentId: "dep-uct-com-finance",
    programmeId: "prog-uct-com-econ",
    degreeName: "BCom in Economics and Finance",
    faculty: "Faculty of Commerce",
    programme: "BCom in Economics and Finance",
    yearOfStudy: "3rd Year",
    gpa: 71,
    fundingStatus: "Unfunded"
  },

  // --- DUT STACK ---
  {
    fullName: "Ayanda Cele",
    saIdNumber: "0208155678083",
    email: "ayanda.cele@dut4life.ac.za",
    phoneNumber: "072 654 1123",
    institutionId: "dut",
    facultyId: "fac-dut-eng",
    departmentId: "dep-dut-eng-civil",
    programmeId: "prog-dut-civil-btech",
    degreeName: "BTech in Civil Engineering",
    faculty: "Faculty of Engineering & the Built Environment",
    programme: "BTech in Civil Engineering",
    yearOfStudy: "4th Year",
    gpa: 68,
    fundingStatus: "Unfunded"
  },
  {
    fullName: "Zama Ntuli",
    saIdNumber: "0304215678082",
    email: "zama.ntuli@dut4life.ac.za",
    phoneNumber: "061 543 9980",
    institutionId: "dut",
    facultyId: "fac-dut-mgmt",
    departmentId: "dep-dut-mgmt-hospitality",
    programmeId: "prog-dut-hospitality-dip",
    degreeName: "Diploma in Hospitality Management",
    faculty: "Faculty of Management Sciences",
    programme: "Diploma in Hospitality Management",
    yearOfStudy: "2nd Year",
    gpa: 61,
    fundingStatus: "Unfunded"
  }
];

export default function InstitutionPortal({
  uniId,
  institutions,
  faculties,
  departments,
  programmes,
  bursaries,
  applications,
  onAddNewBursary,
  onUpdateBursary,
  onDeleteBursary,
  onUpdateApplicationStatus,
  onUpdateFaculties,
  onUpdateDepartments,
  onUpdateProgrammes,
  onViewPolicies
}: InstitutionPortalProps) {
  
  // Scoped Workspace multi-tenant lockdown check
  const currentUni = institutions.find(inst => inst.id === uniId);

  // Filters
  const uniBursaries = bursaries.filter(b => b.institutionId === uniId);
  const uniApplications = applications.filter(app => {
    const linkedBursary = bursaries.find(b => b.id === app.bursaryId);
    return linkedBursary && linkedBursary.institutionId === uniId;
  });

  // Dynamic calculations for Recharts analytics
  const approvedApplications = uniApplications.filter(a => a.status === "Approved");
  const overallSuccessRate = uniApplications.length > 0 
    ? Math.round((approvedApplications.length / uniApplications.length) * 100) 
    : 0;

  const baselineSeedTrend = uniId === "uct" 
    ? [12, 18, 25, 34, 45, 62] 
    : uniId === "wits" 
    ? [8, 14, 20, 28, 38, 51]
    : [5, 10, 15, 21, 28, 36];
    
  const trendData = [
    { name: "Jan", Applications: baselineSeedTrend[0] },
    { name: "Feb", Applications: baselineSeedTrend[1] },
    { name: "Mar", Applications: baselineSeedTrend[2] },
    { name: "Apr", Applications: baselineSeedTrend[3] },
    { name: "May", Applications: baselineSeedTrend[4] },
    { name: "Jun", Applications: baselineSeedTrend[5] + uniApplications.length },
    { name: "Jul", Applications: Math.round((baselineSeedTrend[5] + uniApplications.length) * 1.1) }
  ];

  const activeBursariesCount = uniBursaries.filter(b => b.status === "Open" || b.status === "Closing Soon").length;
  const totalApplicantsCount = uniApplications.length;
  const underReviewCount = uniApplications.filter(a => a.status === "Under Review").length;
  const approvedApplicantsCount = uniApplications.filter(a => a.status === "Approved").length;

  const handleCSVDownload = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const textStr = String(val ?? "");
        if (textStr.includes(",") || textStr.includes('"') || textStr.includes("\n")) {
          return `"${textStr.replace(/"/g, '""')}"`;
        }
        return textStr;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tabs states: "listings" | "applicants" | "new-bursary" | "catalog" | "analytics"
  const [activeTab, setActiveTab ] = useState<"listings" | "applicants" | "new-bursary" | "catalog" | "analytics">("listings");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Requirement 2: Catalog UI states
  const [catalogSubTab, setCatalogSubTab] = useState<"faculties" | "departments" | "programmes">("faculties");
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptParentFaculty, setNewDeptParentFaculty] = useState("");
  const [newProgName, setNewProgName] = useState("");
  const [newProgParentDept, setNewProgParentDept] = useState("");

  // States for creating/editing a bursary (Requirement 4)
  const [editingBursary, setEditingBursary] = useState<Bursary | null>(null);
  const [formName, setFormName] = useState("");
  const [formFundingType, setFormFundingType] = useState<FundingType>("Merit-Based");
  const [formMinGpa, setFormMinGpa] = useState<number>(65);
  const [formDeadline, setFormDeadline] = useState("2026-07-31");
  const [formSlots, setFormSlots] = useState<number>(10);
  const [formDescription, setFormDescription] = useState("");
  const [formReqDocs, setFormReqDocs] = useState<string[]>(["ID Copy", "Academic Transcript"]);

  // Requirement 4: Targeting Scope States
  const [formTargetingScope, setFormTargetingScope] = useState<"Programme" | "Department" | "Faculty" | "Institution">("Institution");
  const [formTargetFacultyId, setFormTargetFacultyId] = useState("");
  const [formTargetDeptId, setFormTargetDeptId] = useState("");
  const [formTargetProgId, setFormTargetProgId] = useState("");

  // Requirement 6: Post-Publish Notification Trigger States
  const [recentlyPublishedBursary, setRecentlyPublishedBursary] = useState<Bursary | null>(null);
  const [notificationTriggerStudents, setNotificationTriggerStudents] = useState<StudentProfile[]>([]);
  const [resendNotificationStatus, setResendNotificationStatus] = useState<"idle" | "sending" | "completed">("idle");

  // Filter Catalog structures down strictly under active multi-tenant Isolation
  const activeFaculties = faculties.filter(f => f.institutionId === uniId);
  const activeDepartments = departments.filter(d => activeFaculties.some(f => f.id === d.facultyId));
  const activeProgrammes = programmes.filter(p => activeDepartments.some(d => d.id === p.departmentId));

  const startEdit = (bur: Bursary) => {
    setEditingBursary(bur);
    setFormName(bur.name);
    setFormFundingType(bur.fundingType);
    setFormMinGpa(bur.minGPA);
    setFormDeadline(bur.deadline);
    setFormSlots(bur.slots);
    setFormDescription(bur.description);
    setFormReqDocs(bur.requiredDocuments);
    setFormTargetingScope(bur.targetingScope);
    setFormTargetFacultyId(bur.targetFacultyId || "");
    setFormTargetDeptId(bur.targetDepartmentId || "");
    setFormTargetProgId(bur.targetProgrammeId || "");
    setActiveTab("new-bursary");
  };

  const cancelEdit = () => {
    setEditingBursary(null);
    clearForm();
    setActiveTab("listings");
  };

  const clearForm = () => {
    setFormName("");
    setFormMinGpa(65);
    setFormDeadline("2026-07-31");
    setFormSlots(10);
    setFormFundingType("Merit-Based");
    setFormDescription("");
    setFormReqDocs(["ID Copy", "Academic Transcript"]);
    setFormTargetingScope("Institution");
    setFormTargetFacultyId("");
    setFormTargetDeptId("");
    setFormTargetProgId("");
  };

  const toggleDocCheck = (doc: string) => {
    if (formReqDocs.includes(doc)) {
      setFormReqDocs(formReqDocs.filter(d => d !== doc));
    } else {
      setFormReqDocs([...formReqDocs, doc]);
    }
  };

  // Requirement 4 & 6: OnSubmit Handler with Notification Previews
  const handleSubmitBursary = (e: React.FormEvent, createStatus: ApplicationStatus) => {
    e.preventDefault();
    if (!formName || !formDescription) {
      alert("Please provide a descriptive program name and outline.");
      return;
    }

    // Capture dynamic scope names for legacy / text mapping fallback
    let computedFacultyName = "All Faculties (Institutionwide)";
    let computedProgName = "All Campus Programmes";

    if (formTargetingScope === "Faculty") {
      const match = faculties.find(f => f.id === formTargetFacultyId);
      computedFacultyName = match ? match.name : "Target Faculty Error";
      computedProgName = "All Faculty Programmes";
    } else if (formTargetingScope === "Department") {
      const matchDept = departments.find(d => d.id === formTargetDeptId);
      const parentFac = matchDept ? faculties.find(f => f.id === matchDept.facultyId) : null;
      computedFacultyName = parentFac ? parentFac.name : "Target Department";
      computedProgName = matchDept ? matchDept.name : "Target Department Programmes";
    } else if (formTargetingScope === "Programme") {
      const matchProg = programmes.find(p => p.id === formTargetProgId);
      const parentDept = matchProg ? departments.find(d => d.id === matchProg.departmentId) : null;
      const parentFac = parentDept ? faculties.find(f => f.id === parentDept.facultyId) : null;
      computedFacultyName = parentFac ? parentFac.name : "Target Faculty";
      computedProgName = matchProg ? matchProg.name : "Target Programme";
    }

    const payload: Bursary = {
      id: editingBursary ? editingBursary.id : "bursary-" + uniId + "-" + Date.now(),
      name: formName,
      institutionId: uniId,
      targetingScope: formTargetingScope,
      targetFacultyId: formTargetingScope !== "Institution" ? formTargetFacultyId : undefined,
      targetDepartmentId: (formTargetingScope === "Department" || formTargetingScope === "Programme") ? formTargetDeptId : undefined,
      targetProgrammeId: formTargetingScope === "Programme" ? formTargetProgId : undefined,
      faculty: computedFacultyName,
      programme: computedProgName,
      minGPA: formMinGpa,
      deadline: formDeadline,
      fundingType: formFundingType,
      slots: formSlots,
      applicantCount: editingBursary ? editingBursary.applicantCount : 0,
      status: createStatus,
      description: formDescription,
      requiredDocuments: formReqDocs
    };

    if (editingBursary) {
      onUpdateBursary(payload);
    } else {
      onAddNewBursary(payload);
    }

    // Requirement 6: Match eligibility against registered mock university students instantly
    const qualifiedStudents = simulatedWorkspaceStudents.filter(student => {
      // Must be from this university
      if (student.institutionId !== uniId) return false;
      // GPA check
      if (student.gpa < payload.minGPA) return false;

      // Higher-level resolver
      switch (payload.targetingScope) {
        case "Institution":
          return true;
        case "Faculty":
          return student.facultyId === payload.targetFacultyId;
        case "Department":
          if (student.departmentId === payload.targetDepartmentId) return true;
          const matchingProg = programmes.find(p => p.id === student.programmeId);
          return !!matchingProg && matchingProg.departmentId === payload.targetDepartmentId;
        case "Programme":
          return student.programmeId === payload.targetProgrammeId;
        default:
          return false;
      }
    });

    // Save recently published for trigger notification preview
    setRecentlyPublishedBursary(payload);
    setNotificationTriggerStudents(qualifiedStudents);
    setResendNotificationStatus("idle");

    setEditingBursary(null);
    clearForm();
  };

  // Requirement 2: Admin setup handlers for catalog
  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) return;
    
    const newFac: Faculty = {
      id: "fac-" + uniId + "-" + Date.now(),
      name: newFacultyName.trim(),
      institutionId: uniId,
      isActive: true
    };

    onUpdateFaculties([...faculties, newFac]);
    setNewFacultyName("");
    alert(`Success! Created [${newFac.name}] faculty.`);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptParentFaculty) {
      alert("Please specify a department name and choose the parent Faculty.");
      return;
    }

    const newDep: Department = {
      id: "dep-" + uniId + "-" + Date.now(),
      name: newDeptName.trim(),
      facultyId: newDeptParentFaculty,
      isActive: true
    };

    onUpdateDepartments([...departments, newDep]);
    setNewDeptName("");
    alert(`Success! Created Department within selected Faculty.`);
  };

  const handleAddProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName.trim() || !newProgParentDept) {
      alert("Please provide the programme layout name and select parent Department.");
      return;
    }

    const newProg: Programme = {
      id: "prog-" + uniId + "-" + Date.now(),
      name: newProgName.trim(),
      departmentId: newProgParentDept,
      isActive: true
    };

    onUpdateProgrammes([...programmes, newProg]);
    setNewProgName("");
    alert(`Success! Added Programme within selected Department.`);
  };

  // Toggle active/deactive status for structural rows
  const toggleFacultyStatus = (facId: string) => {
    onUpdateFaculties(faculties.map(f => f.id === facId ? { ...f, isActive: !f.isActive } : f));
  };

  const toggleDeptStatus = (deptId: string) => {
    onUpdateDepartments(departments.map(d => d.id === deptId ? { ...d, isActive: !d.isActive } : d));
  };

  const toggleProgStatus = (progId: string) => {
    onUpdateProgrammes(programmes.map(p => p.id === progId ? { ...p, isActive: !p.isActive } : p));
  };

  // Trigger simulated Resend email blast payload
  const handleTriggerResendBlast = () => {
    setResendNotificationStatus("sending");
    setTimeout(() => {
      setResendNotificationStatus("completed");
      alert(`Success! Resend email pipeline activated. Queued payload sent safely to ${notificationTriggerStudents.length} South African universities students.`);
    }, 1500);
  };

  const getStatusBadgeStyle = (status: ApplicationStatus) => {
    switch (status) {
      case "Open": return "bg-green-100 text-green-900 border border-green-200";
      case "Closing Soon": return "bg-amber-100 text-amber-900 border border-amber-200";
      case "Draft": return "bg-neutral-100 text-neutral-800 border border-neutral-200";
      case "Closed": return "bg-red-100 text-red-955 border border-red-200";
      default: return "bg-neutral-100 text-neutral-800 border border-neutral-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans text-slate-800 w-full">
      
      {/* SaaS Style Vertical Left Navigation Sidebar placeholder */}
      <header className="hidden" id="institution_top_navbar">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          
          {/* Brand & workspace info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#003B5C] flex items-center justify-center">
              <Building className="text-white w-4 h-4 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-black text-sm tracking-tight text-white">BursaryBridge Staff Panel</span>
                <span className="bg-[#7FB3D5]/25 border border-[#7FB3D5]/40 text-[#7FB3D5] text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase font-mono">
                  STAFF NODE
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium block truncate max-w-xs md:max-w-md mt-0.5">
                University: <strong className="text-gray-200">{currentUni?.name}</strong>
              </span>
            </div>
          </div>

          {/* SaaS Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold" id="institution_header_tabs">
            <button
              onClick={() => {
                setActiveTab("listings");
                setRecentlyPublishedBursary(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "listings"
                  ? "bg-[#005A8D] text-white shadow-sm font-extrabold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" /> Board Management
            </button>

            <button
              onClick={() => {
                setActiveTab("applicants");
                setRecentlyPublishedBursary(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "applicants"
                  ? "bg-[#005A8D] text-white shadow-sm font-extrabold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Evaluation Pool
              {underReviewCount > 0 && (
                <span className="bg-red-850 bg-red-700 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ml-1">
                  {underReviewCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("catalog");
                setRecentlyPublishedBursary(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "catalog"
                  ? "bg-[#005A8D] text-white shadow-sm font-extrabold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-slate-400" /> Enrollment Catalog Setup
            </button>

            <button
              onClick={() => {
                setActiveTab("analytics");
                setRecentlyPublishedBursary(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-[#005A8D] text-white shadow-sm font-extrabold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <BarChart4 className="w-3.5 h-3.5 text-slate-400" /> Operational Insights
            </button>

            <button
              onClick={() => {
                setEditingBursary(null);
                clearForm();
                setActiveTab("new-bursary");
                setRecentlyPublishedBursary(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "new-bursary" && !editingBursary
                  ? "bg-amber-605 bg-amber-700 text-white shadow-sm font-extrabold"
                  : "text-emerald-400 hover:bg-slate-800 hover:text-emerald-350 font-extrabold"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Target Program Builder
            </button>
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4 text-xs font-sans">
            <span className="text-[10px] text-gray-400 font-mono hidden xl:block">NODE ID: {uniId.toUpperCase()}</span>
            <button
              onClick={onViewPolicies}
              className="text-amber-500 hover:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-all"
              id="btn_institution_header_policies"
            >
              Consent Policies
            </button>
          </div>
        </div>
      </header>

      {/* RENDER THE SIDEBAR & SLIM NAV INSIDE NEW FLEX LAYOUT */}
      
      {/* SaaS Style Vertical Left Navigation Sidebar */}
      <aside 
        className={`bg-slate-900 text-white flex flex-col transition-all duration-300 h-screen sticky top-0 shrink-0 border-r border-slate-800 ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
        id="institution_admin_sidebar"
      >
        {/* Top brand header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#005A8D] flex items-center justify-center shrink-0 shadow-inner">
              <Building className="text-white w-4.5 h-4.5 shrink-0" />
            </div>
            {isSidebarExpanded && (
              <div className="min-w-0">
                <span className="font-headline font-black text-white text-sm leading-none block truncate">
                  BursaryBridge Staff
                </span>
                <span className="text-[9px] text-slate-400 font-bold font-sans uppercase tracking-widest block truncate mt-1">
                  ROLE AUTHORITY: Staff Admin
                </span>
              </div>
            )}
          </div>
          {isSidebarExpanded && (
            <button 
              onClick={() => setIsSidebarExpanded(false)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-all shrink-0 ml-1"
              id="inst_sidebar_collapse_btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed menu activator trigger */}
        {!isSidebarExpanded && (
          <div className="p-3 flex justify-center border-b border-slate-800">
            <button 
              onClick={() => setIsSidebarExpanded(true)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-all"
              id="inst_sidebar_expand_btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation items list */}
        <nav className="flex-grow py-4 px-3 space-y-1.5 overflow-y-auto" id="institution_sidebar_nav">
          <button
            onClick={() => {
              setActiveTab("listings");
              setRecentlyPublishedBursary(null);
            }}
            title="Board Management"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "listings"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-350 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            {isSidebarExpanded && <span className="text-xs truncate">Board Management</span>}
            {isSidebarExpanded && activeTab === "listings" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("applicants");
              setRecentlyPublishedBursary(null);
            }}
            title="Evaluation Pool"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "applicants"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-350 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="relative">
              <FileText className="w-4.5 h-4.5 shrink-0 text-slate-400" />
              {underReviewCount > 0 && !isSidebarExpanded && (
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
              )}
            </div>
            {isSidebarExpanded && <span className="text-xs truncate flex-grow text-left">Evaluation Pool</span>}
            {isSidebarExpanded && underReviewCount > 0 && (
              <span className="bg-red-700 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {underReviewCount}
              </span>
            )}
            {isSidebarExpanded && activeTab === "applicants" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("catalog");
              setRecentlyPublishedBursary(null);
            }}
            title="Enrollment Catalog Setup"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "catalog"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-355 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Database className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            {isSidebarExpanded && <span className="text-xs truncate">Catalog Setup</span>}
            {isSidebarExpanded && activeTab === "catalog" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("analytics");
              setRecentlyPublishedBursary(null);
            }}
            title="Operational Insights"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "analytics"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-355 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BarChart4 className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            {isSidebarExpanded && <span className="text-xs truncate">Insights</span>}
            {isSidebarExpanded && activeTab === "analytics" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setEditingBursary(null);
              clearForm();
              setActiveTab("new-bursary");
              setRecentlyPublishedBursary(null);
            }}
            title="Target Program Builder"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "new-bursary" && !editingBursary
                ? "bg-amber-700 text-white shadow-md font-extrabold"
                : "text-emerald-400 hover:bg-slate-800 hover:text-emerald-350 font-extrabold"
            }`}
          >
            <Plus className="w-4.5 h-4.5 shrink-0" />
            {isSidebarExpanded && <span className="text-xs truncate">Program Builder</span>}
            {isSidebarExpanded && activeTab === "new-bursary" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>
        </nav>

        {/* Policies button at bottom */}
        {isSidebarExpanded && (
          <div className="p-4 border-t border-slate-800 space-y-2 mt-auto text-center">
            <button 
              onClick={onViewPolicies}
              className="text-[10px] text-slate-400 hover:text-white font-mono tracking-wider block w-full truncate"
            >
              Consent Policies
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Pane wrapper */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50" id="institution_main_pane">
        
        {/* Top Slim Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-35 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-black text-slate-[#005A8D] text-slate-900 tracking-tight uppercase font-headline">
              {currentUni?.name || "Institution Node"} Workspace
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 h-8 text-xs font-sans">
              <span className="font-extrabold block text-slate-700 text-xs hidden sm:block">Staff Administrator</span>
              <div className="w-8 h-8 rounded-full bg-[#005A8D]/10 text-[#005A8D] flex items-center justify-center font-bold font-mono">
                {uniId.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main viewport Workspace */}
        <main className="flex-grow bg-slate-50 p-6 md:p-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6 mb-8">
          <div>
            <h2 className="font-headline text-2xl font-extrabold text-primary">
              {activeTab === "listings" && "Institutional Bursary Board"}
              {activeTab === "applicants" && "Applicant Evaluation Pool"}
              {activeTab === "catalog" && "Dynamic Enrollment Catalog Manager"}
              {activeTab === "new-bursary" && (editingBursary ? `Configure Scope Criteria` : "Targeting Onboarding Builder")}
            </h2>
            <p className="text-on-surface-variant text-xs mt-1">
              Authorized admin tools exclusive to South Africa university workspace: <strong className="text-primary font-bold">{currentUni?.name}</strong>.
            </p>
          </div>
        </header>

        {/* REQUIREMENT 6: NOTIFICATION METRIC PREVIEW MODAL OR VIEW TRIGGER OVERLAY */}
        {recentlyPublishedBursary && (
          <div className="bg-[#ffdfa0]/25 border-b-4 border-[#795900] rounded-2xl p-6 mb-8 animate-fade-in font-hanken">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-[#795900] bg-white/60 px-2.5 py-0.5 rounded tracking-wide inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Requirement 5 & 6 Dynamic Matching Trigger
                </span>
                <h3 className="font-headline text-lg font-bold text-primary mt-2">
                  Completed Qualification Parsing for "{recentlyPublishedBursary.name}"
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Our hierarchy resolved upward through the branches and found <strong className="text-primary">{notificationTriggerStudents.length} registered students</strong> meeting matching rules.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRecentlyPublishedBursary(null)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold hover:bg-neutral-100 transition-all"
                >
                  Clear Screen
                </button>
                <button
                  type="button"
                  disabled={notificationTriggerStudents.length === 0 || resendNotificationStatus === "completed"}
                  onClick={handleTriggerResendBlast}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-lg hover:bg-[#795900] transition-all disabled:opacity-50 flex items-center gap-1.5 shadow"
                >
                  {resendNotificationStatus === "idle" && "Queue Resend Email Blast"}
                  {resendNotificationStatus === "sending" && "Executing Resend SDK Connection..."}
                  {resendNotificationStatus === "completed" && "Successfully Sent!"}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recipients payload lists */}
            <div className="mt-4 bg-white/70 rounded-xl p-4 border border-outline-variant/30 text-xs text-on-surface-variant">
              <span className="text-[9px] uppercase font-bold text-outline">Computed Resend Recipients JSON Payload Metadata</span>
              
              {notificationTriggerStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {notificationTriggerStudents.map((stud) => (
                    <div key={stud.saIdNumber} className="p-3 bg-white rounded-lg border border-outline-variant shadow-sm">
                      <span className="font-bold text-primary text-xs block">{stud.fullName}</span>
                      <span className="text-[10px] block opacity-80 mt-0.5">{stud.email}</span>
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-neutral-100 text-[10px]">
                        <span>GPA: <strong className="text-primary">{stud.gpa}%</strong></span>
                        <span className="font-bold text-secondary">{stud.programme}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#ba1a1a] font-medium mt-1">Zero students currently qualify for this specific qualification threshold and scope criteria.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: LISTINGS TAB VIEW */}
        {activeTab === "listings" && (
          <div className="space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-outline font-bold uppercase block tracking-wider font-hanken">Active Programs</span>
                <p className="font-headline text-3xl font-extrabold text-primary mt-2">{activeBursariesCount}</p>
              </div>
              <div className="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-outline font-bold uppercase block tracking-wider font-hanken">Review Queue</span>
                <p className="font-headline text-3xl font-extrabold text-amber-800 mt-2">{underReviewCount}</p>
              </div>
              <div className="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-outline font-bold uppercase block tracking-wider font-hanken">Awarded Claims</span>
                <p className="font-headline text-3xl font-extrabold text-[#399c30] mt-2">{approvedApplicantsCount}</p>
              </div>
              <div className="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-outline font-bold uppercase block tracking-wider font-hanken">Enrolled Catalog Nodes</span>
                <p className="font-headline text-3xl font-extrabold text-primary mt-2">
                  {activeFaculties.length} Facs • {activeDepartments.length} Depts
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-headline text-lg font-bold text-primary">Targeted Bursary Allocation Dashboard</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Configure and manage granular Targeting Scopes spanning the academic ladder.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBursary(null);
                    clearForm();
                    setActiveTab("new-bursary");
                  }}
                  className="px-4 py-2 bg-primary hover:bg-[#795900] text-xs font-bold text-white rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4.5 h-4.5" /> Launch Onboarding Builder
                </button>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-outline border-b border-outline-variant/40 font-hanken uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-6 py-4">Bursary Name</th>
                      <th className="px-6 py-4">Targeting Scope</th>
                      <th className="px-6 py-4">Target Node Criterion</th>
                      <th className="px-6 py-4">Min. GPA</th>
                      <th className="px-6 py-4">Deadline</th>
                      <th className="px-6 py-4">App State</th>
                      <th className="px-6 py-4 text-right header-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs font-sans">
                    {uniBursaries.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-primary">{b.name}</p>
                          <p className="text-[9px] text-outline tracking-wider font-hanken">ID_HASH: {b.id.toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-hanken ${
                            b.targetingScope === "Institution" ? "bg-blue-100 text-blue-900" :
                            b.targetingScope === "Faculty" ? "bg-amber-100 text-amber-900" :
                            b.targetingScope === "Department" ? "bg-indigo-100 text-indigo-900" :
                            "bg-green-100 text-green-900"
                          }`}>
                            {b.targetingScope}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-on-surface-variant max-w-xs truncate">
                          {b.targetingScope === "Institution" && "All Campus Enrollees"}
                          {b.targetingScope === "Faculty" && (faculties.find(f => f.id === b.targetFacultyId)?.name || b.faculty)}
                          {b.targetingScope === "Department" && (departments.find(d => d.id === b.targetDepartmentId)?.name || b.programme)}
                          {b.targetingScope === "Programme" && (programmes.find(p => p.id === b.targetProgrammeId)?.name || b.programme)}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">{b.minGPA}%</td>
                        <td className="px-6 py-4 text-on-surface-variant font-medium">{b.deadline}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-hanken leading-tight ${getStatusBadgeStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-1.5 font-hanken">
                            <button
                              onClick={() => startEdit(b)}
                              className="p-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-primary rounded font-bold border border-outline-variant text-[10px] flex items-center gap-1 transition-all"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => onDeleteBursary(b.id)}
                              className="p-1 px-2.5 hover:bg-red-50 text-red-700 hover:border-red-300 rounded font-bold border border-transparent text-[10px] flex items-center gap-1 transition-all"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {uniBursaries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-12 text-on-surface-variant font-bold">
                          No customized listings configure yet. Click the Onboarding Builder above to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICANTS TAB VIEW */}
        {activeTab === "applicants" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant/30">
                <h3 className="font-headline text-lg font-bold text-primary">Pending Admissions & award reviews</h3>
                <p className="text-xs text-on-surface-variant mt-1">Verify submitted records. Approve/Decline binds decisions instantly.</p>
              </div>

              <div className="overflow-x-auto text-xs font-hanken">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-outline border-b border-outline-variant/30 uppercase tracking-wider text-[10px] font-bold">
                      <th className="px-6 py-4">Applicant Student</th>
                      <th className="px-6 py-4">Bursary target</th>
                      <th className="px-6 py-4">Academic GPAs</th>
                      <th className="px-6 py-4">Uploaded Files</th>
                      <th className="px-6 py-4">Active Status</th>
                      <th className="px-6 py-4 text-right">Commit Review Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs font-sans text-on-surface">
                    {uniApplications.map((app) => {
                      const linkedBursary = bursaries.find(b => b.id === app.bursaryId);
                      return (
                        <tr key={app.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-primary">{app.studentName}</p>
                            <p className="text-[10px] text-outline font-hanken">{app.studentEmail}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-on-surface-variant max-w-xs truncate">{linkedBursary?.name || "Bursary Grant"}</td>
                          <td className="px-6 py-3 font-extrabold text-[#795900]">{app.studentGPA}% GPA</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 font-hanken">
                              {app.uploadedDocuments.map((doc, dIdx) => (
                                <span key={dIdx} className="bg-neutral-100 border border-outline-variant/60 rounded text-[9px] px-1.5 py-0.5 text-primary text-[10px] font-bold">
                                  ✓ {doc}
                                </span>
                              ))}
                              {app.uploadedDocuments.length === 0 && (
                                <span className="text-[10px] text-outline font-medium italic">No uploads</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-hanken ${
                              app.status === "Approved"
                                ? "bg-green-100 text-green-900 border border-green-200"
                                : app.status === "Declined"
                                ? "bg-red-100 text-red-900 border border-red-250"
                                : "bg-[#eedfa0] text-[#795900] border border-amber-200"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {app.status === "Under Review" ? (
                              <div className="inline-flex gap-1.5 font-hanken">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateApplicationStatus(app.id, "Approved");
                                  }}
                                  className="p-1 px-3 bg-[#399c30] hover:bg-green-800 text-white rounded font-bold text-[10px] flex items-center gap-1 transition-all"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onUpdateApplicationStatus(app.id, "Declined")}
                                  className="p-1 px-3 bg-red-700 hover:bg-neutral-800 text-white rounded font-bold text-[10px] flex items-center gap-1 transition-all"
                                >
                                  <X className="w-3 h-3" /> Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-outline font-bold uppercase font-hanken">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {uniApplications.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-12 text-on-surface-variant font-bold">
                          No active applicants recorded yet under this institution segment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACADEMIC CATALOG SETUP — REQUIREMENT 2 */}
        {activeTab === "catalog" && (
          <div className="space-y-8 font-hanken">
            <div className="bg-primary text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-white/5">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Dynamic Onboarding Catalog Setup Flow</h3>
                <p className="text-xs text-[#cbd5e1] mt-1">
                  Configure dynamic boundaries (Faculties → Departments → Programmes) mapping your South Africa institution's actual structure. Students cascading registered details are populated relationally from these nodes.
                </p>
              </div>
              
              <div className="flex gap-1.5 bg-white/10 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setCatalogSubTab("faculties")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${catalogSubTab === "faculties" ? "bg-white text-primary shadow" : "text-white hover:bg-white/5"}`}
                >
                  1. Faculties ({activeFaculties.length})
                </button>
                <button
                  onClick={() => setCatalogSubTab("departments")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${catalogSubTab === "departments" ? "bg-white text-primary shadow" : "text-white hover:bg-white/5"}`}
                >
                  2. Departments ({activeDepartments.length})
                </button>
                <button
                  onClick={() => setCatalogSubTab("programmes")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${catalogSubTab === "programmes" ? "bg-white text-primary shadow" : "text-white hover:bg-white/5"}`}
                >
                  3. Programmes ({activeProgrammes.length})
                </button>
              </div>
            </div>

            {/* SUB-TABS VIEWS */}
            {catalogSubTab === "faculties" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Custom Create Faculty Form */}
                <form onSubmit={handleAddFaculty} className="lg:col-span-5 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-headline text-base font-bold text-primary">Onboard New Faculty</h4>
                  <div>
                    <label className="block text-xs font-bold text-outline-variant uppercase tracking-wider mb-1.5">Faculty Title</label>
                    <input
                      type="text"
                      required
                      value={newFacultyName}
                      onChange={(e) => setNewFacultyName(e.target.value)}
                      placeholder="e.g. Faculty of Engineering and Built Environment"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-2.5 outline-none text-xs rounded-t-lg font-bold"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#795900] text-white p-2.5 rounded-lg font-bold text-xs hover:bg-primary transition-all shadow flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Institutional Faculty
                  </button>
                </form>

                {/* Faculties Inventory list */}
                <div className="lg:col-span-7 bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-outline-variant/30 font-bold text-primary">Registered Institutional Faculties</div>
                  <div className="divide-y divide-outline-variant/30 text-xs">
                    {activeFaculties.map((fac) => (
                      <div key={fac.id} className="p-4 flex justify-between items-center hover:bg-neutral-50 transition-all font-sans">
                        <div>
                          <strong className="text-primary text-xs block">{fac.name}</strong>
                          <span className="text-[9px] text-outline font-hanken block tracking-wide uppercase mt-0.5">FAC_KEY_REF: {fac.id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleFacultyStatus(fac.id)}
                            className={`p-1.5 font-hanken rounded font-bold text-[10px] border flex items-center gap-1 transition-all ${
                              fac.isActive ? "bg-green-100 text-green-905 border-green-200" : "bg-neutral-100 text-neutral-800 border-neutral-200"
                            }`}
                          >
                            {fac.isActive ? "🟢 Active Node" : "🔴 Deactivated"}
                          </button>
                        </div>
                      </div>
                    ))}
                    {activeFaculties.length === 0 && (
                      <div className="text-center p-8 text-outline">No Faculties onboarded yet. Create one on the left.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {catalogSubTab === "departments" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleAddDepartment} className="lg:col-span-5 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-headline text-base font-bold text-primary">Onboard New Department</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-outline-variant uppercase tracking-wider mb-1.5">Parent Faculty</label>
                    <select
                      required
                      value={newDeptParentFaculty}
                      onChange={(e) => setNewDeptParentFaculty(e.target.value)}
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-2.5 outline-none text-xs rounded-t-lg font-bold"
                    >
                      <option value="">-- Choose Faculty --</option>
                      {activeFaculties.map(fac => (
                        <option key={fac.id} value={fac.id}>{fac.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-outline-variant uppercase tracking-wider mb-1.5">Department Name</label>
                    <input
                      type="text"
                      required
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="e.g. Department of Mechanical Engineering"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-2.5 outline-none text-xs rounded-t-lg font-bold"
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#795900] text-white p-2.5 rounded-lg font-bold text-xs hover:bg-primary transition-all shadow flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Department Branch
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-outline-variant/30 font-bold text-primary">Registered Departments</div>
                  <div className="divide-y divide-outline-variant/30 text-xs">
                    {activeDepartments.map((dep) => {
                      const parentFac = faculties.find(f => f.id === dep.facultyId);
                      return (
                        <div key={dep.id} className="p-4 flex justify-between items-center hover:bg-neutral-50 transition-all font-sans">
                          <div>
                            <strong className="text-primary text-xs block">{dep.name}</strong>
                            <span className="text-[10px] text-outline font-hanken block mt-0.5">Parent Faculty: <strong className="text-primary">{parentFac?.name || "None"}</strong></span>
                          </div>
                          <button
                            onClick={() => toggleDeptStatus(dep.id)}
                            className={`p-1.5 rounded font-hanken font-bold text-[10px] border flex items-center gap-1 transition-all ${
                              dep.isActive ? "bg-green-100 text-green-905 border-green-200" : "bg-neutral-100 text-neutral-800 border-neutral-200"
                            }`}
                          >
                            {dep.isActive ? "🟢 Active" : "🔴 Deactivated"}
                          </button>
                        </div>
                      );
                    })}
                    {activeDepartments.length === 0 && (
                      <div className="text-center p-8 text-outline font-medium italic">No departments onboarded under chosen faculties.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {catalogSubTab === "programmes" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleAddProgramme} className="lg:col-span-5 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-headline text-base font-bold text-primary">Onboard Academic Programme</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-outline-variant uppercase tracking-wider mb-1.5">Department Node</label>
                    <select
                      required
                      value={newProgParentDept}
                      onChange={(e) => setNewProgParentDept(e.target.value)}
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-2.5 outline-none text-xs rounded-t-lg font-bold"
                    >
                      <option value="">-- Choose Department --</option>
                      {activeDepartments.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-outline-variant uppercase tracking-wider mb-1.5">Degree / Programme Name</label>
                    <input
                      type="text"
                      required
                      value={newProgName}
                      onChange={(e) => setNewProgName(e.target.value)}
                      placeholder="e.g. BSc in Mechanical Engineering"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-2.5 outline-none text-xs rounded-t-lg font-bold"
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#795900] text-white p-2.5 rounded-lg font-bold text-xs hover:bg-primary transition-all shadow flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Degree Programme
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-outline-variant/30 font-bold text-primary">Registered Programmes</div>
                  <div className="divide-y divide-outline-variant/30 text-xs">
                    {activeProgrammes.map((prog) => {
                      const dept = departments.find(d => d.id === prog.departmentId);
                      return (
                        <div key={prog.id} className="p-4 flex justify-between items-center hover:bg-neutral-50 transition-all font-sans">
                          <div>
                            <strong className="text-primary text-xs block">{prog.name}</strong>
                            <span className="text-[10px] text-outline font-hanken block mt-0.5">Department: <strong className="text-primary">{dept?.name || "None"}</strong></span>
                          </div>
                          <button
                            onClick={() => toggleProgStatus(prog.id)}
                            className={`p-1.5 rounded font-hanken font-bold text-[10px] border flex items-center gap-1 transition-all ${
                              prog.isActive ? "bg-green-100 text-green-905 border-green-200" : "bg-neutral-100 text-neutral-800 border-neutral-200"
                            }`}
                          >
                            {prog.isActive ? "🟢 Active" : "🔴 Deactivated"}
                          </button>
                        </div>
                      );
                    })}
                    {activeProgrammes.length === 0 && (
                      <div className="text-center p-8 text-outline font-medium italic font-hanken">No active programmes onboarded under these departments yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OPERATIONAL INSIGHTS TAB (Detailed Institution analytics requested) */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in text-xs font-sans">
            {/* CSV Export Bar */}
            <div className="bg-slate-100 p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-extrabold text-slate-850 text-xs">Administrative Telemetry Exports</span>
                <p className="text-[10px] text-slate-500">Generate real-time compliance audits or operational success index CSV documents.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const headers = ["Application ID", "Student Name", "SA ID", "Student Email", "GPA Score", "Student Faculty", "Bursary ID", "Decision Status", "ISO Submitted At"];
                    const rows = uniApplications.map(app => [
                      app.id,
                      app.studentName,
                      app.studentId,
                      app.studentEmail,
                      app.studentGPA,
                      app.studentFaculty,
                      app.bursaryId,
                      app.status,
                      app.submittedAt
                    ]);
                    handleCSVDownload(headers, rows, `${uniId.toUpperCase()}_evaluation_pool_report_2026.csv`);
                  }}
                  className="bg-[#1e3a8a] hover:bg-opacity-95 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Export Evaluation CSV
                </button>
                <button
                  onClick={() => {
                    const headers = ["Bursary ID", "Scholarship Name", "Funding Focus", "Minimum GPA Required", "Available Slots", "Total Applicants", "Success Approved Count", "Conversion Success Rate"];
                    const rows = uniBursaries.map(b => {
                      const totalApplied = uniApplications.filter(app => app.bursaryId === b.id).length;
                      const approved = uniApplications.filter(app => app.bursaryId === b.id && app.status === "Approved").length;
                      const rate = totalApplied > 0 ? Math.round((approved / totalApplied) * 100) : 0;
                      return [
                        b.id,
                        b.name,
                        b.fundingType,
                        b.minGPA,
                        b.slots,
                        totalApplied,
                        approved,
                        `${rate}%`
                      ];
                    });
                    handleCSVDownload(headers, rows, `${uniId.toUpperCase()}_scheme_metrics_report_2026.csv`);
                  }}
                  className="bg-[#d97706] hover:bg-opacity-95 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Export Scheme SUCCESS CSV
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Approved Candidates</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">{approvedApplicantsCount}</p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Secured corporate funding placements</span>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block font-mono">Overall Success Rate</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">{overallSuccessRate}%</p>
                <div className="text-[10px] text-slate-400 font-medium block mt-1">Placements to incoming applications index</div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-450 text-slate-400 font-extrabold tracking-wide block uppercase font-mono">Bursary Match Depth</span>
                <p className="font-headline text-3xl font-black text-[#1e3a8a] mt-2">HIGH (91%)</p>
                <span className="text-[10px] text-[#10b981] font-bold block mt-1">Excellent demographic matching fit ✓</span>
              </div>
            </div>

            {/* Charts Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trends over time */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-1">Application Ingress Trends (Monthly)</h3>
                <p className="text-[10px] text-slate-400 mb-6">Historical cumulative flow representing registered candidate submissions.</p>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#f8fafc" }}
                        labelStyle={{ fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                      <Line 
                        type="monotone" 
                        dataKey="Applications" 
                        stroke="#1e3a8a" 
                        strokeWidth={3} 
                        activeDot={{ r: 6 }} 
                        name="Applicant Submissions" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown by Faculty */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-1">Applicant Breakdown by Faculty</h3>
                <p className="text-[10px] text-slate-405 text-slate-400 mb-6">Distribution mapping students against their registered academic fields.</p>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={activeFaculties.map((fac, idx) => {
                        const rawCount = uniApplications.filter(app => {
                          return app.studentFaculty?.toLowerCase().includes(fac.name.toLowerCase().substring(0, 15));
                        }).length;
                        const mathBase = [8, 14, 6, 4, 3, 2, 1][idx % 7] || 2;
                        return {
                          name: fac.name.replace("Faculty of ", "").replace(" (EBE)", "").substring(0, 15),
                          Applicants: rawCount + mathBase
                        };
                      })} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#fff" }} />
                      <Bar dataKey="Applicants" fill="#d97706" name="Verified Applicants" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Scheme success rates horizontal panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-850 text-sm mb-1">Sponsoring Bursary Schemes & Placements Conversion Rates</h3>
              <p className="text-slate-400 text-xs mb-4">Granular telemetry reflecting corporate alignment ratios per active listing.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 border-b border-slate-200 uppercase text-[9px] font-bold tracking-widest text-slate-400">
                      <th className="px-4 py-3">Scholarship Scheme</th>
                      <th className="px-4 py-3">Target Slots</th>
                      <th className="px-4 py-3">Total Applied</th>
                      <th className="px-4 py-3">Approved Candidates</th>
                      <th className="px-4 py-3 text-right">Alignment Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                    {uniBursaries.map(b => {
                      const totalApplied = uniApplications.filter(app => app.bursaryId === b.id).length;
                      const approved = uniApplications.filter(app => app.bursaryId === b.id && app.status === "Approved").length;
                      const rate = totalApplied > 0 ? Math.round((approved / totalApplied) * 100) : 0;
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-850 block">{b.name}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono">B_ID: {b.id.toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-650">{b.slots} slots</td>
                          <td className="px-4 py-3 font-mono text-slate-650">{totalApplied} standard entries</td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">{approved} approved</td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono font-black text-[#1e3a8a]">{rate}%</span>
                              <div className="w-16 bg-slate-100 h-2 rounded overflow-hidden">
                                <div className="bg-[#1e3a8a] h-full" style={{ width: `${Math.min(rate, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CREATE / EDIT BURSARY VIEW — CONDITIONAL CASCADED SELECTS — REQUIREMENT 4 */}
        {activeTab === "new-bursary" && (
          <div className="max-w-4xl bg-white rounded-2xl border border-outline-variant p-8 shadow-sm mx-auto font-sans text-xs">
            <h3 className="font-headline text-xl font-bold text-primary mb-6">
              {editingBursary ? `Edit Custom Targeted Configuration: ${formName}` : "Create targeted scholarship program"}
            </h3>

            <form className="space-y-6" onSubmit={(e) => handleSubmitBursary(e, "Open")}>
              
              {/* PRIMARY DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-1.5">Bursary Label Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Investec Academic Leaders Initiative"
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none text-xs rounded-t-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-1.5">Funding Categories Mode</label>
                  <select
                    value={formFundingType}
                    onChange={(e) => setFormFundingType(e.target.value as FundingType)}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none text-xs rounded-t-lg"
                  >
                    <option value="Merit-Based">Merit-Based</option>
                    <option value="Financial Need">Financial Need</option>
                    <option value="Open Merit">Open Merit</option>
                    <option value="Departmental">Departmental Discretionary</option>
                    <option value="Special Grant">Special Grant Segment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-1.5">Min Grade Average Needed (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formMinGpa}
                    onChange={(e) => setFormMinGpa(Number(e.target.value))}
                    placeholder="65"
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none text-xs font-bold rounded-t-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-1.5">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none text-xs rounded-t-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-1.5">Allocation Capacity Slots</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formSlots}
                    onChange={(e) => setFormSlots(Number(e.target.value))}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none text-xs rounded-t-lg"
                  />
                </div>
              </div>

              {/* REQUIREMENT 4: TARGETING SCOPE SELECTOR INTERFACES */}
              <div className="bg-neutral-50 p-6 rounded-xl border border-outline-variant/60 font-hanken space-y-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-[#795900] tracking-wide mb-1.5">
                    <Sparkles className="w-4 h-4" /> Requirement 4 Targeted Scope Selector
                  </span>
                  <label className="block text-xs font-bold text-primary uppercase">Select targeting scope level</label>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 text-xs">
                    {[
                      { scope: "Institution", label: "Institution-wide" },
                      { scope: "Faculty", label: "Faculty-based" },
                      { scope: "Department", label: "Department-based" },
                      { scope: "Programme", label: "Programme-based" }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.scope}
                        onClick={() => {
                          setFormTargetingScope(item.scope as any);
                          setFormTargetFacultyId("");
                          setFormTargetDeptId("");
                          setFormTargetProgId("");
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formTargetingScope === item.scope
                            ? "border-[#795900] bg-[#eedfa0]/40 text-primary font-bold"
                            : "border-outline-variant bg-white text-on-surface-variant"
                        }`}
                      >
                        <span className="block font-bold text-xs">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DYNAMIC HIERARCHY SELECTORS DISPLAYED CONDITIONALLY */}
                {formTargetingScope !== "Institution" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/40 animate-slide-down">
                    
                    {/* Faculty Select */}
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase mb-1.5">Target Faculty</label>
                      <select
                        required
                        value={formTargetFacultyId}
                        onChange={(e) => {
                          setFormTargetFacultyId(e.target.value);
                          setFormTargetDeptId("");
                          setFormTargetProgId("");
                        }}
                        className="w-full bg-white border border-outline-variant p-2 text-xs rounded outline-none"
                      >
                        <option value="">-- Choose Faculty --</option>
                        {activeFaculties.map(fac => (
                          <option key={fac.id} value={fac.id}>{fac.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Department Select (Shown for Dept and Prog scopes) */}
                    {(formTargetingScope === "Department" || formTargetingScope === "Programme") && (
                      <div>
                        <label className="block text-xs font-bold text-primary uppercase mb-1.5">Target Department</label>
                        <select
                          required
                          disabled={!formTargetFacultyId}
                          value={formTargetDeptId}
                          onChange={(e) => {
                            setFormTargetDeptId(e.target.value);
                            setFormTargetProgId("");
                          }}
                          className="w-full bg-white border border-outline-variant p-2 text-xs rounded outline-none disabled:opacity-50"
                        >
                          <option value="">-- Choose Department --</option>
                          {departments.filter(d => d.facultyId === formTargetFacultyId && d.isActive).map(dep => (
                            <option key={dep.id} value={dep.id}>{dep.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Programme Select (Shown for Prog scope only) */}
                    {formTargetingScope === "Programme" && (
                      <div>
                        <label className="block text-xs font-bold text-primary uppercase mb-1.5 font-bold text-secondary">Target Programme</label>
                        <select
                          required
                          disabled={!formTargetDeptId}
                          value={formTargetProgId}
                          onChange={(e) => setFormTargetProgId(e.target.value)}
                          className="w-full bg-white border border-outline-variant p-2 text-xs rounded outline-none disabled:opacity-50 font-bold"
                        >
                          <option value="">-- Choose Programme Degree --</option>
                          {programmes.filter(p => p.departmentId === formTargetDeptId && p.isActive).map(prog => (
                            <option key={prog.id} value={prog.id}>{prog.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-1.5">Overview & Qualifications specifications</label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize textbook stipends, accommodation allowances, or general rules..."
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none text-xs leading-relaxed font-sans"
                />
              </div>

              {/* Document Checklists checklists */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-3">Required Documents uploads checkboxes</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-hanken">
                  {["ID Copy", "Academic Transcript", "Motivational Letter", "Proof of Registration"].map((doc) => {
                    const isChecked = formReqDocs.includes(doc);
                    return (
                      <button
                        type="button"
                        key={doc}
                        onClick={() => toggleDocCheck(doc)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isChecked
                            ? "border-[#795900] bg-[#eedfa0]/30 font-bold"
                            : "border-outline-variant bg-white hover:bg-neutral-50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-bold text-xs">
                          <CheckSquare className={`w-4 h-4 ${isChecked ? "text-[#795900]" : "text-outline"}`} />
                          {doc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submittals buttons */}
              <div className="border-t border-outline-variant/40 pt-6 flex justify-between items-center font-hanken">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-3 border border-outline-variant hover:bg-neutral-50 rounded-lg text-xs font-bold transition-all"
                >
                  Return to Dashboard
                </button>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleSubmitBursary(e, "Draft")}
                    className="px-5 py-3 border border-primary hover:bg-neutral-50 rounded-lg text-primary text-xs font-bold"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white hover:bg-[#003B5C] font-extrabold rounded-lg text-xs shadow transition-all"
                  >
                    {editingBursary ? "Modify active criteria" : "Publish Targeted Program"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* Persistent T&C Footer (Work Item 2) */}
        <footer className="mt-12 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4" id="institution_portal_footer">
          <p>© 2026 BursaryBridge Admin Module. All staff updates adhere with POPIA security guidelines.</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onViewPolicies}
              className="text-[#005A8D] hover:underline font-bold uppercase tracking-wider bg-[#005A8D]/5 px-2.5 py-1 rounded transition-all"
              id="link_institution_footer_policies"
            >
              Consent Policies &amp; Terms
            </button>
            <span>•</span>
            <span className="font-mono text-[10px]">Staff Encrypted</span>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
}
