import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // import useNavigate

const RecentFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // initialize navigate

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch(
          "https://bracu-research-server-eta.vercel.app/faqs"
        );
        if (!res.ok) throw new Error("Failed to fetch FAQs");
        const data = await res.json();
        setFaqs(data.slice(0, 6));
      } catch (err) {
        setError(err.message || "Error fetching FAQs");
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading FAQs...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 mb-10">
      <h2 className="text-3xl font-bold text-center mb-10">Recent FAQs</h2>
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {faqs.map((faq) => (
          <div
            key={faq._id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="bg-[#7b1e3c] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                Q
              </div>
              <h3 className="font-semibold text-lg">{faq.question}</h3>
            </div>
            <p className="text-gray-700 mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>

      {/* All FAQs Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/all-faqs")} // navigate to All FAQs page
          className="bg-[#7b1e3c] text-white px-6 py-3 rounded-lg hover:bg-[#9b2c4f] transition-colors duration-300"
        >
          All FAQs
        </button>
      </div>
    </div>
  );
};

export default RecentFAQs;
