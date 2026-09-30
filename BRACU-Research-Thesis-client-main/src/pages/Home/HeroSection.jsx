import React from "react";
import { Link } from "react-router";

const HeroSection = () => {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-10 max-w-7xl">

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-[#333] leading-tight font-serif">
            Manage Your BRAC University Thesis <br />
            <span className="text-[#7B1E3C]">With Ease</span>
          </h1>
          <p className="mt-4 text-lg text-[#666] max-w-lg font-sans">
            BRACU Research Connect helps BRAC University students and supervisors streamline
            thesis proposals, track progress, share resources, and collaborate effectively —
            all in one portal.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/thesis-process"
              className="px-6 py-3 bg-[#7B1E3C] text-white rounded-lg hover:bg-[#9E2A4A] transition-all font-semibold shadow-sm hover:shadow-md text-center"
            >
              Get Started
            </Link>
            <Link
              to="/search-feature"
              className="px-6 py-3 border border-[#7B1E3C] text-[#7B1E3C] rounded-lg hover:bg-[#7B1E3C] hover:text-white transition-all font-semibold bg-white shadow-sm hover:shadow-md text-center"
            >
              Explore Features
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#EEE] bg-white p-2 max-w-lg md:max-w-none">
            <img
              src="https://i.ibb.co.com/RTjKHzb5/banner.jpg" 
              alt="Thesis management illustration"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
