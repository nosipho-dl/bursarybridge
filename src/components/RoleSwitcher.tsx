/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, ShieldAlert, Library, Sparkles, MonitorSmartphone } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: "visitor" | "student" | "admin" | "platformadmin";
  onRoleChange: (role: "visitor" | "student" | "admin" | "platformadmin") => void;
  selectedAdminUniId: string;
  onAdminUniChange: (uniId: string) => void;
  institutions: Array<{ id: string; name: string }>;
  isStudentRegistered: boolean;
  onResetSimulation: () => void;
}

export default function RoleSwitcher({
  currentRole,
  onRoleChange,
  selectedAdminUniId,
  onAdminUniChange,
  institutions,
  isStudentRegistered,
  onResetSimulation
}: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-hanken">
      {isOpen ? (
        <div className="bg-[#001F3F] border border-[#7FB3D5]/20 text-white rounded-2xl shadow-2xl p-4 w-80 backdrop-blur-md bg-opacity-95 transition-all">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="flex items-center gap-2 font-bold text-sm tracking-wider uppercase text-[#7FB3D5]">
              <MonitorSmartphone className="w-4 h-4" />
              Dev Sandbox Controls
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white text-xs px-1.5 py-0.5 rounded bg-white/10"
            >
              Hide
            </button>
          </div>

          <p className="text-xs text-white/80 mb-3 leading-relaxed">
            Quickly jump between user roles to evaluate the multi-step student flows, isolated university workspaces, and administrators views:
          </p>

          <div className="space-y-2 mb-4">
            <button
              onClick={() => onRoleChange("visitor")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                currentRole === "visitor"
                  ? "bg-[#005A8D] text-white font-bold shadow-md"
                  : "bg-white/5 text-white/90 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                1. Landing Page
              </span>
              <span className="text-[10px] uppercase opacity-70">Visitor</span>
            </button>

            <button
              onClick={() => onRoleChange("student")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                currentRole === "student"
                  ? "bg-[#005A8D] text-white font-bold shadow-md"
                  : "bg-white/5 text-white/90 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                2. Student Workspace
              </span>
              <span className="text-[10px] uppercase opacity-70">
                {isStudentRegistered ? "Portal" : "Wizard"}
              </span>
            </button>

            <div className={`p-2 rounded-lg border ${currentRole === "admin" ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent"}`}>
              <button
                onClick={() => onRoleChange("admin")}
                className={`w-full text-left px-2 py-1 rounded-md text-xs flex items-center justify-between transition-all ${
                  currentRole === "admin"
                    ? "text-[#7FB3D5] font-bold"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Library className="w-3.5 h-3.5" />
                  3. Institution Admin
                </span>
                <span className="text-[10px] uppercase opacity-70">Workspace</span>
              </button>
              
              {currentRole === "admin" && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-white/60">Managed Uni:</span>
                  <select
                    value={selectedAdminUniId}
                    onChange={(e) => onAdminUniChange(e.target.value)}
                    className="bg-[#001F3F] border border-white/20 rounded px-1 py-0.5 text-[11px] text-white focus:outline-none"
                  >
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.id.toUpperCase()} Admin
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={() => onRoleChange("platformadmin")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                currentRole === "platformadmin"
                  ? "bg-[#005A8D] text-white font-bold shadow-md"
                  : "bg-white/5 text-white/90 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                4. Platform Admin
              </span>
              <span className="text-[10px] uppercase opacity-70">All Unis</span>
            </button>
          </div>

          <div className="flex gap-2 justify-between items-center text-[10px]">
            <span className="text-white/40">Tenant Lock Simulation: Active</span>
            <button
              onClick={onResetSimulation}
              className="text-[#7FB3D5] hover:underline font-bold"
            >
              Reset Data
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#001F3F] hover:bg-[#003B5C] border border-[#7FB3D5]/20 text-white rounded-full p-3 shadow-2xl flex items-center gap-2 transition-all"
        >
          <MonitorSmartphone className="w-5 h-5 text-[#7FB3D5] animate-pulse" />
          <span className="text-xs font-bold font-hanken pr-1">Toggle Dev Controls</span>
        </button>
      )}
    </div>
  );
}
