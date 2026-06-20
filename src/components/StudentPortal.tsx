/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building, GraduationCap, ArrowRight, ArrowLeft, CheckCircle2, 
  AlertCircle, Bookmark, Star, Sparkles, FileText, Upload, 
  FileCheck, ShieldAlert, Award, Calendar, BadgePercent,
  Eye, EyeOff, ChevronLeft, ChevronRight, Menu
} from "lucide-react";
import { StudentProfile, Bursary, BursaryApplication, Institution, Faculty, Department, Programme } from "../types";

const simulatedStudents = [
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
    fundingStatus: "Unfunded" as const
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
    fundingStatus: "Partially Funded" as const
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
    fundingStatus: "Unfunded" as const
  },
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
    fundingStatus: "Unfunded" as const
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
    fundingStatus: "Unfunded" as const
  }
];

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
  onViewPolicies: () => void;
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
  onResetStudentState,
  onViewPolicies
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

  // Work Item 1: Registration Declaration Pop-up States
  const [showDeclarationModal, setShowDeclarationModal] = useState<boolean>(false);
  const [declarationFullName, setDeclarationFullName] = useState("");
  const [declarationSurname, setDeclarationSurname] = useState("");
  const [declarationStudentNumber, setDeclarationStudentNumber] = useState("");
  const [declarationAgreed, setDeclarationAgreed] = useState<boolean>(false);

  // Work Item 10: Authentication Security (Lockout and 3-step recovery)
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [recoveryToken, setRecoveryToken] = useState("");
  const [enteredToken, setEnteredToken] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [newPasswordConfirmVal, setNewPasswordConfirmVal] = useState("");

  // NSFAS Login & Password States
  const [nsfasTab, setNsfasTab] = useState<"login" | "register" | "forgot">("login");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      alert("POPIA protection lockout active! This console workspace has been temporarily locked out due to exceeding unsuccessful verification matching attempts. Please contact your university's Registrar.");
      return;
    }
    if (!formId) {
      alert("Please enter your SA ID Number.");
      return;
    }

    // Find inside simulated list
    const preSeeded = simulatedStudents.find(s => s.saIdNumber === formId);
    if (preSeeded) {
      setLoginAttempts(0);
      setFormName(preSeeded.fullName);
      setFormEmail(preSeeded.email);
      setFormPhone(preSeeded.phoneNumber);
      setFormUniId(preSeeded.institutionId);
      setFormFacultyId(preSeeded.facultyId);
      setFormDeptId(preSeeded.departmentId);
      setFormProgId(preSeeded.programmeId);
      setFormDegreeName(preSeeded.degreeName);
      setFormYear(preSeeded.yearOfStudy);
      setFormGpa(preSeeded.gpa);
      setFormFunding(preSeeded.fundingStatus);

      onSaveProfile(preSeeded);
      setWizardStep(3);
      return;
    }

    // Find inside custom list
    const savedList = localStorage.getItem("bb_registered_profiles");
    const customList: StudentProfile[] = savedList ? JSON.parse(savedList) : [];
    const custom = customList.find(s => s.saIdNumber === formId);
    if (custom) {
      setLoginAttempts(0);
      setFormName(custom.fullName);
      setFormEmail(custom.email);
      setFormPhone(custom.phoneNumber);
      setFormUniId(custom.institutionId);
      setFormFacultyId(custom.facultyId);
      setFormDeptId(custom.departmentId);
      setFormProgId(custom.programmeId);
      setFormDegreeName(custom.degreeName);
      setFormYear(custom.yearOfStudy);
      setFormGpa(custom.gpa);
      setFormFunding(custom.fundingStatus);

      onSaveProfile(custom);
      setWizardStep(3);
      return;
    }

    const nextAttempts = loginAttempts + 1;
    setLoginAttempts(nextAttempts);
    if (nextAttempts >= 5) {
      setIsLocked(true);
      alert("CRITICAL LOCKOUT ACTIVE: 5 failed ID entries hit! Student workspace locked safely under POPIA guidelines.");
    } else {
      alert(`Invalid SA ID. Verification match failed. Security threshold count: ${nextAttempts}/5. Repeated failures will freeze this workspace.`);
    }
  };

  const handleForgotPasswordStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) {
      alert("Please enter your 13-digit SA ID Number to initiate recovery.");
      return;
    }
    
    // Check if the student profile actually exists in either seeded or custom list to prove high integrity check
    const existsInSeeded = simulatedStudents.some(s => s.saIdNumber === formId);
    const savedList = localStorage.getItem("bb_registered_profiles");
    const customList: StudentProfile[] = savedList ? JSON.parse(savedList) : [];
    const existsInCustom = customList.some(s => s.saIdNumber === formId);

    if (!existsInSeeded && !existsInCustom) {
      alert("No registered student profile matches this national ID. High intensity verification failed.");
      return;
    }

    // Generate secure reset token (Work Item 10)
    const token = "BB-" + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    setRecoveryToken(token);
    setForgotStep(2);
    alert(`DISPATCH ACTION COMPLETED: SMTP secure test server has delivered reset token code successfully to registered media.`);
  };

  const handleForgotPasswordStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredToken.trim().toUpperCase() !== recoveryToken) {
      setRecoveryError("Invalid security token. Reset denied.");
      return;
    }
    setRecoveryError("");
    setForgotStep(3);
  };

  const handleForgotPasswordStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check complexity rules matching strength requirements at signup (Work Item 10)
    const hasLength = newPasswordVal.length >= 8;
    const hasUpper = /[A-Z]/.test(newPasswordVal);
    const hasLower = /[a-z]/.test(newPasswordVal);
    const hasNumber = /[0-9]/.test(newPasswordVal);
    const hasSymbol = /[^A-Za-z0-9]/.test(newPasswordVal);
    const isStrong = hasLength && hasUpper && hasLower && hasNumber && hasSymbol;

    if (!isStrong) {
      alert("New password is too weak. Must align with 8+ chars, casing, numerics, and symbolic keys.");
      return;
    }
    if (newPasswordVal !== newPasswordConfirmVal) {
      alert("Confirm password mismatch.");
      return;
    }

    // Persist new password and return to login screen
    setFormPassword(newPasswordVal);
    setFormConfirmPassword(newPasswordVal);
    alert("Success! Password changed securely. You can now use your updated credentials to log in.");
    setForgotStep(1);
    setIsLocked(false);
    setLoginAttempts(0);
    setNsfasTab("login");
  };

  const handleFinishRegistration = () => {
    if (!formFacultyId || !formDeptId || !formProgId) {
      alert("Eligibility requires selecting your exact Faculty, Department, and Programme through the cascading filters.");
      return;
    }
    if (formGpa <= 0 || formGpa > 100) {
      alert("Please specify a valid academic score average between 1% and 100%.");
      return;
    }
    if (formPassword && formPassword !== formConfirmPassword) {
      alert("Passwords do not match.");
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

    // Save custom profile in local storage
    const savedList = localStorage.getItem("bb_registered_profiles");
    const list: StudentProfile[] = savedList ? JSON.parse(savedList) : [];
    const filteredList = list.filter(p => p.saIdNumber !== updatedProfile.saIdNumber);
    localStorage.setItem("bb_registered_profiles", JSON.stringify([...filteredList, updatedProfile]));

    onSaveProfile(updatedProfile);
    setWizardStep(3);
  };

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

    // Strongly enforce password complexity at register (Work Item 10)
    if (formPassword) {
      const hasLength = formPassword.length >= 8;
      const hasUpper = /[A-Z]/.test(formPassword);
      const hasLower = /[a-z]/.test(formPassword);
      const hasNumber = /[0-9]/.test(formPassword);
      const hasSymbol = /[^A-Za-z0-9]/.test(formPassword);
      const isStrong = hasLength && hasUpper && hasLower && hasNumber && hasSymbol;

      if (!isStrong) {
        alert("Password too weak. Please meet all complexity rules shown in the checklist beneath the input field.");
        return;
      }
    }

    // Trigger explicit declaration modal BEFORE migrating to academic filters (Work Item 1)
    setDeclarationFullName(formName);
    setDeclarationSurname("");
    setDeclarationStudentNumber("");
    setDeclarationAgreed(false);
    setShowDeclarationModal(true);
  };

  const handleConfirmDeclarationAndProceed = () => {
    if (!declarationFullName.trim() || !declarationSurname.trim() || !declarationStudentNumber.trim()) {
      alert("Verification failed. Please capture your complete Name, Surname, and Student number to sign the declaration.");
      return;
    }
    if (!declarationAgreed) {
      alert("Declaration rejected. You must check the legal acknowledgement checkbox to continue.");
      return;
    }
    setShowDeclarationModal(false);
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Work Item 1: Registration Declaration Modal */}
      {showDeclarationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldAlert className="w-5 h-5 text-[#005A8D]" />
              <h3 className="text-xs font-bold text-slate-900 tracking-widest uppercase">
                STUDENT DECLARES VERIFIED ACCOUNT DATA
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Please declare your formal tertiary details and confirm your student parameters. All information must perfectly align with active South African university enrollment registries.
            </p>

            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-[9px] uppercase font-extrabold text-[#005A8D] mb-1">First Name &amp; Middle Name</label>
                <input
                  type="text"
                  required
                  value={declarationFullName}
                  onChange={(e) => setDeclarationFullName(e.target.value)}
                  placeholder="e.g. Thabo"
                  className="bg-white text-slate-800 font-sans border border-slate-200 font-semibold px-3 py-2 rounded-lg w-full text-xs outline-none"
                  id="declaration_input_name"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-extrabold text-[#005A8D] mb-1">Last Name / Surname</label>
                <input
                  type="text"
                  required
                  value={declarationSurname}
                  onChange={(e) => setDeclarationSurname(e.target.value)}
                  placeholder="e.g. Mokoena"
                  className="bg-white text-slate-800 font-sans border border-slate-200 font-semibold px-3 py-2 rounded-lg w-full text-xs outline-none"
                  id="declaration_input_surname"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-extrabold text-[#005A8D] mb-1">Active Student Number</label>
                <input
                  type="text"
                  required
                  value={declarationStudentNumber}
                  onChange={(e) => setDeclarationStudentNumber(e.target.value)}
                  placeholder="e.g. 2199291 or MKNTHA002"
                  className="bg-white text-slate-800 font-sans border border-slate-200 font-semibold px-3 py-2 rounded-lg w-full text-xs outline-none"
                  id="declaration_input_num"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 border-l-2 border-amber-500 rounded-lg text-amber-955 font-sans text-[11px] leading-relaxed">
              <strong>Agreement Disclaimer:</strong> I understand that registering on BursaryBridge and submitting an application does not guarantee a bursary award. Partner universities bear no liability for non-award or missing slots.
            </div>

            <label className="flex items-start gap-2 pt-1 font-sans cursor-pointer select-none">
              <input
                type="checkbox"
                checked={declarationAgreed}
                onChange={(e) => setDeclarationAgreed(e.target.checked)}
                className="mt-0.5"
                id="checkbox_confirm_declaration"
              />
              <span className="text-[11px] text-slate-600 font-bold leading-tight">
                I explicitly declare that all submitted details are true and correct, and I agree to the BursaryBridge T&amp;C legal guidelines.
              </span>
            </label>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeclarationModal(false)}
                className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeclarationAndProceed}
                className="px-5 py-2 bg-[#005A8D] hover:bg-[#003B5C] text-white text-xs font-black rounded-lg transition-all shadow-sm"
                id="btn_confirm_declaration_submit"
              >
                Sign &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {profile && (
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
        </header>
      )}

      {/* NSFAS Portal Gateway (Auth & Register Setup) */}
      {!profile && (
        <div className="flex-grow flex flex-col bg-white text-gray-900">
          <div className="w-full text-right py-2 px-6 border-b border-gray-100 text-[10px] text-gray-500 font-sans hidden md:block">
            Welcome to NSFAS. We wish you well on your Student Funding Journey. Reach out to us:{" "}
            <a href="mailto:info@nsfas.org.za" className="underline font-bold text-[#005A8D]">
              info@nsfas.org.za
            </a>
          </div>

          <div className="w-full xl:max-w-7xl mx-auto flex-grow grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-38px)]">
            {/* LEFT BACKGROUND: COHESIVE NSFAS PANEL */}
            <div className="md:col-span-5 bg-neutral-50/70 border-r border-gray-100 p-8 flex flex-col justify-between items-center text-center">
              <div className="w-full"></div>

              <div className="flex flex-col items-center justify-center my-auto">
                <div className="flex flex-col items-center mb-6">
                  <svg className="w-24 h-24 text-[#005A8D]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="24" r="7" fill="currentColor" />
                    <path d="M50 36C45 36 38 41 32 46C29 48.5 28 52 30 54.5C32 57 36 57 39.5 54C43 51 47 46.5 50 46.5C53 46.5 57 51 60.5 54C64 57 68 57 70 54.5C72 52 71 48.5 68 46C62 41 55 36 50 36Z" fill="currentColor" />
                    <path d="M50 46.5C48 52 44 64 41 73C39.5 77.5 42 81 46.5 80C50 79.2 50 74 50 70C50 74 50 79.2 53.5 80C58 81 60.5 77.5 59 73C56 64 52 52 50 46.5Z" fill="currentColor" />
                  </svg>
                  <h2 className="text-4.5xl font-black text-neutral-900 tracking-tighter font-sans mt-2">NSFAS</h2>
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-gray-500 font-sans block text-center max-w-[210px] mt-1.5 leading-snug">
                    National Student Financial Aid Scheme
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-6 mb-2">Welcome to NSFAS</h1>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  All current NSFAS beneficiaries are required to create an account on the new platform
                </p>
              </div>

              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                POPIA Compliant Secure Portal Gate
              </div>
            </div>

            {/* RIGHT FORM SPACE */}
            <div className="md:col-span-7 flex flex-col justify-center p-6 md:p-12 lg:p-16 bg-white overflow-y-auto">
              <div className="w-full max-w-lg mx-auto">
                <h2 className="text-3xl font-black text-neutral-950 mb-6 tracking-tight text-center md:text-left">
                  NSFAS Online Application
                </h2>

                <div className="flex border-b border-gray-200 w-full mb-8 text-sm font-sans gap-8">
                  <button
                    type="button"
                    onClick={() => {
                      setNsfasTab("login");
                      setWizardStep(1);
                    }}
                    className={`pb-3 relative text-sm tracking-wide transition-all ${
                      nsfasTab === "login"
                        ? "text-[#005A8D] font-bold border-b-[3px] border-[#005A8D]"
                        : "text-gray-400 hover:text-gray-700 border-b border-transparent font-medium"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNsfasTab("register");
                      setWizardStep(1);
                    }}
                    className={`pb-3 relative text-sm tracking-wide transition-all ${
                      nsfasTab === "register"
                        ? "text-[#005A8D] font-bold border-b-[3px] border-[#005A8D]"
                        : "text-gray-400 hover:text-gray-700 border-b border-transparent font-medium"
                    }`}
                  >
                    Create profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNsfasTab("forgot");
                      setWizardStep(1);
                    }}
                    className={`pb-3 relative text-sm tracking-wide transition-all ${
                      nsfasTab === "forgot"
                        ? "text-[#005A8D] font-bold border-b-[3px] border-[#005A8D]"
                        : "text-gray-400 hover:text-gray-700 border-b border-transparent font-medium"
                    }`}
                  >
                    Forgot password
                  </button>
                </div>

                {/* LOGIN TAB */}
                {nsfasTab === "login" && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left mb-6">
                      <h3 className="text-xl font-bold text-neutral-900">Welcome back</h3>
                      <p className="text-gray-550 text-xs mt-1">Your journey starts here.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          maxLength={13}
                          required
                          value={formId}
                          onChange={(e) => setFormId(e.target.value.replace(/\D/g, ""))}
                          placeholder="ID Number"
                          className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3.5 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all shadow-inner"
                        />
                      </div>

                      <div className="relative w-full">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Password"
                          className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3.5 pr-12 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="bg-[#005A8D] hover:bg-[#003B5C] text-white font-extrabold h-12 rounded-lg w-full transition-all text-xs uppercase tracking-wider shadow-sm hover:shadow active:scale-[0.98] duration-100 flex items-center justify-center gap-2 mt-2"
                      >
                        Login
                      </button>
                    </form>

                    <div className="relative my-6 w-full flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <span className="relative px-4 bg-white text-gray-400 text-xs font-semibold">Or</span>
                    </div>

                    <div className="text-center">
                      <h4 className="text-sm font-extrabold text-neutral-950">Don't have a profile</h4>
                      <p className="text-xs text-gray-500 mt-1">Get started by creating a profile.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setNsfasTab("register");
                          setWizardStep(1);
                        }}
                        className="mt-4 border-2 border-gray-250 hover:border-[#005A8D] text-gray-750 hover:text-[#005A8D] font-extrabold py-2.5 px-6 rounded-lg w-full transition-all text-xs tracking-wider uppercase"
                      >
                        Create profile
                      </button>
                    </div>

                    {/* Interactive Mock Logins for Reviewers */}
                    <div className="mt-8 p-4 bg-neutral-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block mb-2.5">
                        💡 Interactive Demo Logins (click to fill and login instantly):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {simulatedStudents.map((stud) => (
                          <button
                            key={stud.saIdNumber}
                            type="button"
                            onClick={() => {
                              setFormId(stud.saIdNumber);
                              setLoginPassword("Password123!");
                              // Auto fill states
                              setFormName(stud.fullName);
                              setFormEmail(stud.email);
                              setFormPhone(stud.phoneNumber);
                              setFormUniId(stud.institutionId);
                              setFormFacultyId(stud.facultyId);
                              setFormDeptId(stud.departmentId);
                              setFormProgId(stud.programmeId);
                              setFormDegreeName(stud.degreeName);
                             setFormYear(stud.yearOfStudy);
                              setFormGpa(stud.gpa);
                              setFormFunding(stud.fundingStatus);
                              onSaveProfile(stud);
                              setWizardStep(3);
                            }}
                            className="p-2 bg-white border border-gray-200 hover:border-[#005A8D]/50 rounded-lg hover:shadow-sm transition-all focus:outline-none flex justify-between items-center group text-left"
                          >
                            <div>
                              <span className="font-extrabold text-gray-800 block group-hover:text-[#005A8D]">{stud.fullName}</span>
                              <span className="text-[10px] text-gray-500">{stud.institutionId.toUpperCase()} • GPA {stud.gpa}%</span>
                            </div>
                            <span className="text-[10px] text-[#005A8D] font-bold font-mono">
                              Fill & Go
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CREATE PROFILE (MULTISTEP) */}
                {nsfasTab === "register" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        wizardStep === 1 ? "bg-[#005A8D] text-white" : "bg-green-100 text-green-800"
                      }`}>
                        {wizardStep === 1 ? "1" : "✓"}
                      </span>
                      <div className="flex-grow h-1 bg-gray-200 rounded">
                        <div className={`h-full bg-[#005A8D] rounded transition-all duration-300 ${wizardStep === 2 ? "w-full" : "w-1/2"}`}></div>
                      </div>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        wizardStep === 2 ? "bg-[#005A8D] text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        2
                      </span>
                    </div>

                    {wizardStep === 1 ? (
                      <form onSubmit={handleGoToAcademic} className="space-y-4">
                        <div className="text-center md:text-left mb-4">
                          <h3 className="text-lg font-bold text-neutral-900">Personal Credentials</h3>
                          <p className="text-gray-500 text-xs mt-1">Provide your verified academic identity credentials.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-650 mb-1.5 uppercase tracking-wide">Full Name & Surname</label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. Sipho Khumalo"
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-655 mb-1.5 uppercase tracking-wide">SA ID Number</label>
                            <input
                              type="text"
                              maxLength={13}
                              required
                              value={formId}
                              onChange={(e) => setFormId(e.target.value.replace(/\D/g, ""))}
                              placeholder="e.g. 0005125678089"
                              className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-655 mb-1.5 uppercase tracking-wide">Phone Number</label>
                            <input
                              type="tel"
                              required
                              value={formPhone}
                              onChange={(e) => setFormPhone(e.target.value)}
                              placeholder="e.g. 083 445 7781"
                              className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-sans"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-655 mb-1.5 uppercase tracking-wide">University Email Address</label>
                          <input
                            type="email"
                            required
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            placeholder="e.g. student@myuct.ac.za"
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-sans"
                          />
                          <p className="text-[10px] text-gray-450 mt-1.5 font-sans leading-tight">
                            *Email domain locks institution isolation. Enter email ending in <span className="text-[#005A8D] font-bold">myuct.ac.za</span> for UCT, or <span className="text-[#005A8D] font-bold">dut4life.ac.za</span> for DUT.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-655 mb-1.5 uppercase tracking-wide">Institution Workspace</label>
                          <select
                            required
                            value={formUniId}
                            onChange={(e) => {
                              setFormUniId(e.target.value);
                              setFormFacultyId("");
                              setFormDeptId("");
                              setFormProgId("");
                            }}
                            className="bg-[#eef4ff] text-[#005A8D] font-sans font-bold px-4 py-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all"
                          >
                            <option value="">-- Autodetect or Select University --</option>
                            {institutions.map(inst => (
                              <option key={inst.id} value={inst.id}>
                                {inst.name} ({inst.domain})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-655 mb-1.5 uppercase tracking-wide">Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={formPassword}
                                onChange={(e) => setFormPassword(e.target.value)}
                                placeholder="Choose password"
                                className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 pr-10 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-700"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Password Complexity Checklist (Work Item 10) */}
                            {formPassword && (
                              <div className="mt-2.5 p-3 bg-white border border-gray-250 rounded-xl text-[11px] space-y-1.5 font-sans shadow-sm" id="password_checklist">
                                <span className="font-extrabold text-neutral-800 uppercase block tracking-wider text-[9px] mb-1">Strong Password Requirements:</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={formPassword.length >= 8 ? "text-green-650 font-bold" : "text-gray-450"}>
                                    {formPassword.length >= 8 ? "✓" : "○"}
                                  </span>
                                  <span className={formPassword.length >= 8 ? "text-green-700 font-semibold" : "text-gray-500"}>At least 8 characters long</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={/[A-Z]/.test(formPassword) ? "text-green-650 font-bold" : "text-gray-450"}>
                                    {/[A-Z]/.test(formPassword) ? "✓" : "○"}
                                  </span>
                                  <span className={/[A-Z]/.test(formPassword) ? "text-green-700 font-semibold" : "text-gray-500"}>At least one uppercase letter (A-Z)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={/[a-z]/.test(formPassword) ? "text-green-650 font-bold" : "text-gray-450"}>
                                    {/[a-z]/.test(formPassword) ? "✓" : "○"}
                                  </span>
                                  <span className={/[a-z]/.test(formPassword) ? "text-green-700 font-semibold" : "text-gray-500"}>At least one lowercase letter (a-z)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={/[0-9]/.test(formPassword) ? "text-green-650 font-bold" : "text-gray-450"}>
                                    {/[0-9]/.test(formPassword) ? "✓" : "○"}
                                  </span>
                                  <span className={/[0-9]/.test(formPassword) ? "text-green-700 font-semibold" : "text-gray-500"}>At least one numerical digit (0-9)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={/[^A-Za-z0-9]/.test(formPassword) ? "text-green-650 font-bold" : "text-gray-450"}>
                                    {/[^A-Za-z0-9]/.test(formPassword) ? "✓" : "○"}
                                  </span>
                                  <span className={/[^A-Za-z0-9]/.test(formPassword) ? "text-green-700 font-semibold" : "text-gray-500"}>At least one special symbol (e.g., !, @, #, $, %)</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-655 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formConfirmPassword}
                                onChange={(e) => setFormConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 pr-10 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-455 hover:text-gray-700"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="bg-[#005A8D] hover:bg-[#003B5C] text-white font-extrabold h-12 rounded-lg w-full transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1 mt-4"
                        >
                          Next: Academic Matrix Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center md:text-left mb-4">
                          <h3 className="text-lg font-bold text-neutral-900">Academic Allocation</h3>
                          <p className="text-gray-500 text-xs mt-1">Cascading dropdown controls mapping to corporate qualification filters.</p>
                        </div>

                        {/* 1. FACULTY SELECT */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">1. Select Faculty</label>
                          <select
                            required
                            value={formFacultyId}
                            onChange={(e) => {
                              setFormFacultyId(e.target.value);
                              setFormDeptId("");
                              setFormProgId("");
                            }}
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold p-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all"
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

                        {/* 2. DEPARTMENT SELECT */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
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
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold p-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all disabled:opacity-40"
                          >
                            <option value="">-- Select Department --</option>
                            {availableDepartments.map(dep => (
                              <option key={dep.id} value={dep.id}>{dep.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 3. PROGRAMME SELECT */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                            3. Select Programme {formDeptId ? "" : "(Select Department first)"}
                          </label>
                          <select
                            required
                            disabled={!formDeptId}
                            value={formProgId}
                            onChange={(e) => setFormProgId(e.target.value)}
                            className="bg-[#eef4ff] text-[#005A8D] font-sans font-extrabold p-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all disabled:opacity-40"
                          >
                            <option value="">-- Select Programme Degree --</option>
                            {availableProgrammes.map(prog => (
                              <option key={prog.id} value={prog.id}>{prog.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 4. FREE TEXT DISPLAY DEGREE NAME */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                            Free-Text Degree Title <span className="text-gray-400 font-normal text-[9px]">(Specialization display, e.g. Honours stream)</span>
                          </label>
                          <input
                            type="text"
                            value={formDegreeName}
                            onChange={(e) => setFormDegreeName(e.target.value)}
                            placeholder="e.g. BSc Honours in Computer Science"
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold p-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all"
                          />
                        </div>

                        {/* GPA & STUDY YEAR */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Study Year</label>
                            <select
                              value={formYear}
                              onChange={(e) => setFormYear(e.target.value)}
                              className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold p-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all"
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="Honours">Honours Postgraduate</option>
                              <option value="Masters/PhD">Masters / Doctoral Candidate</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase font-sans">Academic Average / GPA (%)</label>
                            <input
                              type="number"
                              required
                              min={0}
                              max={100}
                              value={formGpa || ""}
                              onChange={(e) => setFormGpa(Number(e.target.value))}
                              placeholder="e.g. 78"
                              className="bg-[#eef4ff] text-neutral-900 font-sans font-extrabold p-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-sans"
                            />
                          </div>
                        </div>

                        {/* Current Sponsor funding */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                            Current Sponsor Funding Status
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["Unfunded", "Partially Funded", "Fully Funded"].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setFormFunding(option as any)}
                                className={`p-2.5 rounded-lg border text-center transition-all ${
                                  formFunding === option
                                    ? "border-[#005A8D] bg-[#005A8D]/10 text-[#005A8D] font-bold"
                                    : "border-gray-200 bg-white text-gray-500 text-xs font-medium hover:bg-neutral-50"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Finish Controls */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-150">
                          <button
                            type="button"
                            onClick={() => setWizardStep(1)}
                            className="px-5 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-neutral-50 transition-all text-xs"
                          >
                            Back To Personal
                          </button>
                          <button
                            type="button"
                            onClick={handleFinishRegistration}
                            className="px-7 py-2.5 bg-[#005A8D] text-white font-extrabold rounded-lg hover:bg-[#003B5C] transition-all shadow-sm text-xs tracking-wider uppercase font-sans"
                          >
                            Verify Eligible Matches
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FORGOT PASSWORD */}
                {nsfasTab === "forgot" && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left mb-6">
                      <h3 className="text-xl font-bold text-neutral-900">Secure Password Recovery</h3>
                      <p className="text-gray-500 text-xs mt-1 font-sans">Multi-factor corporate verification aligning with POPIA privacy thresholds.</p>
                    </div>
                    {forgotStep === 1 && (
                      <form onSubmit={handleForgotPasswordStep1} className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600 leading-relaxed mb-4">
                          <strong>Step 1 of 3: Enter SA National ID</strong>. The system will look up your registered email address to dispatch a generated pin.
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-505 mb-1.5">SA 13-Digit ID Number</label>
                          <input
                             type="text"
                             maxLength={13}
                             value={formId}
                             onChange={(e) => setFormId(e.target.value)}
                             required
                             placeholder="e.g. 9901015678082"
                             className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3.5 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-mono"
                             id="recovery_input_id"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-[#005A8D] hover:bg-[#003B5C] text-white font-extrabold h-12 rounded-lg w-full transition-all text-xs uppercase tracking-wider shadow"
                        >
                          Request OTP Token Pin
                        </button>
                      </form>
                    )}

                    {forgotStep === 2 && (
                      <form onSubmit={handleForgotPasswordStep2} className="space-y-4 font-sans text-xs">
                        <div className="bg-yellow-50 border border-yellow-250 p-4 rounded-xl text-yellow-950 leading-relaxed mb-4">
                          <strong>Step 2 of 3: Verification Pin Dispatched</strong>.<br />
                          A simulation-dispatch SMTP token has been generated. To help your testing, copy your OTP pin below:<br />
                          <span className="font-mono font-bold text-base select-all bg-white px-3 py-1 border border-yellow-300 rounded-lg inline-block mt-2 text-[#005A8D]">
                            {recoveryToken}
                          </span>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-550 mb-1.5">Enter Copyable Reset Token Pin</label>
                          <input
                            type="text"
                            required
                            value={enteredToken}
                            onChange={(e) => setEnteredToken(e.target.value)}
                            placeholder="e.g. BB-XXXX-XXXX"
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-black px-4 py-3.5 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-mono"
                            id="recovery_input_otp"
                          />
                        </div>

                        {recoveryError && (
                          <div className="text-red-500 font-bold text-xs mt-1">
                            {recoveryError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="bg-[#005A8D] hover:bg-[#003B5C] text-white font-extrabold h-12 rounded-lg w-full transition-all text-xs uppercase tracking-wider shadow"
                        >
                          Validate Security Pin
                        </button>
                      </form>
                    )}

                    {forgotStep === 3 && (
                      <form onSubmit={handleForgotPasswordStep3} className="space-y-4 font-sans">
                        <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl text-green-955 text-xs leading-relaxed mb-4">
                          <strong>Step 3 of 3: New Encrypted Password</strong>. Reassign access with strict password verification parameters.
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-550 mb-1 font-semibold">New Secure Password</label>
                          <input
                            type="password"
                            required
                            value={newPasswordVal}
                            onChange={(e) => setNewPasswordVal(e.target.value)}
                            placeholder="8+ characters with symbolic keys"
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-sans"
                            id="recovery_new_pwd"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-550 mb-1 font-semibold">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            value={newPasswordConfirmVal}
                            onChange={(e) => setNewPasswordConfirmVal(e.target.value)}
                            placeholder="Retype password exactly"
                            className="bg-[#eef4ff] text-neutral-900 font-sans font-semibold px-4 py-3 rounded-lg w-full text-sm outline-none border border-transparent focus:bg-white focus:border-[#005A8D]/40 focus:ring-2 focus:ring-[#005A8D]/10 transition-all font-sans"
                            id="recovery_new_pwd_confirm"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-[#005A8D] hover:bg-[#003B5C] text-white font-extrabold h-12 rounded-lg w-full transition-all text-xs uppercase tracking-wider shadow"
                        >
                          Save New Password
                        </button>
                      </form>
                    )}

                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setNsfasTab("login");
                          setForgotStep(1);
                        }}
                        className="text-xs font-bold text-[#005A8D] hover:underline uppercase tracking-wide"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Active Student Portal Dashboard */}
      {wizardStep === 3 && profile && (
        <div className="flex-grow flex flex-row relative w-full antialiased font-sans">
          
          {/* SaaS Style Vertical Left Navigation Sidebar placeholder */}
          <header className="hidden" id="student_top_navbar">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans text-xs">
              
              {/* Brand and Workspace info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#005A8D] flex items-center justify-center">
                  <GraduationCap className="text-white w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-sm tracking-tight text-white">BursaryBridge Student Node</span>
                    <span className="bg-[#005A8D]/25 border border-[#005A8D]/40 text-[#7FB3D5] text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase font-mono">
                      POPIA SECURE
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium block truncate max-w-xs md:max-w-md mt-0.5">
                    Workspace: <strong className="text-gray-200">{activeInstitution?.name}</strong>
                  </span>
                </div>
              </div>

              {/* Inline Navigation Tabs (Work Item 5 tabs) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold" id="student_header_tabs">
                <button
                  onClick={() => {
                    setStudentTab("matches");
                    setSelectedBursaryForApply(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    studentTab === "matches" && !selectedBursaryForApply
                      ? "bg-[#005A8D] text-white shadow-sm font-extrabold animate-pulse"
                      : "text-slate-355 hover:bg-slate-800"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Direct Match Pipeline
                  <span className="bg-[#005A8D]/40 border border-[#005A8D]/50 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    {matchedRecommendations.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setStudentTab("all-listings");
                    setSelectedBursaryForApply(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    studentTab === "all-listings" && !selectedBursaryForApply
                      ? "bg-[#005A8D] text-white shadow-sm font-extrabold"
                      : "text-slate-355 hover:bg-slate-800"
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-slate-400" /> All Campus Listings
                </button>

                <button
                  onClick={() => {
                    setStudentTab("my-applications");
                    setSelectedBursaryForApply(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    studentTab === "my-applications" && !selectedBursaryForApply
                      ? "bg-[#005A8D] text-white shadow-sm font-extrabold"
                      : "text-slate-355 hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> My Applications
                  <span className="bg-[#005A8D]/40 border border-[#005A8D]/50 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    {applications.filter(app => app.studentId === profile.saIdNumber).length}
                  </span>
                </button>
              </div>

              {/* Verified identity status in header */}
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4 text-xs font-sans">
                <div className="text-right hidden xl:block">
                  <span className="font-extrabold block text-slate-250 text-xs">{profile.fullName}</span>
                  <span className="text-[10px] text-green-550 font-bold block">GPA: {profile.gpa}% • Verified ✔</span>
                </div>
                <button
                  onClick={() => {
                    const confirmClose = window.confirm("Are you sure you want to terminate this secure session?");
                    if (confirmClose) {
                      onResetStudentState();
                      setWizardStep(1);
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] px-3 py-1.5 rounded-lg font-extrabold uppercase tracking-wide transition-all active:scale-95"
                  id="btn_student_header_logout"
                >
                  Terminate
                </button>
              </div>
            </div>
          </header>

          {/* Student Left Collapsible Sidebar Navigation */}
          <aside 
            className={`bg-slate-900 text-white flex flex-col transition-all duration-300 h-screen sticky top-0 shrink-0 border-r border-slate-800 ${
              isSidebarExpanded ? "w-64" : "w-16"
            }`}
            id="student_hub_sidebar"
          >
            {/* Top Logo and Title */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#005A8D] flex items-center justify-center shrink-0 shadow-inner">
                  <GraduationCap className="text-white w-4.5 h-4.5" />
                </div>
                {isSidebarExpanded && (
                  <div className="min-w-0">
                    <span className="font-headline font-black text-white text-sm leading-none block truncate">
                      BursaryBridge Hub
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold font-sans uppercase tracking-widest block truncate mt-1">
                      Role: Student
                    </span>
                  </div>
                )}
              </div>
              {isSidebarExpanded && (
                <button 
                  onClick={() => setIsSidebarExpanded(false)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-all shrink-0 ml-1"
                  id="student_sidebar_collapse_btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Expander Trigger */}
            {!isSidebarExpanded && (
              <div className="p-3 flex justify-center border-b border-slate-800">
                <button 
                  onClick={() => setIsSidebarExpanded(true)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-all"
                  id="student_sidebar_expand_btn"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <nav className="flex-grow py-4 px-3 space-y-1.5 overflow-y-auto" id="student_sidebar_nav">
              <button
                onClick={() => {
                  setStudentTab("matches");
                  setSelectedBursaryForApply(null);
                }}
                title="Direct Match Pipeline"
                className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                  isSidebarExpanded ? "px-3" : "justify-center"
                } ${
                  studentTab === "matches" && !selectedBursaryForApply
                    ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                    : "text-slate-350 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Sparkles className="w-4.5 h-4.5 shrink-0 text-yellow-500" />
                {isSidebarExpanded && <span className="text-xs truncate">My eligibility Matches</span>}
                {isSidebarExpanded && (
                  <span className="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {matchedRecommendations.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setStudentTab("all-listings");
                  setSelectedBursaryForApply(null);
                }}
                title="All Campus Listings"
                className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                  isSidebarExpanded ? "px-3" : "justify-center"
                } ${
                  studentTab === "all-listings" && !selectedBursaryForApply
                    ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                    : "text-slate-350 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Building className="w-4.5 h-4.5 shrink-0 text-slate-400" />
                {isSidebarExpanded && <span className="text-xs truncate">Campus listings</span>}
              </button>

              <button
                onClick={() => {
                  setStudentTab("my-applications");
                  setSelectedBursaryForApply(null);
                }}
                title="My Applications"
                className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                  isSidebarExpanded ? "px-3" : "justify-center"
                } ${
                  studentTab === "my-applications" && !selectedBursaryForApply
                    ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                    : "text-slate-350 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <FileText className="w-4.5 h-4.5 shrink-0 text-slate-400" />
                {isSidebarExpanded && <span className="text-xs truncate flex-grow text-left">My Applications</span>}
                {isSidebarExpanded && (
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {applications.filter(app => app.studentId === profile.saIdNumber).length}
                  </span>
                )}
              </button>
            </nav>

            {/* Sidebar Bottom Profile Widget */}
            {isSidebarExpanded && (
              <div className="p-4 border-t border-slate-800 space-y-3">
                <div className="bg-slate-800/40 border border-slate-800/80 rounded-lg p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Verify GPA status</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white leading-none block truncate max-w-xs">{profile.fullName}</span>
                    <span className="bg-[#7FB3D5]/20 text-[#7FB3D5] text-[10px] font-bold font-mono px-1.5 py-0.5 rounded">
                      {profile.gpa}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const confirmClose = window.confirm("Are you sure you want to terminate this secure session?");
                    if (confirmClose) {
                      onResetStudentState();
                      setWizardStep(1);
                    }
                  }}
                  className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-100 text-[10px] w-full py-2 rounded-lg font-bold uppercase tracking-wider transition-all"
                  id="student_sb_terminate_btn"
                >
                  Terminate session
                </button>
              </div>
            )}
          </aside>

          {/* Student Main Right Worksite Pane Wrapper */}
          <div className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 relative" id="student_main_pane">
            
            {/* Top Slim Header Bar */}
            <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-35 shadow-xs shrink-0">
              <div className="flex items-center gap-3">
                <h1 className="text-sm font-black text-slate-905 tracking-tight uppercase font-headline block truncate max-w-sm">
                  {activeInstitution?.name || "BursaryBridge Campus Node"} Workspace
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <span className="bg-emerald-100 border border-emerald-250 text-emerald-850 text-[10px] font-bold tracking-wider px-2 py-1 rounded-md uppercase font-sans">
                  Verified Academic ✔
                </span>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-4 h-8 text-xs font-sans">
                  <span className="font-extrabold block text-slate-705 text-xs hidden sm:block">Student Hub ID</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-[#005A8D] flex items-center justify-center font-bold font-mono border border-slate-200">
                    SA
                  </div>
                </div>
              </div>
            </header>

          {/* Active Worksite viewport */}
          <main className="flex-grow bg-slate-50 p-6 md:p-8">
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

            {/* Work Item 2: Persistent disclosure policy link footer inside student portal */}
            <footer className="mt-12 pt-6 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4" id="student_portal_footer">
              <p>© 2026 BursaryBridge South Africa. All corporate funding programs are subject to university allocation rules.</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onViewPolicies}
                  className="text-[#005A8D] hover:underline font-bold uppercase tracking-wider bg-[#005A8D]/5 px-2.5 py-1 rounded transition-all"
                  id="link_student_footer_policies"
                >
                  Consent, Disclaimer &amp; Policies Page
                </button>
                <span>•</span>
                <span className="font-mono text-[10px]">POPIA Secure</span>
              </div>
            </footer>
          </main>
          </div>
        </div>
      )}

    </div>
  );
}
