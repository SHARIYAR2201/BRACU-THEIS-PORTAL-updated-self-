import React from "react";
import { GraduationCap, Users, FileText, FolderOpen, Landmark, PackageCheck } from "lucide-react";

const steps = [
  {
    icon: <GraduationCap className="w-8 h-8 text-[#7b1e3c]" />,
    title: "Eligibility & Team Formation",
    description:
      "Complete at least 75 credits. Form a group of 1–5 members with similar research interests."
  },
  {
    icon: <Users className="w-8 h-8 text-[#7b1e3c]" />,
    title: "Supervisor & Topic Selection",
    description:
      "Find a supervisor, discuss your ideas, and finalize a topic or research area."
  },
  {
    icon: <FileText className="w-8 h-8 text-[#7b1e3c]" />,
    title: "Pre-Thesis Phases",
    description:
      "Register for Pre-Thesis 1 & 2, submit reports, create a poster, and check plagiarism."
  },
  {
    icon: <FolderOpen className="w-8 h-8 text-[#7b1e3c]" />,
    title: "Thesis Registration & Progress",
    description:
      "Register for CSE400, work on your thesis, schedule meetings, and get supervisor feedback."
  },
  {
    icon: <Landmark className="w-8 h-8 text-[#7b1e3c]" />,
    title: "Defense & Approval",
    description:
      "Present your defense, revise if needed, and get final approval from your supervisor & committee."
  },
  {
    icon: <PackageCheck className="w-8 h-8 text-[#7b1e3c]" />,
    title: "Final Submission",
    description:
      "Submit the final hard copy & IEEE report to the library, then complete clearance for graduation."
  }
];

const ThesisWorkflow = () => {
  return (
    <section className="bg-white dark:bg-slate-900 py-16 transition-colors">
      <div className="container mx-auto px-6">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Your Thesis Journey
          </h2>
          <p className="mt-3 text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
            From forming your group to submitting your final thesis, follow these
            clear steps to successfully complete your BRAC University thesis.
          </p>
        </div>


        <div className="relative">

          <div className="absolute left-4 top-0 bottom-0 border-l-2 border-gray-200 dark:border-gray-700 md:hidden"></div>

          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex md:flex-col items-start md:items-center md:text-center relative"
              >

                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7b1e3c] text-white z-10 md:mb-4">
                  {index + 1}
                </div>

 
                <div className="ml-6 md:ml-0">
                  <div className="mb-2 flex items-center md:justify-center gap-2">
                    {step.icon}
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>


                {index < steps.length - 1 && (index + 1) % 3 !== 0 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                )}
              </div>
            ))}
          </div>
        </div>


        <div className="mt-12 flex justify-center">
          <a
            href="/thesis-process"
            className="px-6 py-3 bg-[#7b1e3c] text-white rounded-lg hover:bg-[#651730] transition font-medium"
          >
            View Full Process
          </a>
        </div>
      </div>
    </section>
  );
};

export default ThesisWorkflow;
