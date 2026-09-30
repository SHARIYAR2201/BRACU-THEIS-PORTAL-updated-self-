import React, { useState } from "react";

const CreateFaqs = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      setMessage("Please fill in both fields");
      return;
    }

    try {
      const res = await fetch(
        "https://bracu-research-server-eta.vercel.app/faqs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, answer }),
        }
      );

      if (res.ok) {
        setMessage("FAQ added successfully!");
        setQuestion("");
        setAnswer("");
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to add FAQ");
      }
    } catch (error) {
      setMessage("Error adding FAQ");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded mb-40">
      <h2 className="text-2xl font-bold mb-4">Create FAQ</h2>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter FAQ question"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter FAQ answer"
            rows={4}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add FAQ
        </button>
      </form>
    </div>
  );
};

export default CreateFaqs;
