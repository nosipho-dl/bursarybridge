/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GraduationCap, ArrowRight, ShieldCheck, Award, CheckCircle, Sparkles } from "lucide-react";
import { Sponsor } from "../types";

interface LandingPageProps {
  onStartRegistration: () => void;
  onLoginAsStudent: () => void;
  onLoginAsAdmin: () => void;
  institutions: Array<{ id: string; name: string; location: string }>;
  sponsors: Sponsor[];
  onViewPolicies: () => void;
}

export default function LandingPage({
  onStartRegistration,
  onLoginAsStudent,
  onLoginAsAdmin,
  institutions,
  sponsors,
  onViewPolicies
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col font-sans" id="landing_page_root">
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm transition-all" id="main_header">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" id="header_logo_group">
            <div className="w-9 h-9 rounded-lg bg-[#003B5C] flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline text-lg font-black text-neutral-900 tracking-tight">
              Bursary<span className="text-[#7FB3D5]">Bridge</span>
            </span>
          </div>

          <div className="flex items-center gap-6 font-sans text-xs font-bold" id="header_nav_group">
            <button
              onClick={onLoginAsStudent}
              className="text-neutral-600 hover:text-[#005A8D] transition-all font-bold"
              id="link_student_login"
            >
              Student Portal
            </button>
            <button
              onClick={onLoginAsAdmin}
              className="text-neutral-500 hover:text-neutral-800 transition-all font-medium"
              id="link_admin_login"
            >
              Institution Node
            </button>
            <button
              onClick={onStartRegistration}
              className="bg-[#005A8D] hover:bg-[#003B5C] text-white px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1 active:scale-95 text-xs font-extrabold uppercase tracking-wider"
              id="btn_get_started"
            >
              Apply Now
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#001F3F] text-white py-24 px-6 border-b border-slate-800 relative" id="hero_section">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10" id="hero_content_wrapper">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7FB3D5]/10 text-[#7FB3D5] font-sans text-[11px] font-bold border border-[#7FB3D5]/20 rounded-full mb-6" id="hero_badge">
              <Sparkles className="w-3.5 h-3.5 text-[#7FB3D5]" />
              POPIA Compliant Verification Network
            </div>

            <h1 className="text-4xl md:text-5.5xl font-black tracking-tight text-white mb-6 leading-tight max-w-3xl" id="hero_heading">
              Secure Alignment for <span className="text-[#7FB3D5] underline decoration-[#7FB3D5]/40 underline-offset-4">Missing Middle</span> South African Students
            </h1>

            <p className="text-slate-305 text-slate-300 text-sm md:text-base max-w-2xl mb-10 leading-relaxed font-sans" id="hero_description">
              Tired of endless bursary applications only to find you don't match the criteria? BursaryBridge instantly verifies your university enrollment, course metrics, and GPA to map you with private corporate funds inside your isolated institution workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto" id="hero_cta_buttons">
              <button
                onClick={onStartRegistration}
                className="bg-[#005A8D] hover:bg-[#003B5C] text-white font-extrabold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider"
                id="btn_hero_register"
              >
                Register & Verify Eligibility
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLoginAsStudent}
                className="border border-white/25 hover:bg-white/5 text-gray-200 px-8 py-3.5 rounded-xl font-bold transition-all text-xs uppercase tracking-wider"
                id="btn_hero_login"
              >
                Sign In to Student Portal
              </button>
            </div>
          </div>
        </section>

        {/* Eligibility Snapshot Card Panel */}
        <section className="py-20 px-6 max-w-7xl mx-auto" id="eligibility_snapshot">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#005A8D] bg-[#7FB3D5]/10 px-2.5 py-1 rounded">Eligibility Criteria</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">Who Is Eligible to Apply?</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">Verify your compliance with general sponsor baselines before onboarding.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
            {/* 1 */}
            <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="snapshot_card_1">
              <div>
                <CheckCircle className="w-5 h-5 text-[#005A8D] mb-4" />
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mb-1">South African Citizens</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Applicants must hold a valid 13-digit South African National Identity Number (SA ID) for secure automated verification.
                </p>
              </div>
              <span className="text-[10px] text-[#005A8D] font-bold mt-4 font-mono">ID Check Required</span>
            </div>

            {/* 2 */}
            <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="snapshot_card_2">
              <div>
                <CheckCircle className="w-5 h-5 text-[#005A8D] mb-4" />
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mb-1">Bursary GPA Limit</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Active tertiary students maintaining a cumulative academic average or matric score of 65% GPA and above.
                </p>
              </div>
              <span className="text-[10px] text-[#005A8D] font-bold mt-4 font-mono">Average &ge; 65% Minimum</span>
            </div>

            {/* 3 */}
            <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="snapshot_card_3">
              <div>
                <CheckCircle className="w-5 h-5 text-[#005A8D] mb-4" />
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mb-1">Financial Classification</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Targeted at unfunded, partially funded, or "missing middle" household groups struggling with commercial tuition loans.
                </p>
              </div>
              <span className="text-[10px] text-[#005A8D] font-bold mt-4 font-mono font-bold">Aid Isolation Focus</span>
            </div>

            {/* 4 */}
            <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="snapshot_card_4">
              <div>
                <CheckCircle className="w-5 h-5 text-[#005A8D] mb-4" />
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mb-1">Email Domain Lock</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Must possess an official active student email address from a supported university (e.g., UCT, DUT, WITS, UKZN).
                </p>
              </div>
              <span className="text-[10px] text-[#005A8D] font-bold mt-4 font-mono">Workspace Sync Lock</span>
            </div>
          </div>
        </section>

        {/* Dynamic Part: Trusted Sponsors Section */}
        <section className="bg-white py-20 px-6 border-y border-gray-100" id="trusted_sponsors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[10px] text-[#005A8D] font-extrabold uppercase tracking-widest bg-[#7FB3D5]/10 px-2.5 py-1 rounded block mb-2 w-max mx-auto">Sponsors & Sponsors</span>
              <h2 className="text-2xl font-black text-slate-900">Our Partnered Corporate Sponsors</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">Entities actively distributing funds, reviewing qualifiers, and tracking allocations.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4" id="sponsors_grid">
              {sponsors.map((sponsor, i) => (
                <div
                  key={sponsor.id}
                  className="bg-[#EAEDED]/30 border border-slate-200 p-5 rounded-xl text-center flex flex-col justify-center items-center gap-1 hover:border-[#005A8D]/45 hover:scale-[1.01] hover:bg-white transition-all h-28 cursor-pointer shadow-sm"
                  id={`sponsor_card_${i}`}
                >
                  <Award className="w-5 h-5 text-[#005A8D]" />
                  <div className="font-extrabold text-slate-900 text-xs tracking-tight">{sponsor.name}</div>
                  <div className="text-[9px] text-[#005A8D] font-black uppercase tracking-wider leading-none mt-1 bg-[#7FB3D5]/10 px-1.5 py-0.5 rounded">{sponsor.focus}</div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase mt-1">{sponsor.quota}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Universities Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto" id="partner_universities">
          <div className="text-center mb-12">
            <span className="text-[10px] text-slate-400 font-extrabold tracking-widest block uppercase">Support Footprint</span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Partnered South African Universities</h2>
            <p className="text-xs text-slate-500 mt-2">Fully configured multi-tenant domain boundaries restricting unauthorised data traversal.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 font-sans text-center" id="universities_grid">
            {institutions.map((inst, i) => (
              <div
                key={inst.id}
                className="bg-white border border-gray-200/80 p-5 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-[#005A8D]/30 transition-all h-24 shadow-sm"
                id={`univ_card_${i}`}
              >
                <div className="text-xs font-black text-[#005A8D] uppercase font-mono bg-[#7FB3D5]/15 px-2 py-0.5 rounded">
                  {inst.id}
                </div>
                <div className="font-extrabold text-slate-800 text-xs truncate max-w-full">{inst.name}</div>
                <div className="text-[9px] text-slate-400 font-medium">{inst.location}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modern SaaS Footer */}
      <footer className="bg-[#001F3F] text-slate-400 border-t border-slate-800 py-12 px-6 mt-auto" id="footer_section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8 mb-8 font-sans">
          <div>
            <div className="flex items-center gap-2 text-white">
              <span className="font-black text-lg tracking-tight">Bursary<span className="text-[#7FB3D5]">Bridge</span></span>
              <span className="bg-[#003B5C] text-gray-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase font-mono">POPIA Compliant</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
              Standard secure enrollment platform. Mapping missing middle and unallocated South African graduates with high-integrity corporate bursary awards.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-bold text-slate-300" id="footer_links">
            <button onClick={onViewPolicies} className="hover:text-white transition-colors uppercase tracking-wider font-extrabold text-[#7FB3D5]" id="footer_policy_btn">
              Terms &amp; Disclaimers (Ts &amp; Cs)
            </button>
            <span className="text-slate-700">|</span>
            <button onClick={onViewPolicies} className="hover:text-white transition-colors uppercase tracking-wider font-bold">
              POPIA Compliance Guidelines
            </button>
            <span className="text-slate-700">|</span>
            <button onClick={onStartRegistration} className="hover:text-white transition-colors uppercase tracking-wider">
              Verify Account
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-medium font-sans">
          <span>&copy; 2026 National Student Bursary Alliance. Registered B2B SaaS Network. All rights reserved.</span>
          <span className="text-slate-600">Database Cluster ID: BR-991A5 (Multi-Tenant Secure Partition)</span>
        </div>
      </footer>
    </div>
  );
}
