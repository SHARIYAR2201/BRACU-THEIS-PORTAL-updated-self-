import React from "react";
import { GraduationCap, Users, FileText, Landmark, ClipboardList, Gavel } from "lucide-react";

const Row = ({ label, value }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    <td className="py-3 pr-4 font-medium">{label}</td>
    <td className="py-3">{value}</td>
  </tr>
);

const ThesisProcess = () => {
  return (
    <main className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="container mx-auto px-6 py-12 grid gap-10 lg:grid-cols-[1fr_280px]">
        {/* Content */}
        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              BRACU CSE Thesis Process & Guidelines
            </h1>
          </header>

          {/* Quick TOC (mobile) */}
          <nav className="md:hidden mb-8">
            <ul className="space-y-2 text-sm">
              <li><a href="#start" className="text-[#7b1e3c] hover:underline">Requirements to Start</a></li>
              <li><a href="#policies" className="text-[#7b1e3c] hover:underline">General Policies</a></li>
              <li><a href="#marking" className="text-[#7b1e3c] hover:underline">Marking Criteria</a></li>
              <li><a href="#reports" className="text-[#7b1e3c] hover:underline">Reports</a></li>
              <li><a href="#penalties" className="text-[#7b1e3c] hover:underline">Penalties</a></li>
              <li><a href="#notes" className="text-[#7b1e3c] hover:underline">Internship Notes</a></li>
            </ul>
          </nav>

          {/* Requirements */}
          <section id="start" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="w-6 h-6 text-[#7b1e3c]" />
              <h2 className="text-2xl font-semibold">Requirements to Start Thesis / Project / Internship</h2>
            </div>
            <p className="text-slate-700 dark:text-gray-300 mb-4">
              Each member must individually satisfy the criteria below and register for Pre-Thesis 1 via the department’s Google Form. Effective for groups registering from Fall 2022.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm md:text-base">
                <tbody className="[&>tr>td]:align-top [&>tr>td]:px-4">
                  <Row label="Minimum Credits" value="75" />
                  <Row label="CGPA & Eligibility" value={
                    <ul className="list-disc pl-5 space-y-1">
                      <li>CGPA &lt; 2.0 → Not eligible</li>
                      <li>CGPA ≥ 2.0 → Eligible for Project/Internship</li>
                      <li>CGPA ≥ 3.0 → Eligible for Thesis/Project/Internship</li>
                    </ul>
                  } />
                  <Row label="Group Size" value="Min 1, Max 5 (Internship: Max 1)" />
                  <Row label="Supervisor Count" value="Up to 2 supervisors and 2 co-supervisors per group" />
                </tbody>
              </table>
            </div>
          </section>

          {/* General Policies */}
          <section id="policies" className="mt-12 scroll-mt-24">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-[#7b1e3c]" />
              <h2 className="text-2xl font-semibold">General Policies</h2>
            </div>
            <ol className="space-y-3 text-slate-700 dark:text-gray-300 list-decimal pl-5">
              <li>At most two supervisors and two co-supervisors are allowed per group.</li>
              <li>Students in the final thesis/project/internship phase may take a maximum of 3 additional courses with CSE400. Exceptional cases may petition.</li>
              <li>Pre-Thesis I and Pre-Thesis II must be completed before appearing at the thesis defense.</li>
              <li>Supervisors must submit the list of groups they approve for final defense two weeks before the report submission deadline.</li>
              <li>If a group fails to convince examiners in any of the three phases (Pre-Thesis I, Pre-Thesis II, Final Defense), that phase is considered incomplete; supervisor marks alone are not sufficient to obtain a CSE400 grade.</li>
              <li>Every thesis group must submit a camera-ready IEEE-style article with the final report. Readiness for submission carries 5% marks; this 5% is only awarded to articles already submitted to a conference or journal.</li>
              <li>Each level (Pre-Thesis 1, Pre-Thesis 2, Final Thesis) spans one semester (see internship notes for timing differences).</li>
            </ol>
          </section>

          {/* Marking Criteria */}
          <section id="marking" className="mt-12 scroll-mt-24">
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="w-6 h-6 text-[#7b1e3c]" />
              <h2 className="text-2xl font-semibold">Marking Criteria</h2>
            </div>
            <p className="text-slate-700 dark:text-gray-300">
              The detailed rubrics are maintained by the department. A group needs at least <strong>60%</strong> in Pre-Thesis 1 and 2 to be promoted to the next stage.{" "}
              <a
                className="text-[#7b1e3c] underline decoration-2 underline-offset-4"
                href="https://docs.google.com/spreadsheets/d/1PnvmE6MaldPadO8S5bjHajgxZTfdZEz4/edit?gid=384748274#gid=384748274"
                target="_blank"
                rel="noreferrer"
              >
                View Marking Rubrics (Google Sheet)
              </a>
              .
            </p>
          </section>

          {/* Reports */}
          <section id="reports" className="mt-12 scroll-mt-24">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-[#7b1e3c]" />
              <h2 className="text-2xl font-semibold">Reports</h2>
            </div>
            <ul className="space-y-2 text-slate-700 dark:text-gray-300 list-disc pl-5">
              <li>All reports must have plagiarism ≤ <strong>15%</strong> (Turnitin). Email <a className="text-[#7b1e3c]" href="mailto:librarian@bracu.ac.bd">librarian@bracu.ac.bd</a> or consult your supervisor.</li>
              <li>Submit the <strong>AI report</strong> generated from Turnitin along with the plagiarism report.</li>
              <li>All reports must be submitted within the semester’s declared deadlines.</li>
            </ul>
          </section>

          {/* Penalties */}
          <section id="penalties" className="mt-12 scroll-mt-24">
            <div className="flex items-center gap-3 mb-3">
              <Gavel className="w-6 h-6 text-[#7b1e3c]" />
              <h2 className="text-2xl font-semibold">Penalties</h2>
            </div>

            <p className="text-slate-700 dark:text-gray-300 mb-4">
              The following actions incur mark deductions (affect all group members unless noted).
            </p>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr className="text-left">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Deduction</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-3 px-4">Break/Division of a group</td>
                    <td className="py-3 px-4">Pre-Thesis 1: −2; Pre-Thesis 2: −3; Final Defense: −5</td>
                    <td className="py-3 px-4">Affects all members</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Adding new members after Pre-Thesis 1 registration</td>
                    <td className="py-3 px-4">−2</td>
                    <td className="py-3 px-4">May be waived in certain cases</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Information update / deferring after deadline</td>
                    <td className="py-3 px-4">−1 per change</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Thesis title/abstract update</td>
                    <td className="py-3 px-4">First change: 0; Afterwards: −1 per change</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Mismatch of title/abstract (database vs submitted report)</td>
                    <td className="py-3 px-4">−2</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Absent in Final Defense after NOT deferring</td>
                    <td className="py-3 px-4">−5</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Absent in Pre-Thesis 1 or 2 after NOT deferring</td>
                    <td className="py-3 px-4">−2</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Internship notes */}
          <section id="notes" className="mt-12 scroll-mt-24">
            <div className="flex items-center gap-3 mb-3">
              <Landmark className="w-6 h-6 text-[#7b1e3c]" />
              <h2 className="text-2xl font-semibold">Internship Notes</h2>
            </div>
            <ul className="space-y-2 text-slate-700 dark:text-gray-300 list-disc pl-5">
              <li>Internship group size: maximum 1 student.</li>
              <li>Apply to the CSE Chairperson. Use an approved company list; special cases may propose another company with a detailed profile for approval.</li>
              <li>An internal faculty member will be assigned as internship supervisor/co-supervisor.</li>
              <li>Timing: Each level (Pre-1, Pre-2, Final Thesis) is one semester. Overall duration is ~1 year. Within six months after the internship ends, submit Pre-2. In the Final Thesis semester, develop a project based on what you learned and defend it on time (email for queries: <a className="text-[#7b1e3c]" href="mailto:rabiul.alam@bracu.ac.bd">rabiul.alam@bracu.ac.bd</a>).</li>
            </ul>
          </section>

          {/* Back / top */}
          <div className="mt-12 flex flex-wrap gap-3">
            <a href="/" className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
              ← Back to Home
            </a>
            <a href="#start" className="px-5 py-2.5 rounded-lg bg-[#7b1e3c] text-white hover:bg-[#651730] transition">
              Back to Top
            </a>
          </div>
        </article>

        {/* Sticky Sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-24 h-max">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm font-semibold mb-3">On this page</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#start" className="text-[#7b1e3c] hover:underline">Requirements to Start</a></li>
              <li><a href="#policies" className="text-[#7b1e3c] hover:underline">General Policies</a></li>
              <li><a href="#marking" className="text-[#7b1e3c] hover:underline">Marking Criteria</a></li>
              <li><a href="#reports" className="text-[#7b1e3c] hover:underline">Reports</a></li>
              <li><a href="#penalties" className="text-[#7b1e3c] hover:underline">Penalties</a></li>
              <li><a href="#notes" className="text-[#7b1e3c] hover:underline">Internship Notes</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default ThesisProcess;