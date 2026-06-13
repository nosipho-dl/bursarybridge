/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import StudentPortal from "./components/StudentPortal";
import InstitutionPortal from "./components/InstitutionPortal";
import SuperAdminPortal from "./components/SuperAdminPortal";
import RoleSwitcher from "./components/RoleSwitcher";

import { Institution, Bursary, StudentProfile, BursaryApplication, AuditLog, Faculty, Department, Programme } from "./types";
import { 
  initialInstitutions, 
  initialBursaries, 
  initialApplications, 
  initialAuditLogs,
  initialFaculties,
  initialDepartments,
  initialProgrammes
} from "./data";

export default function App() {
  // Central State with local storage persistence
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    const saved = localStorage.getItem("bb_institutions");
    return saved ? JSON.parse(saved) : initialInstitutions;
  });

  const [faculties, setFaculties] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem("bb_faculties");
    return saved ? JSON.parse(saved) : initialFaculties;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem("bb_departments");
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [programmes, setProgrammes] = useState<Programme[]>(() => {
    const saved = localStorage.getItem("bb_programmes");
    return saved ? JSON.parse(saved) : initialProgrammes;
  });

  const [bursaries, setBursaries] = useState<Bursary[]>(() => {
    const saved = localStorage.getItem("bb_bursaries");
    return saved ? JSON.parse(saved) : initialBursaries;
  });

  const [applications, setApplications] = useState<BursaryApplication[]>(() => {
    const saved = localStorage.getItem("bb_applications");
    return saved ? JSON.parse(saved) : initialApplications;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("bb_audit_logs");
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem("bb_student_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // Simulator navigation
  const [currentRole, setCurrentRole] = useState<"visitor" | "student" | "admin" | "superadmin">("visitor");
  const [selectedAdminUniId, setSelectedAdminUniId] = useState<string>("uct");

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("bb_institutions", JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    localStorage.setItem("bb_faculties", JSON.stringify(faculties));
  }, [faculties]);

  useEffect(() => {
    localStorage.setItem("bb_departments", JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem("bb_programmes", JSON.stringify(programmes));
  }, [programmes]);

  useEffect(() => {
    localStorage.setItem("bb_bursaries", JSON.stringify(bursaries));
  }, [bursaries]);

  useEffect(() => {
    localStorage.setItem("bb_applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("bb_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("bb_student_profile", studentProfile ? JSON.stringify(studentProfile) : "");
  }, [studentProfile]);

  // Recalculate listings totals dynamically for institution summaries
  useEffect(() => {
    setInstitutions(prev => {
      return prev.map(inst => {
        const uniActiveListings = bursaries.filter(b => b.institutionId === inst.id && b.status !== "Draft").length;
        const uniApplicants = applications.filter(app => {
          const linkedB = bursaries.find(bx => bx.id === app.bursaryId);
          return linkedB && linkedB.institutionId === inst.id;
        }).length;

        // Mock student count increase
        const baseStudents = inst.id === "uct" ? 15600 : inst.id === "wits" ? 14200 : inst.id === "ukzn" ? 9800 : 6100;

        return {
          ...inst,
          activeListings: uniActiveListings,
          totalApplicants: uniApplicants,
          totalStudents: baseStudents + (studentProfile?.institutionId === inst.id ? 1 : 0)
        };
      });
    });
  }, [bursaries, applications, studentProfile]);

  // Helper action: Add log
  const pushAudit = (user: string, role: string, action: string) => {
    const newLog: AuditLog = {
      id: "log-new-" + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user,
      role,
      action,
      ipAddress: "196.24.44." + Math.floor(Math.random() * 250 + 1)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Student profile operations
  const handleSaveStudentProfile = (profile: StudentProfile) => {
    setStudentProfile(profile);
    const uni = institutions.find(i => i.id === profile.institutionId);
    pushAudit(
      profile.fullName,
      "Student",
      `Completed registration & verified GPA matching with institution ${uni?.name || "Workspace"}`
    );
  };

  const handleResetStudentState = () => {
    setStudentProfile(null);
    setCurrentRole("visitor");
    pushAudit("Autonomous Client Daemon", "System", "Terminated student session locks; flushed browser caches.");
  };

  // Student application operation
  const handleAddNewApplication = (app: BursaryApplication) => {
    setApplications(prev => [app, ...prev]);
    pushAudit(
      app.studentName,
      "Student",
      `Submitted digital application for program ID: ${app.bursaryId.toUpperCase()}`
    );
  };

  // Admin operations
  const handleAddNewBursary = (bur: Bursary) => {
    setBursaries(prev => [bur, ...prev]);
    const uni = institutions.find(i => i.id === selectedAdminUniId);
    pushAudit(
      `${uni?.id.toUpperCase()} Board Reviewer`,
      "Institution Admin",
      `Onboarded & published new targeted program: ${bur.name}`
    );
  };

  const handleUpdateBursary = (updated: Bursary) => {
    setBursaries(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    const uni = institutions.find(i => i.id === selectedAdminUniId);
    pushAudit(
      `${uni?.id.toUpperCase()} Board Reviewer`,
      "Institution Admin",
      `Updated program matching criteria for: ${updated.name}`
    );
  };

  const handleDeleteBursary = (id: string) => {
    const target = bursaries.find(b => b.id === id);
    setBursaries(prev => prev.filter(b => b.id !== id));
    // Remove matches applications as well
    setApplications(prev => prev.filter(app => app.bursaryId !== id));

    const uni = institutions.find(i => i.id === selectedAdminUniId);
    pushAudit(
      `${uni?.id.toUpperCase()} Admin`,
      "Institution Admin",
      `Deleted bursary listing: ${target?.name || "Unknown Listing"}`
    );
  };

  const handleUpdateApplicationStatus = (appId: string, status: "Approved" | "Declined") => {
    setApplications(prev => prev.map(app => (app.id === appId ? { ...app, status } : app)));
    const targetApp = applications.find(a => a.id === appId);
    const uni = institutions.find(i => i.id === selectedAdminUniId);
    pushAudit(
      `${uni?.id.toUpperCase()} Board reviewer`,
      "Institution Admin",
      `Reviewed student ${targetApp?.studentName || "Applicant"} and updated submission status to [${status}]`
    );
  };

  // Super Admin operations
  const handleOnboardInstitution = (newUni: Institution) => {
    setInstitutions(prev => [...prev, newUni]);
    pushAudit(
      "Global Super Admin",
      "Super Admin",
      `Provisioned digital workspace boundary & onboarding email suffix: ${newUni.name} (${newUni.domain})`
    );
  };

  // Simulation controls reset
  const handleResetSimulation = () => {
    if (confirm("Are you sure you want to flush sandbox records back to seed initializations?")) {
      localStorage.clear();
      setInstitutions(initialInstitutions);
      setBursaries(initialBursaries);
      setApplications(initialApplications);
      setAuditLogs(initialAuditLogs);
      setFaculties(initialFaculties);
      setDepartments(initialDepartments);
      setProgrammes(initialProgrammes);
      setStudentProfile(null);
      setCurrentRole("visitor");
      setSelectedAdminUniId("uct");
      alert("Flushed complete workspace registries to standard seeds successfully.");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-surface">
      
      {/* Active view renderer */}
      <div className="flex-grow">
        {currentRole === "visitor" && (
          <LandingPage
            onStartRegistration={() => setCurrentRole("student")}
            onLoginAsStudent={() => setCurrentRole("student")}
            onLoginAsAdmin={() => {
              setSelectedAdminUniId("uct");
              setCurrentRole("admin");
            }}
            institutions={institutions}
          />
        )}

        {currentRole === "student" && (
          <StudentPortal
            profile={studentProfile}
            onSaveProfile={handleSaveStudentProfile}
            institutions={institutions}
            faculties={faculties}
            departments={departments}
            programmes={programmes}
            bursaries={bursaries}
            applications={applications}
            onAddNewApplication={handleAddNewApplication}
            onResetStudentState={handleResetStudentState}
          />
        )}

        {currentRole === "admin" && (
          <InstitutionPortal
            uniId={selectedAdminUniId}
            institutions={institutions}
            faculties={faculties}
            departments={departments}
            programmes={programmes}
            bursaries={bursaries}
            applications={applications}
            onAddNewBursary={handleAddNewBursary}
            onUpdateBursary={handleUpdateBursary}
            onDeleteBursary={handleDeleteBursary}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onUpdateFaculties={setFaculties}
            onUpdateDepartments={setDepartments}
            onUpdateProgrammes={setProgrammes}
          />
        )}

        {currentRole === "superadmin" && (
          <SuperAdminPortal
            institutions={institutions}
            auditLogs={auditLogs}
            onOnboardInstitution={handleOnboardInstitution}
          />
        )}
      </div>

      {/* Persistent sandbox controls switcher on base layout */}
      <RoleSwitcher
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
        }}
        selectedAdminUniId={selectedAdminUniId}
        onAdminUniChange={(id) => setSelectedAdminUniId(id)}
        institutions={institutions}
        isStudentRegistered={!!studentProfile}
        onResetSimulation={handleResetSimulation}
      />
    </div>
  );
}
