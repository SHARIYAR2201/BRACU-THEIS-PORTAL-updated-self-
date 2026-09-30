import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-700 dark:text-gray-300 border-t border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/f-logo.svg"
              alt="BRACU Logo"
              className="h-8 md:h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                BRACU Research <span className="text-[#7b1e3c]">Connect</span>
              </h1>
              <p className="mt-2 max-w-xs text-sm text-slate-600 dark:text-gray-400">
                A thesis management portal for BRAC University students to collaborate, manage, and succeed.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Navigation</h3>
              <ul className="space-y-1">
                <li className="hover:text-[#7b1e3c] transition">Home</li>
                <li className="hover:text-[#7b1e3c] transition">Thesis Topics</li>
                <li className="hover:text-[#7b1e3c] transition">Guidelines</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Resources</h3>
              <ul className="space-y-1">
                <li className="hover:text-[#7b1e3c] transition">FAQs</li>
                <li className="hover:text-[#7b1e3c] transition">Support</li>
                <li className="hover:text-[#7b1e3c] transition">Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Legal</h3>
              <ul className="space-y-1">
                <li className="hover:text-[#7b1e3c] transition">Privacy Policy</li>
                <li className="hover:text-[#7b1e3c] transition">Terms of Use</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} Study Sync. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#7b1e3c] transition">Facebook</a>
            <a href="#" className="hover:text-[#7b1e3c] transition">LinkedIn</a>
            <a href="#" className="hover:text-[#7b1e3c] transition">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;