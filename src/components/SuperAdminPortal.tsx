/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Building, ShieldCheck, ShieldAlert, Users, Compass, 
  MapPin, Plus, Search, Terminal, AlertTriangle, CheckSquare
} from "lucide-react";
import { Institution, AuditLog } from "../types";

interface SuperAdminPortalProps {
  institutions: Institution[];
  auditLogs: AuditLog[];
  onOnboardInstitution: (uni: Institution) => void;
}

export default function SuperAdminPortal({
  institutions,
  auditLogs,
  onOnboardInstitution
}: SuperAdminPortalProps) {
  // Navigation internal tab
  const [activeTab, setActiveTab] = useState<"tenant-overview" | "audit-logs">("tenant-overview");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Onboarding Form States
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("Gauteng, SA");
  const [formDomain, setFormDomain] = useState("");

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
    alert(`Success! Onboarded ${formName} (${domainSuffix}) securely. Tenant boundary container has been provisions.`);
    setShowForm(false);
    setFormName("");
    setFormDomain("");
  };

  // Global aggregate metrics
  const totalUniversitiesCount = institutions.length;
  const activeListingsTotal = institutions.reduce((acc, inst) => acc + inst.activeListings, 0);
  const registeredStudentsTotal = institutions.reduce((acc, inst) => acc + (inst.totalStudents || 0), 0);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row font-sans text-on-surface">
      
      {/* Super Admin Left Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col py-6 shrink-0 font-hanken">
        <div className="px-6 mb-10 border-b border-white/5 pb-6">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">SYSTEM OVERSIGHT</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-white mt-1">SuperAdmin</h1>
          <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded bg-[#399c30]/15 text-[#399c30] text-xs font-bold border border-[#399c30]/30 w-fit">
            <ShieldCheck className="w-4 h-4" /> SECURE ROOT
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab("tenant-overview");
              setShowForm(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === "tenant-overview"
                ? "bg-[#795900] text-white shadow-sm"
                : "text-[#ced4da] hover:bg-white/5"
            }`}
          >
            <Building className="w-4 h-4" /> Client Tenant Clusters
          </button>

          <button
            onClick={() => {
              setActiveTab("audit-logs");
              setShowForm(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === "audit-logs"
                ? "bg-[#795900] text-white shadow-sm"
                : "text-[#ced4da] hover:bg-white/5"
            }`}
          >
            <Terminal className="w-4 h-4" /> Core System Audits
          </button>
        </nav>

        <div className="px-6 py-4 mt-auto border-t border-white/5 text-[10px] text-slate-400 leading-relaxed">
          <p className="font-bold">POPIA Boundary Protection</p>
          <p className="mt-1">Relational schema isolations active. Student credentials filtered from centralized dashboards.</p>
        </div>
      </aside>

      {/* Main workplace Area */}
      <main className="flex-grow bg-slate-50 p-6 md:p-8 overflow-y-auto font-sans">
        
        {/* Workspace banner disclaimer */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex items-start gap-3 text-amber-900 text-xs leading-relaxed font-hanken">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <strong>Strict Compliance Isolation Active:</strong> Centralized administrators are legally barred from traversing student data blocks or accessing personally identifiable records. The rows listed below illustrate high-level metrics corresponding to telemetry and general catalog slots.
          </div>
        </div>

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6 mb-8">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-slate-800">
              {activeTab === "tenant-overview" ? "Client Tenant Registrations" : "Global System Activity Ledger"}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Active South African academic cluster. Network nodes are isolated cryptographically.
            </p>
          </div>

          {activeTab === "tenant-overview" && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#795900] text-white font-hanken text-xs font-bold px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-secondary-container transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Onboard University Suffix
            </button>
          )}
        </header>

        {/* TENANT OVERVIEW TAB */}
        {activeTab === "tenant-overview" && (
          <div className="space-y-8">
            {/* National Aggregates cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-hanken">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Onboarded Academies</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">{totalUniversitiesCount}</p>
                <span className="text-[10px] text-[#399c30] font-medium mt-1 inline-block">Provisions intact</span>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Cross-Network Active Listings</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">{activeListingsTotal}</p>
                <div className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Combined corporate funding contracts</div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wide block uppercase">Registered Candidate Pool</span>
                <p className="font-headline text-3xl font-black text-slate-800 mt-2">
                  {registeredStudentsTotal.toLocaleString()} +
                </p>
                <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Active South African enrollment database</span>
              </div>
            </div>

            {/* If Onboarding Form is active */}
            {showForm && (
              <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
                <h3 className="font-headline text-lg font-bold text-slate-800 mb-4">Onboard New University Tenant Client</h3>
                <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs font-hanken">
                  <div>
                    <label className="block text-slate-700 font-extrabold mb-1.5 uppercase">Institution Official Name</label>
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
                    <label className="block text-slate-700 font-extrabold mb-1.5 uppercase">Regional Location</label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg focus:border-slate-800 outline-none"
                    >
                      <option value="Gauteng, SA">Gauteng, SA</option>
                      <option value="Western Cape, SA">Western Cape, SA</option>
                      <option value="KwaZulu-Natal, SA">KwaZulu-Natal, SA</option>
                      <option value="Eastern Cape, SA">Eastern Cape, SA</option>
                      <option value="Free State, SA">Free State, SA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-extrabold mb-1.5 uppercase">Official Academic Email Domain Suffix</label>
                    <input
                      type="text"
                      required
                      value={formDomain}
                      onChange={(e) => setFormDomain(e.target.value)}
                      placeholder="e.g. upe.ac.za"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg focus:border-slate-800 outline-none"
                    />
                    <em className="text-[10px] text-slate-400 mt-1 block leading-normal">
                      *Tightly matches student registration domain checks to automatically identify user workspaces.
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
                      className="px-5 py-2 bg-[#795900] text-white font-bold rounded-lg hover:brightness-110"
                    >
                      Provision Workspace Instance
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Search filter client list */}
            {!showForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-slate-800">Onboarded Regional Pipelines</h3>
                    <p className="text-xs text-slate-400 mt-1">Telemetry rows tracking live activity states for POPIA security scans.</p>
                  </div>

                  <div className="relative font-hanken">
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

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 uppercase text-[10px] font-bold font-hanken tracking-widest">
                        <th className="px-6 py-4">Academy Node</th>
                        <th className="px-6 py-4">Demographics Location</th>
                        <th className="px-6 py-4">Email Domain Suffix</th>
                        <th className="px-6 py-4">Active Sponsoring Listings</th>
                        <th className="px-6 py-4">Applicant Volume</th>
                        <th className="px-6 py-4">Last Event Telemetry</th>
                        <th className="px-6 py-4 text-right">Encrypted Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                      {filteredInstitutions.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-slate-800 block">{inst.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-hanken font-bold tracking-wider">T_ID: {inst.id.toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1 font-medium text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {inst.location}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-medium text-slate-900">{inst.domain}</td>
                          <td className="px-6 py-4 font-extrabold text-slate-800">{inst.activeListings} listings</td>
                          <td className="px-6 py-4 font-extrabold text-slate-800">{(inst.totalApplicants || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-400 font-medium">{inst.lastActivityDate}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-hanken font-bold text-[10px] bg-green-50 border border-green-200 text-[#399c30] px-2 py-0.5 rounded uppercase">
                              {inst.status === "Active" ? "Active Boundary" : "Pending Approval"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === "audit-logs" && (
          <div className="bg-[#0f172a] text-[#38bdf8] rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <span className="font-extrabold text-[#38bdf8] flex items-center gap-2">
                <Terminal className="w-4 h-4" /> root@bursarybridge-systems-core:~# cat syslog | tail -n 100
              </span>
              <span className="text-[10px] text-slate-400 font-hanken">Active Encoded POPIA Activity Ledger</span>
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

            <div className="border-t border-slate-800 pt-4 mt-6 text-[#64748b] text-[10px] leading-relaxed flex justify-between items-center font-hanken">
              <span>Automatic cryptographic encryption protocol is enabled for audit streams.</span>
              <span className="font-bold">STATUS: COMPLIANT ✓</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
