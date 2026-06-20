/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, ArrowLeft, AlertTriangle } from "lucide-react";

interface PoliciesPageProps {
  onClose: () => void;
}

export default function PoliciesPage({ onClose }: PoliciesPageProps) {
  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col font-sans transition-all duration-300">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 py-4 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#005A8D]" id="policies_icon" />
            <span className="font-bold text-lg text-slate-800">BursaryBridge Policies & Terms</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold bg-[#005A8D] text-white py-2 px-4 rounded-lg hover:bg-[#003B5C] transition-all"
            id="btn_close_policies_top"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Application
          </button>
        </div>
      </header>

      <main className="flex-grow py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-8 sm:p-10 space-y-8">
          <div className="border-b border-gray-100 pb-6 text-center sm:text-left">
            <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase block">PLATFORM DISCLOSURE POLICY</span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Terms of Service & Disclaimer</h1>
            <p className="text-sm text-slate-500 mt-2 font-mono">Document reference: BB-POL-ZAS-2026</p>
          </div>

          {/* CRITICAL MERIT DISCLAIMER CARD */}
          <div className="bg-[#EAEDED] border-l-4 border-[#7FB3D5] rounded-xl p-6 flex gap-4 items-start" id="disclaimer_merit_box">
            <AlertTriangle className="w-6 h-6 text-[#005A8D] shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed text-slate-800">
              <h3 className="font-extrabold text-[#003B5C] uppercase tracking-wide text-xs mb-1">Critical Funding Notice</h3>
              <p className="font-medium">
                <strong>Submitting an application does not guarantee a bursary award.</strong> BursaryBridge acts solely as an identification and alignment pipeline linking eligible candidates with corporate corporate slots. Funding is subject to sponsor availability and board evaluations.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Sponsor & Institutional Non-Liability</h2>
              <p>
                The partnered academic institution and corporate sponsors bear absolutely no liability for non-award or delayed applications. Under no circumstances shall BursaryBridge, the university, or sponsoring enterprises be held responsible for outstanding student ledger balances or subsequent exclusion due to unsuccessful funding applications.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Evaluation Process & Communications</h2>
              <p>
                Applications are processed systematically through predefined educational workflows (Received → Under Review → Eligible → Approved/Declined). All applicants must await official, further communications regarding status transitions via verified institution emails or the in-app notification center. Centralized administrators will not process walk-in or phone-based inquiries and will refer students back to their secure portal.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950 mb-2">3. POPIA & Student Record Verification Compliance</h2>
              <p>
                By registering on BursaryBridge, students explicitly consent to the parsing and verification of their academic registries, South African ID credentials, and enrolled course metrics pursuant to the Protection of Personal Information Act (POPIA). All processed student record data remains isolated within standard multi-tenant boundaries and is blocked from external database crawlers.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-150 pt-6 text-center text-xs text-slate-400">
            National Student Financial Aid Alliance POPI Compliance Code: ZAS-992-04C4
          </div>
        </div>
      </main>
    </div>
  );
}
