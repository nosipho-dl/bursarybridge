/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building, GraduationCap, ArrowRight, ArrowLeft, CheckCircle2, 
  AlertCircle, Bookmark, Star, Sparkles, FileText, Upload, 
  FileCheck, ShieldAlert, Award, Calendar, BadgePercent
} from "lucide-react";
import { StudentProfile, Bursary, BursaryApplication, Institution, Faculty, Department, Programme } from "../types";

interface StudentPortalProps {
  profile: StudentProfile | null;
  onSaveProfile: (profile: StudentProfile) => void;
  institutions: Institution[];
  faculties: Faculty[];
  departments: Department[];
  programmes: Programme[];
  bursaries: Bursary[];
  applications: BursaryApplication[];
  onAddNewApplication: (app: BursaryApplication) => void;
  onResetStudentState: () => void;
}

// Requirement 5: Eligibility Matching Logic
export function isStudentEligible(
  student: {
    institutionId: string;
    facultyId: string;
    departmentId: string;
    programmeId: string;
    gpa: number;
  },
  bursary: Bursary,
  departments: Department[],
  programmes: Programme[]
): boolean {
  // 1. Isolation check: Must serve registered university
  if (student.institutionId !== bursary.institutionId) return false;

  // 2. Draft status check
  if (bursary.status === "Draft") return false;

  // 3. GPA threshold filtering
  if (student.gpa < bursary.minGPA) return false;

  // 4. Scope-based dynamic hierarchy checks
  switch (bursary.targetingScope) {
    case "Institution":
      // Institution-wide matches all students registered at this institution
      return true;

    case "Faculty":
      // Faculty scope: matches if student's selected facultyId matches targeted facultyId
      return student.facultyId === bursary.targetFacultyId;

    case "Department":
      // Department scope: student belongs to the targeted department directly,
      // or student's programme belongs to the targeted department
      if (student.departmentId === bursary.targetDepartmentId) return true;
      
      const pMatch = programmes.find(p => p.id === student.programmeId);
      return !!pMatch && pMatch.departmentId === bursary.targetDepartmentId;

    case "Programme":
      // Programme scope: matches if student's selected programmeId is targeted programmeId
      return student.programmeId === bursary.targetProgrammeId;

    default:
      return false;
  }
}

export default function StudentPortal({
  profile,
  onSaveProfile,
  institutions,
  faculties,
  departments,
  programmes,
  bursaries,
  applications,
  onAddNewApplication,
  onResetStudentState
}: StudentPortalProps) {
  // Wizard steps: 1 = Personal Details, 2 = Hierarchical Academic Details, 3 = Eligible Matches & Apply View
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(profile ? 3 : 1);
  
  // Wizard Input States
  const [formName, setFormName] = useState(profile?.fullName || "");
  const [formId, setFormId] = useState(profile?.saIdNumber || "");
  const [formEmail, setFormEmail] = useState(profile?.email || "");
  const [formPhone, setFormPhone] = useState(profile?.phoneNumber || "");
  const [formUniId, setFormUniId] = useState(profile?.institutionId || "");
  
  // Requirement 3: Cascading Dropdowns States
  const [formFacultyId, setFormFacultyId] = useState(profile?.facultyId || "");
  const [formDeptId, setFormDeptId] = useState(profile?.departmentId || "");
  const [formProgId, setFormProgId] = useState(profile?.programmeId || "");
  const [formDegreeName, setFormDegreeName] = useState(profile?.degreeName || ""); // free text display purposes only
  
  const [formYear, setFormYear] = useState(profile?.yearOfStudy || "1st Year");
  const [formGpa, setFormGpa] = useState<number>(profile?.gpa || 0);
  const [formFunding, setFormFunding] = useState<"Unfunded" | "Partially Funded" | "Fully Funded" | null>(
    profile?.fundingStatus || null
  );

  // Auto-select institution matching student email domain
  useEffect(() => {
    if (formEmail.includes("@") && !formUniId) {
      const domain = formEmail.split("@")[1].toLowerCase();
      const matchedUni = institutions.find(inst => domain.endsWith(inst.domain));
      if (matchedUni) {
        setFormUniId(matchedUni.id);
      }
    }
  }, [formEmail, institutions, formUniId]);

  // Derived filtered cascading listings
  const availableFaculties = faculties.filter(f => f.institutionId === formUniId && f.isActive);
  const availableDepartments = departments.filter(d => d.facultyId === formFacultyId && d.isActive);
  const availableProgrammes = programmes.filter(p => p.departmentId === formDeptId && p.isActive);

  // Handle step NAVIGATION
  const handleGoToAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formUniId) {
      alert("Please enter your name, email, and make sure your institution is selected.");
      return;
    }
    setWizardStep(2);
  };

  const handleFinishWizard = () => {
    if (!formFacultyId || !formDeptId || !formProgId) {
      alert("Eligibility requires selecting your exact Faculty, Department, and Programme through the cascading filters.");
      return;
    }
    if (formGpa <= 0 || formGpa > 100) {
      alert("Please specify a valid academic score average between 1% and 100%.");
      return;
    }

    const matchedFaculty = faculties.find(f => f.id === formFacultyId);
    const matchedProg = programmes.find(p => p.id === formProgId);

    const updatedProfile: StudentProfile = {
      fullName: formName,
      saIdNumber: formId,
      email: formEmail,
      phoneNumber: formPhone,
      institutionId: formUniId,
      facultyId: formFacultyId,
      departmentId: formDeptId,
      programmeId: formProgId,
      degreeName: formDegreeName,
      faculty: matchedFaculty?.name || "All",
      programme: matchedProg?.name || formDegreeName || "All",
      yearOfStudy: formYear,
      gpa: formGpa,
      fundingStatus: formFunding
    };

    onSaveProfile(updatedProfile);
    setWizardStep(3);
  };

  // State for student main menu sub-views ("matches" | "all-listings" | "my-applications")
  const [studentTab, setStudentTab] = useState<"matches" | "all-listings" | "my-applications">("matches");
  const [selectedBursaryForApply, setSelectedBursaryForApply] = useState<Bursary | null>(null);

  // Search query inputs & simple filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterFunding, setFilterFunding] = useState<string>("All");

  // Document upload tracker for active applications
  const [docUploads, setDocUploads] = useState<{ [doc: string]: boolean }>({});

  const activeInstitution = institutions.find(inst => inst.id === profile?.institutionId);

  const simulateUploadToken = (docName: string) => {
    setDocUploads(prev => ({ ...prev, [docName]: true }));
  };

  const submitSimulationApplication = () => {
    if (!selectedBursaryForApply || !profile) return;
    
    const newApp: BursaryApplication = {
      id: "app-new-" + Date.now(),
      bursaryId: selectedBursaryForApply.id,
      studentId: profile.saIdNumber || "MOCK-ID",
      studentName: profile.fullName,
      studentEmail: profile.email,
      studentGPA: profile.gpa,
      studentFaculty: profile.faculty,
      uploadedDocuments: Object.keys(docUploads).filter(k => docUploads[k]),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: "Under Review"
    };

    onAddNewApplication(newApp);
    alert(`Application submitted successfully to reviewers at ${activeInstitution?.name}.`);
    setSelectedBursaryForApply(null);
    setDocUploads({});
    setStudentTab("my-applications");
  };

  // Filter listings based on current university, excluding Drafts
  const availableBursariesList = bursaries.filter(bur => {
    if (!profile) return false;
    if (bur.institutionId !== profile.institutionId) return false;
    if (bur.status === "Draft") return false;

    if (searchQuery && 
        !bur.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !bur.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filterFunding !== "All" && bur.fundingType !== filterFunding) {
      return false;
    }

    return true;
  });

  // Dynamic targeting list based on eligibility matching logic (Requirement 5)
  const matchedRecommendations = bursaries.filter(bur => {
    if (!profile) return false;
    return isStudentEligible(profile, bur, departments, programmes);
  });

  // Circular GPA progress ring computation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(formGpa, 100) / 100) * circumference;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface">
      
      {/* Student Header */}
      <header className="bg-white border-b border-outline-variant/30 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center">
            <GraduationCap className="text-secondary-container w-5 h-5" />
          </div>
          <div>
            <span className="font-headline font-semibold text-lg text-primary">BursaryBridge</span>
            <span className="text-[10px] uppercase font-bold text-secondary font-hanken ml-2 px-1.5 py-0.5 rounded bg-secondary-container/20">
              Student Hub
            </span>
          </div>
        </div>

        {profile && (
          <div className="flex items-center gap-4 text-xs font-hanken">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-primary">{profile.fullName}</p>
              <p className="text-on-surface-variant text-[10px]">University: <strong className="text-primary">{activeInstitution?.name}</strong></p>
            </div>
            <button
              onClick={() => {
                onResetStudentState();
                setWizardStep(1);
              }}
              className="px-3 py-1.5 border border-outline-variant hover:bg-neutral-100 text-on-surface-variant font-bold rounded-lg transition-all"
            >
              Reset Session
            </button>
          </div>
        )}
      </header>

      {/* STEP 1: Personal Details */}
      {wizardStep === 1 && (
        <main className="flex-grow flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <aside className="lg:col-span-4 bg-primary-container text-on-primary-container p-8 rounded-2xl shadow-sm">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-secondary-container font-hanken mb-6">
                <Sparkles className="w-4 h-4" /> Step 1 of 2
              </span>
              <h2 className="font-headline text-2xl font-bold text-white mb-4">Centralized Bursary Portal</h2>
              <p className="text-sm text-primary-fixed-dim leading-relaxed mb-6">
                Enter your basic details to lock in your workspace. We securely match you directly with dynamic academic programs from corporate sponsors.
              </p>

              <div className="space-y-6 pt-6 border-t border-white/10 font-hanken">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-primary font-bold flex items-center justify-center text-xs">1</div>
                  <span className="text-xs font-bold text-white">Student Information</span>
                </div>
                <div className="flex items-center gap-3 opacity-55">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-xs">2</div>
                  <span className="text-xs font-bold text-white">Cascading Program Details</span>
                </div>
                <div className="flex items-center gap-3 opacity-55">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-xs">3</div>
                  <span className="text-xs font-bold text-white">Targeted Match Pipeline</span>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-8 bg-white border border-outline-variant rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary">Student Registration</h1>
                <p className="text-sm text-on-surface-variant mt-1">Provide your verified academic identity contact credentials.</p>
              </div>

              <form onSubmit={handleGoToAcademic} className="space-y-6 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide font-hanken">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Sipho Khumalo"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide font-hanken">South African ID Number</label>
                    <input
                      type="text"
                      maxLength={13}
                      required
                      value={formId}
                      onChange={(e) => setFormId(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 9901015678082"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide font-hanken">University Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. student@myuct.ac.za"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg"
                    />
                    <p className="text-[10px] text-on-surface-variant mt-1.5 font-sans leading-tight">
                      *Email suffixes automatically lock your workspace. (Use <span className="text-primary font-bold">myuct.ac.za</span> for UCT, or <span className="text-primary font-bold">dut4life.ac.za</span> for DUT).
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide font-hanken">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. 071 234 5678"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg"
                    />
                  </div>
                </div>

                <div className="border-t border-outline-variant/45 pt-6">
                  <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide font-hanken">Institution Domain Workspace</label>
                  <select
                    required
                    value={formUniId}
                    onChange={(e) => {
                      setFormUniId(e.target.value);
                      setFormFacultyId("");
                      setFormDeptId("");
                      setFormProgId("");
                    }}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg font-bold text-primary"
                  >
                    <option value="">-- Autodetect or Select University --</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.domain})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end pt-4 font-hanken">
                  <button
                    type="submit"
                    className="bg-[#795900] text-white px-8 py-3.5 rounded-xl font-extrabold flex items-center gap-2 hover:bg-[#ffdfa0] hover:text-primary transition-all active:scale-95 duration-100 shadow-sm"
                  >
                    Next: Cascading Academic Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* STEP 2: Academic Details — Dynamic Cascading Dropdowns */}
      {wizardStep === 2 && (
        <main className="flex-grow flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <aside className="lg:col-span-3 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col gap-6 font-hanken">
                <div className="flex items-center gap-3 text-[#399c30]">
                  <CheckCircle2 className="w-5 h-5 text-[#399c30]" />
                  <span className="text-xs font-bold">1. Personal Details Verified</span>
                </div>
                <div className="flex items-center gap-3 text-primary">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-primary font-bold flex items-center justify-center text-xs">2</div>
                  <span className="text-xs font-bold">2. Cascading Academic Details</span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high text-outline font-bold flex items-center justify-center text-xs">3</div>
                  <span className="text-xs font-bold">3. Match Eligibility Results</span>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-6 bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
              <h2 className="font-headline text-2xl font-bold text-primary">Academic Allocation</h2>
              <p className="text-sm text-on-surface-variant mb-6">Select your exact program fields using dynamic cascading options.</p>

              <div className="space-y-5 mb-8">
                
                {/* 1. FACULTY SELECT */}
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5 uppercase font-hanken">1. Select Faculty</label>
                  <select
                    required
                    value={formFacultyId}
                    onChange={(e) => {
                      setFormFacultyId(e.target.value);
                      setFormDeptId("");
                      setFormProgId("");
                    }}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg"
                  >
                    <option value="">-- Select Faculty --</option>
                    {availableFaculties.map(fac => (
                      <option key={fac.id} value={fac.id}>{fac.name}</option>
                    ))}
                  </select>
                  {formUniId && availableFaculties.length === 0 && (
                    <p className="text-xs text-amber-800 mt-1">No faculties currently declared by this institution admin yet.</p>
                  )}
                </div>

                {/* 2. DEPARTMENT SELECT (CASCADED) */}
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5 uppercase font-[#795900] font-hanken">
                    2. Select Department {formFacultyId ? "" : "(Select Faculty first)"}
                  </label>
                  <select
                    required
                    disabled={!formFacultyId}
                    value={formDeptId}
                    onChange={(e) => {
                      setFormDeptId(e.target.value);
                      setFormProgId("");
                    }}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg disabled:opacity-50"
                  >
                    <option value="">-- Select Department --</option>
                    {availableDepartments.map(dep => (
                      <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. PROGRAMME SELECT (CASCADED) */}
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5 uppercase font-hanken">
                    3. Select Programme {formDeptId ? "" : "(Select Department first)"}
                  </label>
                  <select
                    required
                    disabled={!formDeptId}
                    value={formProgId}
                    onChange={(e) => {
                      setFormProgId(e.target.value);
                    }}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg disabled:opacity-50 font-bold"
                  >
                    <option value="">-- Select Programme Degree --</option>
                    {availableProgrammes.map(prog => (
                      <option key={prog.id} value={prog.id}>{prog.name}</option>
                    ))}
                  </select>
                </div>

                {/* 4. FREE TEXT DISPLAY DEGREE NAME */}
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5 uppercase font-hanken">
                    Free-Text Degree Title <span className="text-on-surface-variant text-[10px] font-normal font-sans">(Display purposes only, e.g. Specialization major)</span>
                  </label>
                  <input
                    type="text"
                    value={formDegreeName}
                    onChange={(e) => setFormDegreeName(e.target.value)}
                    placeholder="e.g. Bachelor of Science Honours (Neuroscience)"
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-3 outline-none focus:border-primary transition-all rounded-t-lg"
                  />
                </div>

                {/* STUDY YEAR */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase font-hanken">Study Year</label>
                    <select
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-2.5 outline-none focus:border-primary transition-all rounded-t-lg"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="Honours">Honours Postgraduate</option>
                      <option value="Masters/PhD">Masters / Doctoral Candidate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase font-hanken">Academic Average / GPA (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={formGpa || ""}
                      onChange={(e) => setFormGpa(Number(e.target.value))}
                      placeholder="e.g. 78"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant p-2.5 outline-none focus:border-primary transition-all rounded-t-lg font-bold"
                    />
                  </div>
                </div>

                {/* SPONSOR CRITERIA HELP WHEEL */}
                <div className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 flex items-center justify-between gap-4 mt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-outline-variant block">Academic average verification status</span>
                    <span className="text-sm font-bold text-primary">{formGpa >= 65 ? "🏆 Confirmed Above Matric 65% Minimum Threshold" : "⚠️ Enter score above 65% to qualify for awards"}</span>
                  </div>
                  {formGpa > 0 && (
                    <div className="shrink-0 p-2 rounded bg-secondary-container/20 text-[#795900] font-hanken font-bold text-sm">
                      {formGpa}% GPA
                    </div>
                  )}
                </div>

                {/* FUNDING SELECTOR */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-primary uppercase tracking-wide font-hanken mb-1">
                    Current Sponsor Funding Status
                  </label>
                  <div className="grid grid-cols-3 gap-3 font-hanken">
                    {["Unfunded", "Partially Funded", "Fully Funded"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormFunding(option as any)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formFunding === option
                            ? "border-[#795900] bg-[#eedfa0]/30 text-[#795900] font-bold"
                            : "border-outline-variant bg-white hover:bg-neutral-50 text-xs"
                        }`}
                      >
                        <span className="font-bold text-xs block">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-between items-center font-hanken border-t border-outline-variant/30 pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-5 py-2.5 border border-primary text-primary font-bold rounded-lg hover:bg-neutral-100 transition-all flex items-center gap-1.5 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> General Info
                </button>
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="px-7 py-3 bg-[#795900] text-white font-extrabold rounded-lg hover:bg-[#ffdfa0] hover:text-primary transition-all flex items-center gap-1.5 shadow-sm text-xs"
                >
                  Verify Eligible Matches
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <aside className="lg:col-span-3 space-y-4 font-hanken">
              <div className="bg-primary text-white p-6 rounded-xl border border-white/10 shadow-md">
                <Sparkles className="text-secondary-container w-7 h-7 mb-2" />
                <h3 className="font-headline text-md font-bold mb-1.5">Strict Workspace Bounds</h3>
                <p className="text-xs text-primary-fixed-dim leading-relaxed">
                  BursaryBridge ensures your profile remains localized inside your institution workspace. Admins cannot see records from other South African universities.
                </p>
              </div>

              <div className="p-4 bg-white border border-outline-variant rounded-xl">
                <span className="text-[10px] text-outline font-bold uppercase block tracking-wider mb-2">Relational Hierarchy Mapping</span>
                <div className="space-y-2 text-[11px] text-on-surface-variant font-medium leading-tight">
                  <div className="p-2 bg-neutral-50 rounded">
                    <strong className="text-primary block">Institution:</strong>
                    {institutions.find(i => i.id === formUniId)?.name || 'Needs Selection'}
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <strong className="text-primary block">Active Faculty:</strong>
                    {faculties.find(f => f.id === formFacultyId)?.name || 'Needs Selection'}
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <strong className="text-primary block">Department Node:</strong>
                    {departments.find(d => d.id === formDeptId)?.name || 'Needs Selection'}
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <strong className="text-primary block">Programme Target:</strong>
                    {programmes.find(p => p.id === formProgId)?.name || 'Needs Selection'}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* STEP 3: Active Student Portal Dashboard */}
      {wizardStep === 3 && profile && (
        <div className="flex-grow flex flex-col md:flex-row relative">
          
          {/* Dashboard Left Side Rail Navigation */}
          <aside className="w-full md:w-64 bg-white border-r border-outline-variant/30 flex flex-col py-6 shrink-0 font-hanken">
            <div className="px-6 mb-6 pb-4 border-b border-outline-variant/30">
              <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">INSTITUTION WORKSPACE</span>
              <div className="flex items-center gap-2 mt-1.5 text-primary">
                <Building className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-xs truncate leading-snug">{activeInstitution?.name}</span>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 px-4">
              <button
                onClick={() => {
                  setStudentTab("matches");
                  setSelectedBursaryForApply(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                  studentTab === "matches" && !selectedBursaryForApply
                    ? "bg-secondary-container text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Sparkles className="w-4 h-4 text-secondary" /> Dynamic Match Pipeline
                <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {matchedRecommendations.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setStudentTab("all-listings");
                  setSelectedBursaryForApply(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                  studentTab === "all-listings" && !selectedBursaryForApply
                    ? "bg-secondary-container text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Building className="w-4 h-4" /> All Campus Listings
              </button>

              <button
                onClick={() => {
                  setStudentTab("my-applications");
                  setSelectedBursaryForApply(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                  studentTab === "my-applications" && !selectedBursaryForApply
                    ? "bg-secondary-container text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <FileText className="w-4 h-4" /> Submitted Applications
                <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {applications.filter(app => app.studentId === profile.saIdNumber).length}
                </span>
              </button>
            </nav>

            {/* Profile summary card inside footer rail */}
            <div className="px-4 mt-auto">
              <div className="p-3 bg-neutral-50 rounded-xl border border-outline-variant/50">
                <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider block">Student Identity</span>
                <div className="mt-1">
                  <span className="font-extrabold text-xs text-primary block leading-snug">{profile.fullName}</span>
                  <span className="text-[11px] text-on-surface-variant block truncate mt-0.5">{profile.programme}</span>
                  <span className="inline-block mt-2 text-[10px] font-bold text-[#399c30] bg-[#399c30]/15 px-1.5 py-0.5 rounded">
                    GPA: {profile.gpa}% • verified
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Active Worksite viewport */}
          <main className="flex-grow bg-surface p-6 md:p-8 overflow-y-auto">
            {selectedBursaryForApply ? (
              /* ACTIVE BURSARY APPLICATION FORM */
              <div className="max-w-3xl mx-auto bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
                <button
                  onClick={() => setSelectedBursaryForApply(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary mb-6 font-hanken font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Listings
                </button>

                <div className="border-b border-outline-variant/30 pb-6 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#795900] bg-secondary-container/20 px-2.5 py-0.5 rounded font-hanken">
                    {selectedBursaryForApply.fundingType}
                  </span>
                  <h1 className="font-headline text-2xl font-bold text-primary mt-2">{selectedBursaryForApply.name}</h1>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{selectedBursaryForApply.description}</p>
                </div>

                {/* TARGETING HIERARCHY EVALUATOR FOR TRANSITION PREVIEW */}
                <div className="bg-neutral-50 border border-outline-variant/40 rounded-xl p-4 mb-6 font-hanken">
                  <span className="text-[10px] text-outline font-bold uppercase block tracking-wider mb-2">Hierarchy Match Verification</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-outline block text-[9px] uppercase font-bold">Targeting Scope</span>
                      <strong className="text-primary">{selectedBursaryForApply.targetingScope}</strong>
                    </div>
                    <div>
                      <span className="text-outline block text-[9px] uppercase font-bold">Your Programme</span>
                      <strong className="text-[#399c30] truncate block">{profile.programme}</strong>
                    </div>
                    <div>
                      <span className="text-outline block text-[9px] uppercase font-bold">Target Criterion</span>
                      <span className="text-[#795900] font-bold">
                        {selectedBursaryForApply.targetingScope === "Programme" && "Direct Level Match"}
                        {selectedBursaryForApply.targetingScope === "Department" && "Department Level Match"}
                        {selectedBursaryForApply.targetingScope === "Faculty" && "Faculty Level Match"}
                        {selectedBursaryForApply.targetingScope === "Institution" && "Global Campus Match"}
                      </span>
                    </div>
                    <div>
                      <span className="text-outline block text-[9px] uppercase font-bold">Min Required GPA</span>
                      <strong className="text-primary">{selectedBursaryForApply.minGPA}%</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 font-hanken">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-outline-variant/30">
                    <span className="text-[10px] text-outline font-bold uppercase">MINIMUM GPA ACCEPTED</span>
                    <p className="font-headline text-xl font-bold text-primary mt-1">{selectedBursaryForApply.minGPA}%</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-outline-variant/30 animate-pulse">
                    <span className="text-[10px] text-outline font-bold uppercase text-[#399c30]">YOUR VERIFIED GPA</span>
                    <p className="font-headline text-xl font-bold text-[#399c30] mt-1">{profile.gpa}% (Matched)</p>
                  </div>
                </div>

                {/* Upload Checklists required documents */}
                <div className="mb-8 font-hanken">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-4">Required Documents Checklist</h3>
                  <div className="space-y-3">
                    {selectedBursaryForApply.requiredDocuments.map((doc, idx) => {
                      const isUploaded = docUploads[doc];
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 transition-all">
                          <div className="flex items-center gap-3">
                            {isUploaded ? (
                              <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                                <FileCheck className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-neutral-200 text-outline flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-bold text-primary block">{doc}</span>
                              <span className="text-[10px] text-on-surface-variant block">Required • Scan or PDF copy</span>
                            </div>
                          </div>

                          {isUploaded ? (
                            <span className="text-xs font-bold text-[#399c30]">Uploaded</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => simulateUploadToken(doc)}
                              className="text-xs bg-primary text-white hover:bg-[#795900] px-3.5 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1"
                            >
                              <Upload className="w-3.5 h-3.5" /> Upload File
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-outline-variant/40 pt-6 font-hanken">
                  <span className="text-[10px] text-on-surface-variant">Standardized BursaryBridge Verification Pipeline</span>
                  <button
                    type="button"
                    onClick={submitSimulationApplication}
                    disabled={selectedBursaryForApply.requiredDocuments.some(doc => !docUploads[doc])}
                    className="px-8 py-3 bg-[#795900] disabled:bg-[#edeef0] text-white disabled:text-outline font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            ) : studentTab === "matches" ? (
              /* DYNAMIC MATH PIPELINE SUBVIEW */
              <div>
                <div className="bg-primary-container text-white p-8 rounded-2xl shadow-sm mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-primary font-hanken text-[10px] font-bold uppercase mb-4">
                      <Sparkles className="w-3.5 h-3.5" /> Direct Qualification Pipeline
                    </div>
                    <h2 className="font-headline text-2xl font-bold tracking-tight text-white">
                      You qualify for {matchedRecommendations.length} verified opportunities!
                    </h2>
                    <p className="text-[#aec7f6] max-w-xl text-xs leading-relaxed mt-1">
                      Our dynamic targeting system compares your study program ({profile.programme}) against complex corporate targeting scopes across the academic hierarchy.
                    </p>
                  </div>

                  <div className="shrink-0 p-5 bg-white/5 rounded-2xl border border-white/10 text-center font-hanken">
                    <Sparkles className="text-secondary-container w-8 h-8 mx-auto mb-1.5" />
                    <p className="text-2xl font-extrabold text-white">{profile.gpa}% GPA</p>
                    <p className="text-[9px] uppercase font-bold text-[#708ab5]">Academic Mark</p>
                  </div>
                </div>

                <h3 className="font-headline text-md font-bold text-primary mb-4 flex items-center gap-2 font-hanken uppercase tracking-wider">
                  <Award className="w-5 h-5 text-secondary" /> Matched Bursaries For You
                </h3>

                {matchedRecommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matchedRecommendations.map((bur) => (
                      <div key={bur.id} className="bg-white border border-outline-variant hover:border-primary/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-[#795900] bg-[#eedfa0]/50 px-2.5 py-0.5 rounded uppercase font-hanken">
                              {bur.fundingType}
                            </span>
                            <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1 font-hanken">
                              <Calendar className="w-3.5 h-3.5" /> Deadline: {bur.deadline}
                            </span>
                          </div>
                          <h4 className="font-headline text-base font-bold text-primary mb-1">{bur.name}</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-3">{bur.description}</p>
                          
                          {/* TARGET SCOPE GRAPHICAL BADGES */}
                          <div className="p-2 bg-neutral-50 rounded-lg border border-outline-variant/30 mb-4 text-[11px] font-hanken">
                            <span className="text-outline uppercase font-bold text-[9px] block">Targeting Criteria</span>
                            <span className="font-bold text-primary mt-0.5 inline-block">
                              🎯 Scope: {bur.targetingScope} Level Check ({bur.targetingScope === "Institution" ? "Institution-wide" : (bur.targetingScope === "Faculty" ? "Faculty" : (bur.targetingScope === "Department" ? "Departmental" : "Programme Specific"))})
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-outline-variant/20 pt-4 flex items-center justify-between font-hanken">
                          <span className="text-xs text-outline font-medium">Min Criteria: {bur.minGPA}% GPA</span>
                          <button
                            type="button"
                            onClick={() => setSelectedBursaryForApply(bur)}
                            className="bg-primary hover:bg-[#795900] text-white text-xs px-4 py-2 font-bold rounded-lg transition-all"
                          >
                            Apply Directly
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-outline-variant/60 font-hanken">
                    <ShieldAlert className="w-10 h-10 mx-auto text-amber-600 mb-3" />
                    <h4 className="font-bold text-primary">No exact matching qualifications found</h4>
                    <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm mx-auto">
                      Your GPA of {profile.gpa}% or selected academic major does not meet targeting rules configured by active and published bursaries. Try clicking "All Campus Listings" to review criteria.
                    </p>
                  </div>
                )}
              </div>
            ) : studentTab === "all-listings" ? (
              /* CAMPUS LISTINGS SUBVIEW */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-primary uppercase">All Campus Opportunities</h3>
                    <p className="text-xs text-on-surface-variant">Explore complete lists of published corporate pipelines inside {activeInstitution?.name}.</p>
                  </div>

                  {/* Filter elements inside the page */}
                  <div className="flex flex-wrap gap-2.5">
                    <select
                      value={filterFunding}
                      onChange={(e) => setFilterFunding(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white border border-outline-variant rounded-lg font-bold outline-none text-primary"
                    >
                      <option value="All">All Funding Types</option>
                      <option value="Merit-Based">Merit-Based</option>
                      <option value="Financial Need">Financial Need</option>
                      <option value="Open Merit">Open Merit</option>
                      <option value="Departmental">Departmental</option>
                      <option value="Special Grant">Special Grant</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Search bursaries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white border border-outline-variant rounded-lg outline-none text-primary"
                    />
                  </div>
                </div>

                {availableBursariesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableBursariesList.map((bur) => {
                      const qualified = isStudentEligible(profile, bur, departments, programmes);
                      return (
                        <div key={bur.id} className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-bold text-primary bg-[#aec7f6]/40 px-2 rounded uppercase font-hanken">
                                {bur.fundingType}
                              </span>
                              <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1 font-hanken">
                                <Calendar className="w-3.5 h-3.5" /> Closes: {bur.deadline}
                              </span>
                            </div>

                            <h4 className="font-headline text-base font-bold text-primary mb-1">{bur.name}</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-4">{bur.description}</p>
                            
                            <div className="space-y-1.5 mb-4 text-[10px] font-hanken text-on-surface-variant leading-snug">
                              <p>🎯 <span className="font-bold">Target Target:</span> {bur.targetingScope} Level ({bur.faculty || "Global Campus"})</p>
                              <p>📈 <span className="font-bold">Min. GPA needed:</span> {bur.minGPA}% GPA</p>
                            </div>

                            {/* Qualification criteria indicators directly inside cards */}
                            <div className="p-2.5 rounded-lg border flex items-center gap-2 mb-4">
                              {qualified ? (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[11px] font-bold text-[#399c30]">Highly Qualified to Apply</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[11px] text-amber-800 font-bold">
                                    Ineligible ({profile.gpa < bur.minGPA ? `GPA mark ${profile.gpa}% < ${bur.minGPA}%` : "Program misalignment rules"})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-outline-variant/20 pt-4 flex items-center justify-between font-hanken">
                            <span className="text-xs text-outline font-medium">Slots available: {bur.slots}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedBursaryForApply(bur)}
                              className="px-4 py-2 text-xs bg-primary hover:bg-[#795900] text-white font-bold rounded-lg transition-all"
                            >
                              Details & Form
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-outline-variant text-[#ba1a1a]">
                    <AlertCircle className="w-10 h-10 mx-auto text-[#ba1a1a] mb-2" />
                    <p className="font-bold">No active opportunities matching filter filters.</p>
                  </div>
                )}
              </div>
            ) : (
              /* APPLICATIONS TRACKER VIEW */
              <div>
                <h3 className="font-headline text-lg font-bold text-primary uppercase mb-6">Your Interactive Submission History</h3>

                <div className="space-y-4 font-hanken">
                  {applications.filter(app => app.studentId === profile.saIdNumber).length > 0 ? (
                    applications.filter(app => app.studentId === profile.saIdNumber).map((app) => {
                      const matchedBursaryObj = bursaries.find(b => b.id === app.bursaryId);
                      return (
                        <div key={app.id} className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[9px] font-bold tracking-wider uppercase text-outline block">STUB_SUBMISSION_HASH_{app.id.toUpperCase()}</span>
                            <h4 className="font-headline text-base font-bold text-primary mt-1">{matchedBursaryObj?.name || "Corporate Scholarship Listing"}</h4>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-on-surface-variant mt-2">
                              <span>Submitted: <strong className="text-primary">{app.submittedAt}</strong></span>
                              <span>•</span>
                              <span>Verified GPA: <strong className="text-primary">{app.studentGPA}%</strong></span>
                              <span>•</span>
                              <span>Documents: <strong className="text-primary">{app.uploadedDocuments.length} checked</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-start sm:self-center">
                            <span className="text-xs font-bold text-outline uppercase">Decision Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              app.status === "Approved" ? "bg-green-100 text-green-900 border border-green-200" :
                              app.status === "Declined" ? "bg-red-100 text-red-955 border border-red-300" :
                              "bg-amber-100 text-amber-900 border border-amber-200 animate-pulse"
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-outline-variant font-hanken">
                      <FileText className="w-10 h-10 mx-auto text-outline mb-3 animate-bounce" />
                      <h4 className="font-bold text-primary">No digital submittals recorded</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Select an opportunity under "Dynamic Match Pipeline" to test the checklist upload and submission workflow instantly.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

    </div>
  );
}
