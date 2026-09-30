import React from "react";
import { Link } from "react-router";
import FuzzyText from "../../components/FuzzyText";

const Error = () => {
  return (
    <div className="bg-black">
      <div className="min-h-screen flex flex-col items-center">
        <div className="text-center mt-[12%]">
          <FuzzyText>404</FuzzyText>
          <Link to="/">
            <button className="btn btn-outline p-6 text-xl font-bold rounded-lg mt-10 text-white">Go Back Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;