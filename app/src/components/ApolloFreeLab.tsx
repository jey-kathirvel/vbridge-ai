"use client";

import { FormEvent, useMemo, useState } from "react";

type Operation =
  | "people-search"
  | "contacts-search"
  | "accounts-search"
  | "users"
  | "api-usage"
  | "credit-usage";

type FormState = {
  personTitles: string;
  personSeniorities: string;
  personLocations: string;
  organizationLocations: string;
  keywords: string;
  organizationName: string;
  page: string;
  perPage: string;
};

const defaults: Record<Operation, Partial<FormState>> = {
  "people-search": {
    personTitles: "Founder, Co-Founder, CEO",
    personSeniorities: "founder, c_suite",
    personLocations: "Chennai, Tamil Nadu, India",
    organizationLocations: "Chennai, Tamil Nadu, India",
    keywords: "SaaS software technology",
    page: "1",
    perPage: "10",
  },
  "contacts-search": {
    keywords: "Founder",
    page: "1",
    perPage: "10",
  },
  "accounts-search": {
    organizationName: "technology",
    page: "1",
    perPage: "10",
  },
  users: {
    page: "1",
    perPage: "10",
  },
  "api-usage": {},
  "credit-usage": {},
};

const operations: Array<{
  id: Operation;
  title: string;
  subtitle: string;
  description: string;
}> = [
  {
    id: "people-search",
    title: "People Search",
    subtitle: "Net-new prospects",
    description:
      "Search Apollo's people database using titles, seniority, location and keywords. This search does not reveal email or phone numbers.",
  },
  {
    id: "contacts-search",
    title: "Saved Contacts",
    subtitle: "Your Apollo workspace",
    description:
      "Search people already saved as contacts in the configured Apollo workspace.",
  },
  {
    id: "accounts-search",
    title: "Saved Accounts",
    subtitle: "Saved companies",
    description:
      "Search companies already saved as accounts in the configured Apollo workspace.",
  },
  {
    id: "users",
    title: "Apollo Users",
    subtitle: "Workspace users",
    description:
      "Retrieve users who have access to the configured Apollo workspace.",
  },
  {
    id: "api-usage",
    title: "API Usage",
    subtitle: "Rate-limit visibility",
    description:
      "View API usage and rate-limit information reported by Apollo for the workspace.",
  },
  {
    id: "credit-usage",
    title: "Credit Usage",
    subtitle: "Credit safety",
    description:
      "View current Apollo credit limits, consumed credits and remaining balances.",
  },
];

function Field({
  label,
  value,
  onChange,
  help,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
  placeholder?: string;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
        {label}
        <span
          title={help}
          aria-label={`${label} help: ${help}`}
          className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[11px] font-black text-blue-700"
        >
          ?
        </span>
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      <span className="mt-2 block text-xs leading-5 text-slate-500">
        {help}
      </span>
    </label>
  );
}

export default function ApolloFreeLab() {
  const [operation, setOperation] = useState<Operation>("people-search");
  const [form, setForm] = useState<FormState>({
    personTitles: defaults["people-search"].personTitles ?? "",
    personSeniorities: defaults["people-search"].personSeniorities ?? "",
    personLocations: defaults["people-search"].personLocations ?? "",
    organizationLocations:
      defaults["people-search"].organizationLocations ?? "",
    keywords: defaults["people-search"].keywords ?? "",
    organizationName: "",
    page: "1",
    perPage: "10",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);

  const active = useMemo(
    () => operations.find((item) => item.id === operation)!,
    [operation],
  );

  function chooseOperation(next: Operation) {
    setOperation(next);
    setResponse(null);
    setHttpStatus(null);
    const sample = defaults[next];
    setForm((current) => ({
      ...current,
      personTitles: sample.personTitles ?? current.personTitles,
      personSeniorities:
        sample.personSeniorities ?? current.personSeniorities,
      personLocations:
        sample.personLocations ?? current.personLocations,
      organizationLocations:
        sample.organizationLocations ?? current.organizationLocations,
      keywords: sample.keywords ?? "",
      organizationName: sample.organizationName ?? "",
      page: sample.page ?? "1",
      perPage: sample.perPage ?? "10",
    }));
  }

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function run(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    setHttpStatus(null);

    try {
      const result = await fetch("/api/apollo/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation,
          payload: {
            ...form,
            page: Number(form.page || 1),
            perPage: Number(form.perPage || 10),
          },
        }),
      });

      setHttpStatus(result.status);
      const json = await result.json();
      setResponse(json);
    } catch {
      setHttpStatus(0);
      setResponse({
        ok: false,
        message: "The V-Bridge Apollo gateway could not be reached.",
      });
    } finally {
      setLoading(false);
    }
  }

  const noInputs = operation === "api-usage" || operation === "credit-usage";

  return (
    <main className="min-h-screen bg-[#f7f9fc] p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#0e3566] via-[#0b4ea2] to-[#1769c2] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                  V-Bridge Integration Lab
                </span>
                <span className="rounded-full bg-emerald-300/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Zero-credit endpoints
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Apollo.io Free API Samples
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
                Use guided sample inputs to understand what each Apollo API does before connecting real V-Bridge business data. The API key stays on the server and is never shown in this iframe.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-100">Safety mode</p>
              <p className="mt-1 text-lg font-extrabold">Read-only free APIs</p>
              <p className="mt-1 text-xs leading-5 text-blue-100">No email reveal · No phone reveal · No enrichment</p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[22px] border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-extrabold text-amber-950">How to use the test data</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            The values pre-filled below are only search criteria. For People Search, Apollo returns real matching prospect records from its database; V-Bridge is not inventing those results. For Saved Contacts and Saved Accounts, results come only from records already stored in your Apollo workspace. You can safely edit every sample field before running the request.
          </p>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[330px_1fr]">
          <aside className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-2 pb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Free API samples</p>
            <div className="space-y-2">
              {operations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseOperation(item.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    item.id === operation
                      ? "border-blue-200 bg-blue-50 shadow-sm"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs font-medium text-blue-700">{item.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">0 CREDIT</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Selected API</p>
                <h2 className="mt-2 text-2xl font-extrabold text-[#12315b]">{active.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{active.description}</p>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Apollo documented: 0 credits</span>
            </div>

            <form onSubmit={run} className="mt-6">
              {operation === "people-search" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Job titles"
                    value={form.personTitles}
                    onChange={(value) => setField("personTitles", value)}
                    help="Comma-separated job titles Apollo should match. Example: Founder, Co-Founder, CEO. More titles broaden the search."
                  />
                  <Field
                    label="Seniority"
                    value={form.personSeniorities}
                    onChange={(value) => setField("personSeniorities", value)}
                    help="Apollo seniority values such as founder, c_suite, owner, partner, vp, head, director, manager, senior or entry."
                  />
                  <Field
                    label="Person location"
                    value={form.personLocations}
                    onChange={(value) => setField("personLocations", value)}
                    help="Where the person lives. Use a city, state/region or country. Example: Chennai, Tamil Nadu, India."
                  />
                  <Field
                    label="Company headquarters location"
                    value={form.organizationLocations}
                    onChange={(value) => setField("organizationLocations", value)}
                    help="Where the person's current employer is headquartered. This is different from the person's own location."
                  />
                  <Field
                    label="Keywords"
                    value={form.keywords}
                    onChange={(value) => setField("keywords", value)}
                    help="Optional words used to narrow results. Keep them related to one search idea, for example SaaS software technology."
                  />
                  <Field
                    label="Results per page"
                    type="number"
                    value={form.perPage}
                    onChange={(value) => setField("perPage", value)}
                    help="How many records Apollo should return on this page. The lab caps this at 100; 10 is recommended while testing."
                  />
                </div>
              )}

              {operation === "contacts-search" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Contact keywords"
                    value={form.keywords}
                    onChange={(value) => setField("keywords", value)}
                    help="Search only contacts already saved in your Apollo workspace. Try a name, title, employer, company name or email keyword."
                  />
                  <Field
                    label="Results per page"
                    type="number"
                    value={form.perPage}
                    onChange={(value) => setField("perPage", value)}
                    help="Number of saved contacts to return on this page, from 1 to 100."
                  />
                </div>
              )}

              {operation === "accounts-search" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Company / account name"
                    value={form.organizationName}
                    onChange={(value) => setField("organizationName", value)}
                    help="Search only companies already saved as Apollo accounts. Enter part of the company name, for example technology."
                  />
                  <Field
                    label="Results per page"
                    type="number"
                    value={form.perPage}
                    onChange={(value) => setField("perPage", value)}
                    help="Number of saved accounts to return on this page, from 1 to 100."
                  />
                </div>
              )}

              {operation === "users" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Page number"
                    type="number"
                    value={form.page}
                    onChange={(value) => setField("page", value)}
                    help="Apollo paginates workspace users. Start with page 1."
                  />
                  <Field
                    label="Results per page"
                    type="number"
                    value={form.perPage}
                    onChange={(value) => setField("perPage", value)}
                    help="How many Apollo workspace users should be returned on the page."
                  />
                </div>
              )}

              {noInputs && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
                  No test input is needed for this endpoint. Click the button below and V-Bridge will request the current workspace statistics directly from Apollo.
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#0b4ea2] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#083d80] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Calling Apollo…" : `Run ${active.title}`}
                </button>
                <span className="text-xs leading-5 text-slate-500">
                  Request goes through V-Bridge server → Apollo. Your Apollo API key is never sent to the browser.
                </span>
              </div>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Response</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {httpStatus === null
                      ? "Run the sample to see the Apollo response."
                      : httpStatus === 0
                        ? "Gateway error"
                        : `HTTP ${httpStatus}`}
                  </p>
                </div>
                {httpStatus !== null && httpStatus >= 200 && httpStatus < 300 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">SUCCESS</span>
                )}
              </div>
              <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-slate-100">
                {response === null
                  ? "No response yet."
                  : JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
