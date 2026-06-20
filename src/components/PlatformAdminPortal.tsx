/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Building, ShieldCheck, Users, MapPin, Plus, Search, Terminal, 
  AlertTriangle, Award, ArrowRight, BarChart4, Download, Trash2, 
  Edit3, Check, X, ClipboardList, ChevronLeft, ChevronRight, Menu
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { Institution, AuditLog, Sponsor } from "../types";

interface PlatformAdminPortalProps {
  institutions: Institution[];
  auditLogs: AuditLog[];
  sponsors: Sponsor[];
  onUpdateSponsors: (sponsors: Sponsor[]) => void;
  onOnboardInstitution: (uni: Institution) => void;
  onViewPolicies: () => void;
}

export default function PlatformAdminPortal({
  institutions,
  auditLogs,
  sponsors,
  onUpdateSponsors,
  onOnboardInstitution,
  onViewPolicies
}: PlatformAdminPortalProps) {
  // Navigation internal tabs
  const [activeTab, setActiveTab] = useState<"tenant-overview" | "platform-analytics" | "sponsors-config" | "audit-logs">("tenant-overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Onboarding Form States
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("Gauteng, SA");
  const [formDomain, setFormDomain] = useState("");

  // Sponsor Form & Edit States
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [sponsName, setSponsName] = useState("");
  const [sponsQuota, setSponsQuota] = useState("R50M Disbursed");
  const [sponsFocus, setSponsFocus] = useState("STEM");
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [editSponsName, setEditSponsName] = useState("");
  const [editSponsQuota, setEditSponsQuota] = useState("");
  const [editSponsFocus, setEditSponsFocus] = useState("");

  // Alternative Professional Role Names for "Platform Admin" State (Work Item 11)
  const roleNameOptions = [
    "Platform Governance Superintendent",
    "SaaS Portfolio Overseer",
    "Global Institutional Director",
    "EdTech Network Administrator"
  ];
  const [selectedRoleName, setSelectedRoleName] = useState<string>("Platform Governance Superintendent");

  const filteredInstitutions = institutions.filter(inst => {
    return inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           inst.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
           inst.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDomain) {
      alert("Please specify the official South African university name and academic email domain.");
      return;
    }

    const domainSuffix = formDomain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");

    const newUni: Institution = {
      id: formName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 10),
      name: formName,
      location: formLocation,
      activeListings: 0,
      totalApplicants: 0,
      totalStudents: 0,
      lastActivityDate: "Just now",
      status: "Active",
      domain: domainSuffix
    };

    onOnboardInstitution(newUni);
    alert(`Success! Onboarded ${formName} (${domainSuffix}) securely. Tenant boundary container has been provisioned.`);
    setShowForm(false);
    setFormName("");
    setFormDomain("");
  };

  // Sponsor submission handlers (Work Item: modifying sponsors section placeholder dynamically)
  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsName) return;
    const newSponsor: Sponsor = {
      id: "spon-new-" + Date.now(),
      name: sponsName,
      quota: sponsQuota,
      focus: sponsFocus
    };
    onUpdateSponsors([...sponsors, newSponsor]);
    setShowSponsorForm(false);
    setSponsName("");
    setSponsQuota("R50M Disbursed");
    setSponsFocus("STEM");
    alert(`Sponsor "${sponsName}" onboarded! It will now display dynamically across public nodes.`);
  };

  const handleDeleteSponsor = (id: string) => {
    if (confirm("Are you sure you want to remove this corporate sponsor?")) {
      const filtered = sponsors.filter(s => s.id !== id);
      onUpdateSponsors(filtered);
    }
  };

  const startEditSponsor = (s: Sponsor) => {
    setEditingSponsorId(s.id);
    setEditSponsName(s.name);
    setEditSponsQuota(s.quota);
    setEditSponsFocus(s.focus);
  };

  const saveEditSponsor = (id: string) => {
    if (!editSponsName) return;
    const updated = sponsors.map(s => {
      if (s.id === id) {
        return { ...s, name: editSponsName, quota: editSponsQuota, focus: editSponsFocus };
      }
      return s;
    });
    onUpdateSponsors(updated);
    setEditingSponsorId(null);
  };

  // Global aggregate metrics
  const totalUniversitiesCount = institutions.length;
  const activeListingsTotal = institutions.reduce((acc, inst) => acc + inst.activeListings, 0);
  const registeredStudentsTotal = institutions.reduce((acc, inst) => acc + (inst.totalStudents || 0), 0);
  const totalSystemOperations = auditLogs.length;

  // Recharts color palette - Trust Navy blue, slate, and golden hues
  const CHART_COLORS = ["#1e3a8a", "#10b981", "#d97706", "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6"];

  // Recharts comparative dataset: University vs Listings & Students
  const comparisonData = institutions.map(inst => ({
    name: inst.id.toUpperCase(),
    fullName: inst.name,
    Listings: inst.activeListings || 0,
    Applicants: inst.totalApplicants || Math.floor(Math.random() * 55) + 5,
    Capacity: Math.round(inst.totalStudents / 100) // divide by 100 to fit scale
  }));

  // Recharts candidate distribution
  const candidateDistribution = institutions.map(inst => ({
    name: inst.id.toUpperCase(),
    value: inst.totalStudents || 4500
  }));

  // Robust Blob-based CSV Downloader
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

  const downloadTenantRegistry = () => {
    const headers = ["Institution ID", "Official Name", "Location", "Domain Suffix", "Active Sponsor Listings", "Total Applicant Submissions", "Baseline Students Count", "Encrypted Status"];
    const rows = institutions.map(inst => [
      inst.id,
      inst.name,
      inst.location,
      inst.domain,
      inst.activeListings,
      inst.totalApplicants,
      inst.totalStudents,
      inst.status
    ]);
    handleCSVDownload(headers, rows, `platformadmin_global_tenant_registry_2026.csv`);
  };

  const downloadSystemAudits = () => {
    const headers = ["Audit ID", "Timestamp UTC", "Principal User", "Role Authority", "Access Transaction Action", "IPv4 Address Block"];
    const rows = auditLogs.map(log => [
      log.id,
      log.timestamp,
      log.user,
      log.role,
      log.action,
      log.ipAddress
    ]);
    handleCSVDownload(headers, rows, `bursarybridge_transaction_syslogs_2026.csv`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans text-slate-800" id="platform_admin_portal_root">
      
      {/* SaaS Style Vertical Left Navigation Sidebar */}
      <aside 
        className={`bg-slate-900 text-white flex flex-col transition-all duration-300 h-screen sticky top-0 shrink-0 border-r border-slate-800 ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
        id="platform_admin_sidebar"
      >
        {/* Top brand header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#005A8D] flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            {isSidebarExpanded && (
              <div className="min-w-0">
                <span className="font-headline font-black text-white text-sm leading-none block truncate">
                  BursaryBridge <span className="text-emerald-400 font-bold text-[10px] font-mono ml-1">ROOT</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold font-sans uppercase tracking-widest block truncate mt-1">
                  {selectedRoleName}
                </span>
              </div>
            )}
          </div>
          {isSidebarExpanded && (
            <button 
              onClick={() => setIsSidebarExpanded(false)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-all shrink-0 ml-1"
              id="sidebar_collapse_btn"
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
              id="sidebar_expand_btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation items list */}
        <nav className="flex-grow py-4 px-3 space-y-1.5 overflow-y-auto" id="platform_admin_sidebar_nav">
          <button
            onClick={() => {
              setActiveTab("tenant-overview");
              setShowForm(false);
            }}
            title="Client Tenants"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "tenant-overview"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-350 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Building className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            {isSidebarExpanded && <span className="text-xs truncate">Client Tenants</span>}
            {isSidebarExpanded && activeTab === "tenant-overview" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("platform-analytics");
              setShowForm(false);
            }}
            title="Global Portfolio Insights"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "platform-analytics"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-355 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BarChart4 className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            {isSidebarExpanded && <span className="text-xs truncate">Portfolio Insights</span>}
            {isSidebarExpanded && activeTab === "platform-analytics" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("sponsors-config");
              setShowForm(false);
            }}
            title="Private Corporates"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "sponsors-config"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-355 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Award className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            {isSidebarExpanded && <span className="text-xs truncate">Private Corporates</span>}
            {isSidebarExpanded && activeTab === "sponsors-config" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("audit-logs");
              setShowForm(false);
            }}
            title="System Governance Logs"
            className={`w-full py-2.5 rounded-lg transition-all flex items-center gap-3 ${
              isSidebarExpanded ? "px-3" : "justify-center"
            } ${
              activeTab === "audit-logs"
                ? "bg-[#005A8D] text-white shadow-md font-extrabold"
                : "text-slate-355 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Terminal className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            {isSidebarExpanded && <span className="text-xs truncate">System Logs</span>}
            {isSidebarExpanded && activeTab === "audit-logs" && (
              <span className="ml-auto w-1.5 h-4 bg-amber-500 rounded-full"></span>
            )}
          </button>
        </nav>

        {/* Profile/Policies Quick Links at bottom */}
        {isSidebarExpanded && (
          <div className="p-4 border-t border-slate-800 space-y-2 mt-auto text-center">
            <button 
              onClick={onViewPolicies}
              className="text-[10px] text-slate-400 hover:text-white font-mono tracking-wider block w-full truncate"
            >
              SYS POLICIES & Ts & Cs
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Pane wrapper */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto" id="platform_admin_main_pane">
        
        {/* Top Slim Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-35 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase font-headline">
              {activeTab === "tenant-overview" ? "Client Tenant Registries" :
               activeTab === "platform-analytics" ? "Global System Analytics Insights" :
               activeTab === "sponsors-config" ? "Private Corporate Sponsors" :
               "System Security Transactions Logs"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Simple Account Info Badge on top slim bar */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 h-8 text-xs font-sans">
              <span className="font-extrabold block text-slate-700 text-xs hidden sm:block">Admin Oversight Node</span>
              <div className="w-8 h-8 rounded-full bg-[#005A8D]/10 text-[#005A8D] flex items-center justify-center font-bold">
                PA
              </div>
            </div>
          </div>
        </header>

        {/* Main viewport Area */}
        <main className="flex-grow p-6 md:p-8 font-sans">
        
        {/* Interactive Role Name Selection Bar (Work Item 11 Interface) */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans shadow-sm">
          <div className="text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Work Item 11 Role Renaming UI</span>
            <span className="text-slate-700 font-bold">Select a SaaS Alternative Role Title to rebrand the "Platform Admin" label:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {roleNameOptions.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  setSelectedRoleName(opt);
                  alert(`Renamed administrative role authority to: "${opt}" successfully.`);
                }}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                  selectedRoleName === opt
                    ? "bg-[#1e3a8a] text-white border-transparent shadow-sm font-black"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace banner POPIA disclosure */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex items-start gap-3 text-amber-900 text-xs leading-relaxed font-sans shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Strict Compliance Isolation Active:</strong> Centralized administrators and Platform Directors are legally barred from traversing student data blocks or accessing personally identifiable records directly. The rows listed below illustrate high-level metrics corresponding to telemetry and general catalog slots.
          </div>
        </div>

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-none">
              {activeTab === "tenant-overview" && "Client Tenant Registrations"}
              {activeTab === "platform-analytics" && "Global Portfolio Network Insights"}
              {activeTab === "sponsors-config" && "Private Corporate Partners Config"}
              {activeTab === "audit-logs" && "Global System Activity Ledger"}
            </h2>
            <p className="text-slate-405 text-slate-500 text-xs mt-2">
              Authorized oversight over South African university system networks. Fully aligned with POPIA requirements.
            </p>
          </div>

          {activeTab === "tenant-overview" && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1e3a8a] hover:bg-[#172554] text-white font-sans text-xs font-bold px-5 py-3 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Onboard University Suffix
            </button>
          )}

          {activeTab === "sponsors-config" && !showSponsorForm && (
            <button
              onClick={() => setShowSponsorForm(true)}
              className="bg-[#d97706] hover:bg-[#b45309] text-white font-sans text-xs font-bold px-5 py-3 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Private Corporate Partner
            </button>
          )}
        </header>

        {/* TENANT OVERVIEW TAB */}
        {activeTab === "tenant-overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* National Aggregates cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 font-sans">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Onboarded Academies</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">{totalUniversitiesCount}</p>
                <span className="text-[10px] text-[#10b981] font-bold mt-1.5 inline-block">Provisions secure</span>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Active Funding Contracts</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">{activeListingsTotal}</p>
                <div className="text-[10px] text-slate-405 text-slate-500 mt-1.5 inline-block">Sponsor targets mounted</div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wide block uppercase font-mono">Candidate Student Pool</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">
                  {registeredStudentsTotal.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400 font-medium mt-1.5 inline-block">South African active database limits</span>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-450 font-extrabold text-slate-400 tracking-wide block uppercase font-mono">Central System Ops</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">
                  {totalSystemOperations}
                </p>
                <span className="text-[10px] text-amber-600 font-bold mt-1.5 inline-block">Telemetries recorded ✓</span>
              </div>
            </div>

            {/* If Onboarding Form is active (SOCIALLY UPDATED REGIONAL SELECTION WITH ALL 9 SA PROVINCES) */}
            {showForm && (
              <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
                <h3 className="font-headline text-lg font-bold text-slate-800 mb-4 text-[#1e3a8a]">Onboard New University Tenant Client</h3>
                <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-slate-705 text-slate-600 font-extrabold mb-1.5 uppercase">Institution Official Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. University of Port Elizabeth"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg focus:border-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-705 text-slate-600 font-extrabold mb-1.5 uppercase">Regional Location (All 9 Provinces - Work Item 9 Mapping)</label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg focus:border-slate-800 outline-none font-bold text-slate-800"
                      id="select_onboard_province"
                    >
                      <option value="Eastern Cape, SA">Eastern Cape, SA</option>
                      <option value="Free State, SA">Free State, SA</option>
                      <option value="Gauteng, SA">Gauteng, SA</option>
                      <option value="KwaZulu-Natal, SA">KwaZulu-Natal, SA</option>
                      <option value="Limpopo, SA">Limpopo, SA</option>
                      <option value="Mpumalanga, SA">Mpumalanga, SA</option>
                      <option value="Northern Cape, SA">Northern Cape, SA</option>
                      <option value="North West, SA">North West, SA</option>
                      <option value="Western Cape, SA">Western Cape, SA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-705 text-slate-600 font-extrabold mb-1.5 uppercase">Official Academic Email Domain Suffix</label>
                    <input
                      type="text"
                      required
                      value={formDomain}
                      onChange={(e) => setFormDomain(e.target.value)}
                      placeholder="e.g. upe.ac.za"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg focus:border-slate-800 outline-none"
                    />
                    <em className="text-[10px] text-slate-450 text-slate-400 mt-1 block leading-normal">
                      *Tightly matches student registration domain checks to automatically isolate student workloads.
                    </em>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#1e3a8a] text-white font-bold rounded-lg hover:bg-opacity-90 shadow-sm uppercase text-[10px] tracking-wider font-extrabold whitespace-nowrap"
                    >
                      Provision Workspace Instance
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* See client lists */}
            {!showForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-slate-800">Onboarded Regional Pipelines</h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans">Telemetry mapping live activity states across verified digital boundaries.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={downloadTenantRegistry}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" /> Export Tenant CSV
                    </button>

                    <div className="relative font-sans">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search onboard suffix..."
                        className="bg-slate-50 border border-slate-200 text-xs px-3.5 py-2 pl-8 rounded-lg outline-none w-52 focus:w-64 transition-all"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 uppercase text-[10px] font-bold tracking-widest">
                        <th className="px-6 py-4">Academy Node</th>
                        <th className="px-6 py-4">Demographics Location</th>
                        <th className="px-6 py-4">Email Domain Suffix</th>
                        <th className="px-6 py-4">Active Sponsoring Listings</th>
                        <th className="px-6 py-4">Total Capacity Base</th>
                        <th className="px-6 py-4">Last Event Telemetry</th>
                        <th className="px-6 py-4 text-right font-bold">Encrypted Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-750 text-slate-700">
                      {filteredInstitutions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium bg-white">
                            <Building className="w-10 h-10 mx-auto text-slate-350 mb-2.5" />
                            <span className="block text-slate-700 font-extrabold text-sm mb-1">No registered universities in the registry</span>
                            <span className="text-xs text-slate-400 max-w-md mx-auto block leading-normal">
                              Use the SandBox Panel's "LOAD PLATFORM DEMO SEED DATA" button or configure custom institutions using the form controls above.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        filteredInstitutions.map((inst) => (
                          <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-extrabold text-slate-800 block">{inst.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">T_ID: {inst.id.toUpperCase()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 font-medium text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {inst.location}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono font-medium text-slate-900">{inst.domain}</td>
                            <td className="px-6 py-4 font-extrabold text-slate-800">{inst.activeListings} active</td>
                            <td className="px-6 py-4 font-extrabold text-slate-800 font-mono">{(inst.totalStudents || 4500).toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-400 font-medium">{inst.lastActivityDate}</td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded uppercase font-mono">
                                {inst.status === "Active" ? "Active" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLATFORM ANALYTICS TAB (Detailed metrics and comparing charts requested) */}
        {activeTab === "platform-analytics" && (
          <div className="space-y-8 animate-fade-in text-xs font-sans">
            {/* Download summary bar */}
            <div className="bg-slate-100 p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-extrabold text-slate-800 text-xs">Network Insights Ledger System</span>
                <p className="text-[10px] text-slate-550 text-slate-500">Generating direct performance telemetry reports for external regulators.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadTenantRegistry}
                  className="bg-[#1e3a8a] hover:bg-opacity-90 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Tenant Global CSV
                </button>
                <button
                  onClick={downloadSystemAudits}
                  className="bg-[#d97706] hover:bg-opacity-90 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Audit syslogger CSV
                </button>
              </div>
            </div>

            {/* Grid of charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Comparative metric chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-1">Institution Comparison Metrics</h3>
                <p className="text-[10px] text-slate-400 mb-6">Comparative balance of Active Sponsor Postings and Applicant Volume per University Node.</p>
                
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#f8fafc" }}
                        labelStyle={{ fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                      <Bar dataKey="Listings" fill="#1e3a8a" name="Active Listings" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Applicants" fill="#d97706" name="Applicants Pool" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribute Pie chart of candidates */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-1">Student Candidate Distribution</h3>
                <p className="text-[10px] text-slate-405 text-slate-400 mb-6">Percentage breakdown of South African registered candidates by University Node.</p>
                
                <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="h-full w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={candidateDistribution}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {candidateDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full sm:w-1/2 space-y-2">
                    {candidateDistribution.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-slate-50 pb-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                          />
                          <span className="font-bold text-slate-700">{item.name} Suffix</span>
                        </div>
                        <span className="font-mono font-medium text-slate-500">{item.value.toLocaleString()} students</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Platform usage telemetry indicators */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Platform Governance & Health States</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Database Partition Sync</div>
                  <div className="font-mono font-black text-xl text-emerald-700 mt-1">100% ISOLATED</div>
                  <em className="text-[9px] text-slate-400 block mt-0.5">Strict Tenant Multi-tenancy</em>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">POPIA Compliance Audit</div>
                  <div className="font-mono font-black text-xl text-[#1e3a8a] mt-1">SECURE ✓</div>
                  <em className="text-[9px] text-slate-400 block mt-0.5">Automated scrubbing module</em>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Average Match Precision</div>
                  <div className="font-mono font-black text-xl text-amber-600 mt-1">94.2%</div>
                  <em className="text-[9px] text-slate-400 block mt-0.5">Qualification matching accuracy</em>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Regulator Suffix Feed</div>
                  <div className="font-mono font-black text-xl text-indigo-700 mt-1">ACTIVE</div>
                  <em className="text-[9px] text-slate-400 block mt-0.5">Private keys encrypted</em>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SPONSORS CONFIG TAB (Modifying placeholder partners directly inside the running app!) */}
        {activeTab === "sponsors-config" && (
          <div className="space-y-8 animate-fade-in font-sans text-xs">
            {/* Instruction Callout */}
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl text-indigo-900 leading-normal">
              <h4 className="font-bold text-sm mb-1 text-[#1e3a8a]">Adaptive Workspace Content Adjuster</h4>
              <p className="text-xs">
                In compliance with administrative guidelines, this management workbench allows complete modification of the platform's partnering universities and <strong>Private Corporate Sponsor</strong> placements. Changes here update immediately across public vistas.
              </p>
            </div>

            {/* If Form is Active */}
            {showSponsorForm && (
              <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md max-w-xl mx-auto">
                <h3 className="font-headline text-base font-bold text-[#1e3a8a] mb-4">Add Private Corporate Partner & Sponsor</h3>
                <form onSubmit={handleAddSponsor} className="space-y-4">
                  <div>
                    <label className="block text-slate-750 text-slate-600 font-extrabold mb-1">Corporate Sponsor Name</label>
                    <input
                      type="text"
                      required
                      value={sponsName}
                      onChange={(e) => setSponsName(e.target.value)}
                      placeholder="e.g. Vodacom South Africa"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-750 text-slate-600 font-extrabold mb-1">Quota / Disbursed Amount</label>
                      <input
                        type="text"
                        required
                        value={sponsQuota}
                        onChange={(e) => setSponsQuota(e.target.value)}
                        placeholder="e.g. R45M Disbursed"
                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-750 text-slate-600 font-extrabold mb-1">Funding Focus / Disciplines</label>
                      <input
                        type="text"
                        required
                        value={sponsFocus}
                        onChange={(e) => setSponsFocus(e.target.value)}
                        placeholder="e.g. Telecoms & Software"
                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSponsorForm(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#d97706] text-white font-bold rounded-lg hover:bg-opacity-95 text-[11px] uppercase tracking-wider"
                    >
                      Publish Partner Placement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sponsors List editor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-850 text-base">Corporate Sponsorship Registry</h3>
                <p className="text-slate-400 text-xs mt-1">Live configuration of partners rendered inside trusted corridors.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 uppercase text-[10px] font-bold tracking-widest">
                      <th className="px-6 py-4">Sponsor Brand Entity</th>
                      <th className="px-6 py-4">Total Quota Allocation</th>
                      <th className="px-6 py-4">Educational Academic Focus</th>
                      <th className="px-6 py-4 text-right">Oversight Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {sponsors.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          {editingSponsorId === s.id ? (
                            <input
                              type="text"
                              value={editSponsName}
                              onChange={(e) => setEditSponsName(e.target.value)}
                              className="bg-white border border-slate-300 px-2 py-1 rounded w-full font-bold"
                            />
                          ) : (
                            <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              {s.name}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono font-medium text-slate-650">
                          {editingSponsorId === s.id ? (
                            <input
                              type="text"
                              value={editSponsQuota}
                              onChange={(e) => setEditSponsQuota(e.target.value)}
                              className="bg-white border border-slate-300 px-2 py-1 rounded w-full font-mono"
                            />
                          ) : (
                            <span className="bg-amber-50 rounded-md text-amber-800 px-2 py-1 text-[11px] font-bold">
                              {s.quota}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {editingSponsorId === s.id ? (
                            <input
                              type="text"
                              value={editSponsFocus}
                              onChange={(e) => setEditSponsFocus(e.target.value)}
                              className="bg-white border border-slate-300 px-2 py-1 rounded w-full"
                            />
                          ) : (
                            <span className="font-bold text-[#1e3a8a] uppercase bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                              {s.focus}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {editingSponsorId === s.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => saveEditSponsor(s.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg flex items-center justify-center transition-all"
                                title="Save Corporate Partner details"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingSponsorId(null)}
                                className="bg-slate-450 bg-slate-400 hover:bg-slate-500 text-white p-1.5 rounded-lg flex items-center justify-center transition-all"
                                title="Cancel modification"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditSponsor(s)}
                                className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
                                title="Modify partner information"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSponsor(s.id)}
                                className="text-red-500 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                title="Remove partner entity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === "audit-logs" && (
          <div className="bg-[#0f172a] text-[#38bdf8] rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 font-mono text-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <span className="font-extrabold text-[#38bdf8] flex items-center gap-2">
                <Terminal className="w-4 h-4" /> root@bursarybridge-systems-core:~# cat syslog | tail -n 100
              </span>
              <button
                onClick={downloadSystemAudits}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans border border-slate-755 text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3 h-3 text-slate-450" /> Backup Syslog CSV
              </button>
            </div>

            <div className="space-y-3 leading-relaxed max-h-[500px] overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="hover:bg-white/5 p-2 rounded transition-colors border-l-2 border-slate-700 hover:border-[#38bdf8]">
                  <span className="text-[#64748b] font-semibold">[{log.timestamp}]</span>{" "}
                  <span className="text-[#a855f7] font-semibold">{log.user} ({log.role})</span>{" "}
                  <span className="text-[#f1f5f9] font-medium">- {log.action}</span>{" "}
                  <span className="text-[#10b981] font-mono text-[10px]">@{log.ipAddress}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 mt-6 text-[#64748b] text-[10px] leading-relaxed flex justify-between items-center">
              <span>Automatic cryptographic encryption protocol is enabled for audit streams safely.</span>
              <span className="font-extrabold text-slate-400">STATUS: COMPLIANT ✓</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer referencing terms always-accessible */}
      <footer className="bg-slate-900 text-slate-500 border-t border-slate-800 text-center py-6 px-6 mt-auto text-xs flex justify-between items-center max-w-7xl mx-auto w-full">
        <div>
          <span>&copy; BursaryBridge. Standard Governance Network.</span>
          <button onClick={onViewPolicies} className="text-amber-500 hover:underline font-extrabold ml-3" id="btn_policies_footer">
            Terms &amp; Disclaimers (Ts &amp; Cs)
          </button>
        </div>
        <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Role: Global superintendent node oversight</span>
      </footer>
      </div>
    </div>
  );
}
