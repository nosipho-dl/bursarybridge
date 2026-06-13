/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GraduationCap, ArrowRight, UserCheck, ShieldCheck, Award, FileSpreadsheet } from "lucide-react";

interface LandingPageProps {
  onStartRegistration: () => void;
  onLoginAsStudent: () => void;
  onLoginAsAdmin: () => void;
  institutions: Array<{ id: string; name: string; location: string }>;
}

export default function LandingPage({
  onStartRegistration,
  onLoginAsStudent,
  onLoginAsAdmin,
  institutions
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-outline-variant/30 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-secondary-container" />
            </div>
            <span className="font-headline text-headline-lg font-bold text-primary tracking-tight">
              Bursary<span className="text-secondary-fixed opacity-90">Bridge</span>
            </span>
          </div>

          <div className="flex items-center gap-6 font-hanken">
            <button
              onClick={onLoginAsStudent}
              className="text-primary font-bold text-sm tracking-wide hover:text-secondary hover:underline underline-offset-4 transition-all"
            >
              Student Portal
            </button>
            <button
              onClick={onLoginAsAdmin}
              className="text-on-surface-variant font-medium text-sm tracking-wide hover:text-primary transition-all"
            >
              Institution Portal
            </button>
            <button
              onClick={onStartRegistration}
              className="bg-secondary-container text-on-secondary-container font-extrabold px-5 py-2 rounded-lg text-sm tracking-wide shadow-sm hover:shadow-md hover:bg-secondary transition-all active:scale-95 duration-150"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary-container to-primary text-white py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {/* Grid background effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-secondary-fixed font-hanken text-label-sm border border-white/20 mb-6 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              South African missing middle & unfunded student bursary portal
            </div>

            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-3xl">
              Find bursaries you <span className="text-secondary-container underline decoration-wavy decoration-2 underline-offset-8">actually qualification match</span> for.
            </h1>

            <p className="font-sans text-body-lg text-primary-fixed-dim max-w-2xl mb-10 leading-relaxed opacity-95">
              Tired of endless forms only to discover you don't qualify? BursaryBridge auto-matches your GPA and faculty profile against exclusive university-specific corporate sponsorships. No hidden fees. Fully POPIA compliant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 font-hanken">
              <button
                onClick={onStartRegistration}
                className="bg-secondary-container text-primary font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-secondary-fixed hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 duration-150 text-base"
              >
                Launch Eligibility Check
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLoginAsStudent}
                className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all"
              >
                Access My Profile
              </button>
            </div>

            {/* Quick stats banner */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 mt-16 max-w-2xl border-t border-white/10 pt-8 w-full font-hanken">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-secondary-container">R412M+</div>
                <div className="text-[11px] uppercase tracking-wider text-primary-fixed-dim mt-1">Disbursed Funds</div>
              </div>
              <div className="text-center border-x border-white/10 px-4">
                <div className="text-3xl font-extrabold text-secondary-container">94%</div>
                <div className="text-[11px] uppercase tracking-wider text-primary-fixed-dim mt-1">Average Match Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-secondary-container">24 Hour</div>
                <div className="text-[11px] uppercase tracking-wider text-primary-fixed-dim mt-1">Status Turnaround</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Explainer Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block font-hanken">How it works</span>
            <h2 className="font-headline text-headline-lg text-primary font-bold">Bridging the gap to tertiary funding in 3 steps</h2>
            <p className="text-on-surface-variant font-sans max-w-xl mx-auto mt-2 text-body-md">
              Securely register, visual check academic benchmarks live, and submit documents straight to sponsoring corporate boards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative font-hanken">
            {/* Step 1 */}
            <div className="bg-white border border-outline-variant/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary font-extrabold text-lg mb-6">
                1
              </div>
              <h3 className="font-headline text-xl font-bold text-primary mb-3">Register Student profile</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-sans">
                Enter your basic details. Suffix email domain verification automatically locks your profile to your registered institution (e.g. UCT, DUT, Wits), satisfying strict multi-tenant boundary checks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-outline-variant/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary font-extrabold text-lg mb-6">
                2
              </div>
              <h3 className="font-headline text-xl font-bold text-primary mb-3">Visual Academic Live Match</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-sans">
                Type your active academic GPA. Our micro-match engine updates eligibility tiers (Tier 1-3) real-time, instantly displaying matching sponsors with transparency.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-outline-variant/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary font-extrabold text-lg mb-6">
                3
              </div>
              <h3 className="font-headline text-xl font-bold text-primary mb-3">Apply Safely</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-sans">
                Upload required secure documents (e.g. ID copies, current student transcripts) using our smart checklist. Submit straight to institutional reviews in a tap.
              </p>
            </div>
          </div>
        </section>

        {/* Missing Middle Focus Callout Banner */}
        <section className="bg-surface-container py-16 px-6 border-y border-outline-variant/30">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 bg-white p-8 md:p-12 rounded-3xl border border-outline-variant shadow-sm">
            <div className="flex-grow">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E8F0FE] text-primary font-hanken text-label-sm font-bold mb-4">
                <UserCheck className="w-4 h-4 text-[#1A73E8]" />
                Dedicated Missing Middle Support
              </div>
              <h3 className="font-headline text-2xl md:text-3xl font-bold text-primary mb-4">
                What does missing middle mean?
              </h3>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed font-sans max-w-2xl">
                Many South African family profiles fall just average of NSFAS support income caps, leaving hard-working students with zero tertiary aid. Symmetrically, corporate sponsors look for eligible candidates. BursaryBridge acts as the high-integrity digital gateway linking both parties.
              </p>
            </div>
          </div>
        </section>

        {/* Sponsoring / Partner Institutions Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00875A] font-hanken block mb-2">Our university partners</span>
            <h2 className="font-headline text-2xl font-bold text-primary">Serving South Africa's leading institutions</h2>
            <p className="text-on-surface-variant text-sm mt-1">Multi-tenant boundary guarantees complete data isolation between workspaces.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center justify-center text-center font-hanken">
            {institutions.map((inst) => (
              <div
                key={inst.id}
                className="p-6 bg-white border border-outline-variant/50 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all text-primary font-bold text-xs flex flex-col items-center justify-center gap-2 h-28"
              >
                <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-xs text-primary">
                  {inst.id.toUpperCase()}
                </div>
                <div className="font-extrabold tracking-tight leading-tight">{inst.name}</div>
                <div className="text-[10px] text-on-surface-variant font-medium font-sans">{inst.location}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8 mb-8 font-hanken">
          <div>
            <span className="text-headline-lg font-bold text-secondary-fixed">BursaryBridge</span>
            <p className="text-xs text-primary-fixed-dim mt-2 max-w-sm font-sans leading-relaxed">
              Empowering unfunded and missing-middle university students across South Africa with standard digital-first bursary access.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-primary-fixed-dim font-sans">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
            <button className="hover:text-white transition-colors">Compliance (POPIA)</button>
            <button className="hover:text-white transition-colors">Institutional Support</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center md:text-left text-xs text-white/50">
          &copy; 2026 BursaryBridge. Standard Government & Enterprise Partners Workspace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
