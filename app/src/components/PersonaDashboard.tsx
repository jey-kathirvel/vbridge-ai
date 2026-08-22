"use client";

import { useMemo, useState } from "react";

import type { VBridgePersona } from "@/types/persona";

interface PersonaDashboardProps {
  personas: VBridgePersona[];
}

const stakeholderLabels: Record<
  VBridgePersona["stakeholderType"],
  string
> = {
  BUSINESS_USER: "Business User",
  MSME: "MSME",
  STARTUP: "Startup",
  INVESTOR: "Investor",
  PARTNER: "Partner",
  MENTOR: "Mentor",
  SERVICE_PROVIDER: "Service Provider",
};

const featureCards = [
  {
    key: "matchmaking",
    eyebrow: "Strategic Connections",
    title: "AI Matchmaking",
    description:
      "Discover and rank relevant partners, buyers, investors and ecosystem stakeholders.",
    icon: "↗",
  },
  {
    key: "investmentReadiness",
    eyebrow: "Capital & Investment",
    title: "AI Investment Readiness",
    description:
      "Assess funding preparedness, traction signals and investor alignment.",
    icon: "◇",
  },
  {
    key: "leadGeneration",
    eyebrow: "Global Market Access",
    title: "AI Lead Generation",
    description:
      "Research targeted organizations and decision-makers through Apollo.io.",
    icon: "◎",
  },
  {
    key: "eventsAndNews",
    eyebrow: "Insights & Intelligence",
    title: "AI Events & News",
    description:
      "Surface relevant market news, events and global opportunity signals.",
    icon: "◈",
  },
] as const;

const navItems = [
  "Overview",
  "AI Workflows",
  "Opportunities",
  "Research",
];

export default function PersonaDashboard({
  personas,
}: PersonaDashboardProps) {
  const [selectedId, setSelectedId] = useState(
    personas[0]?.id ?? "",
  );

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const selectedPersona = useMemo(
    () =>
      personas.find(
        (persona) => persona.id === selectedId,
      ) ?? personas[0],
    [personas, selectedId],
  );

  if (!selectedPersona) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h1 className="text-3xl font-bold text-slate-950">
            V-BRIDGE AI LAB
          </h1>
          <p className="mt-4 text-slate-500">
            No synthetic personas are available.
          </p>
        </div>
      </main>
    );
  }

  const location = [
    selectedPersona.profile.location.city,
    selectedPersona.profile.location.stateOrRegion,
    selectedPersona.profile.location.country,
  ].join(", ");

  const enabledWorkflowCount = featureCards.filter(
    (feature) =>
      selectedPersona.aiResearch[feature.key].enabled,
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-7 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((value) => !value)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? "×" : "☰"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b4ea2] text-lg font-black text-white shadow-sm">
                V
              </div>

              <div>
                <p className="text-[15px] font-extrabold tracking-[0.04em] text-[#12315b]">
                  V-BRIDGE
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#1f73d2]">
                  AI Lab
                </p>
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item, index) => (
              <button
                key={item}
                type="button"
                className={
                  index === 0
                    ? "text-sm font-semibold text-[#0b4ea2]"
                    : "text-sm font-medium text-slate-600 transition hover:text-[#0b4ea2]"
                }
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0b4ea2]">
              V Strat Team
            </span>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0b4ea2]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#eef6ff] via-white to-[#f4f8fd]">
        <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -left-28 bottom-0 h-[320px] w-[320px] rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-7 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#1f73d2]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0b4ea2]">
                AI Driven Business Intelligence
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-[-0.04em] text-[#102f55] sm:text-5xl lg:text-[58px] lg:leading-[1.06]">
              Connect to Global
              <span className="block text-[#1769c2]">
                Opportunities with AI
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Research strategic matches, investment readiness,
              global leads, events and market intelligence for
              V-Bridge stakeholders.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-lg bg-[#0b4ea2] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10">
                Explore AI Workflows
              </span>

              <span className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
                Synthetic Research Lab
              </span>
            </div>
          </div>

          <div className="self-center rounded-[26px] border border-white bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,55,100,0.12)] backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f73d2]">
              Acting As
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#12315b]">
              Select V-Bridge Stakeholder
            </h2>

            <div className="relative mt-5">
              <select
                id="persona"
                value={selectedPersona.id}
                onChange={(event) =>
                  setSelectedId(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3.5 pr-10 text-sm font-semibold text-[#12315b] outline-none transition focus:border-[#1f73d2] focus:ring-4 focus:ring-blue-100"
              >
                {personas.map((persona) => (
                  <option
                    key={persona.id}
                    value={persona.id}
                  >
                    {stakeholderLabels[
                      persona.stakeholderType
                    ]}
                    {" — "}
                    {persona.profile.organizationName}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#1f73d2]">
                ▼
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Stakeholder
                </p>
                <p className="mt-2 text-sm font-bold text-[#0b4ea2]">
                  {
                    stakeholderLabels[
                      selectedPersona.stakeholderType
                    ]
                  }
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  AI Workflows
                </p>
                <p className="mt-2 text-sm font-bold text-[#0b4ea2]">
                  {enabledWorkflowCount} Enabled
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 sm:px-7 md:grid-cols-4 lg:px-10">
          {[
            ["7", "Stakeholder Personas"],
            ["4", "AI Capabilities"],
            [
              String(
                selectedPersona.business.targetMarkets
                  .length,
              ),
              "Target Markets",
            ],
            ["1", "Unified AI Lab"],
          ].map(([value, label], index) => (
            <div
              key={label}
              className={
                index < 3
                  ? "border-r border-slate-200 px-4 py-7 text-center"
                  : "px-4 py-7 text-center"
              }
            >
              <p className="text-2xl font-extrabold text-[#0b4ea2]">
                {value}
                <span className="text-[#42a5e8]">+</span>
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-7 lg:px-10 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0b4ea2]">
                {
                  stakeholderLabels[
                    selectedPersona.stakeholderType
                  ]
                }
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">
                {selectedPersona.id}
              </span>
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f73d2]">
              Active Organization
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#12315b] sm:text-4xl">
              {selectedPersona.profile.organizationName}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {selectedPersona.profile.industry}
              <span className="mx-2 text-blue-300">
                /
              </span>
              {selectedPersona.profile.subIndustry}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {location}
            </p>

            <div className="mt-7 rounded-2xl border border-blue-100 bg-[#f4f9ff] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1f73d2]">
                Primary Growth Objective
              </p>
              <p className="mt-2 text-base font-medium leading-7 text-[#24466d]">
                {selectedPersona.goals.primaryGoal}
              </p>
            </div>
          </article>

          <aside className="rounded-[24px] bg-[#12315b] p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
              Business Passport
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              Persona Snapshot
            </h3>

            <dl className="mt-7 space-y-5">
              <div className="border-b border-white/10 pb-4">
                <dt className="text-xs text-blue-200/70">
                  Profile Owner
                </dt>
                <dd className="mt-1.5 font-semibold">
                  {selectedPersona.profile.displayName}
                </dd>
              </div>

              <div className="border-b border-white/10 pb-4">
                <dt className="text-xs text-blue-200/70">
                  Business Stage
                </dt>
                <dd className="mt-1.5 font-semibold">
                  {selectedPersona.business.stage}
                </dd>
              </div>

              <div className="border-b border-white/10 pb-4">
                <dt className="text-xs text-blue-200/70">
                  Team Size
                </dt>
                <dd className="mt-1.5 font-semibold">
                  {selectedPersona.business.employeeCount}
                  {" employees"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-blue-200/70">
                  Current Market
                </dt>
                <dd className="mt-1.5 font-semibold">
                  {selectedPersona.business.currentMarkets.join(
                    ", ",
                  )}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-7 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1f73d2]">
              Integrated Platform Solutions
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#12315b] sm:text-4xl">
              Four AI capabilities for
              <span className="text-[#1769c2]">
                {" "}business growth
              </span>
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Persona-aware intelligence workflows designed
              for global opportunity discovery and strategic
              decision support.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const workflow =
                selectedPersona.aiResearch[feature.key];

              return (
                <article
                  key={feature.key}
                  className="group flex min-h-[330px] flex-col rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(20,55,90,0.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(20,75,145,0.12)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf6ff] text-xl font-bold text-[#0b4ea2]">
                      {feature.icon}
                    </div>

                    <span
                      className={
                        workflow.enabled
                          ? "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700"
                          : "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400"
                      }
                    >
                      {workflow.enabled
                        ? "Ready"
                        : "N/A"}
                    </span>
                  </div>

                  <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.18em] text-[#1f73d2]">
                    {feature.eyebrow}
                  </p>

                  <h3 className="mt-2 text-lg font-extrabold text-[#12315b]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <button
                    type="button"
                    disabled={!workflow.enabled}
                    className="mt-5 flex w-full items-center justify-between rounded-xl border border-blue-100 bg-[#f4f9ff] px-4 py-3 text-xs font-bold text-[#0b4ea2] transition enabled:hover:border-[#1f73d2] enabled:hover:bg-[#0b4ea2] enabled:hover:text-white disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <span>
                      {workflow.enabled
                        ? "Open Research"
                        : "Unavailable"}
                    </span>
                    <span>
                      {workflow.enabled ? "→" : "—"}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-7 lg:px-10 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f73d2]">
              Global Market Access
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-[#12315b]">
              Target Markets
            </h3>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPersona.business.targetMarkets.map(
                (market) => (
                  <span
                    key={market}
                    className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0b4ea2]"
                  >
                    {market}
                  </span>
                ),
              )}
            </div>
          </article>

          <article className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f73d2]">
              Business Portfolio
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-[#12315b]">
              Products & Services
            </h3>

            <ul className="mt-5 space-y-3">
              {selectedPersona.business.productsOrServices.map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f73d2]" />
                    <span>{item}</span>
                  </li>
                ),
              )}
            </ul>
          </article>

          <article className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f73d2]">
              Strategic Partnerships
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-[#12315b]">
              Growth Objectives
            </h3>

            <ul className="mt-5 space-y-3">
              {selectedPersona.goals.secondaryGoals.map(
                (goal) => (
                  <li
                    key={goal}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#42a5e8]" />
                    <span>{goal}</span>
                  </li>
                ),
              )}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-[#12315b]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-10 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
              V-BRIDGE AI LAB
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Connecting Indian MSMEs & Startups
              to Global Opportunities
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#12315b]">
              V Strat Team
            </span>
            <span className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white">
              Synthetic Research Environment
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-7 text-xs text-slate-500 sm:px-7 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>
            © 2026 V Strat Team · V-BRIDGE AI LAB
          </p>
          <p>
            AI research and integration environment
          </p>
        </div>
      </footer>
    </main>
  );
}
