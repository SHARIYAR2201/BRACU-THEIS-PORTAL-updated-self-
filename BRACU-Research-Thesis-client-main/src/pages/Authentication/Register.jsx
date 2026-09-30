import React, { use, useState } from "react";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { useNavigate } from "react-router";

const Register = () => {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    creditsCompleted: "",
    photoUrl: "",
    password: "",
  });
  const { createUser } = use(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setFormData({
      name: "",
      email: "",
      studentId: "",
      creditsCompleted: "",
      photoUrl: "",
      password: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create user in Firebase Authentication
    createUser(formData.email, formData.password)
      .then((userCredential) => {
        alert("Registration successful!");

        // Conditional API POST request based on role
        const endpoint = "https://bracu-research-server-eta.vercel.app/users";

        // Prepare data to post
        const postData =
          role === "student"
            ? { ...formData, role: "student" }
            : {
                name: formData.name,
                email: formData.email,
                photoUrl: formData.photoUrl,
                password: formData.password,
                role: "supervisor",
              };

        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        })
          .then((response) => response.json())
          .then((data) => {
            navigate("/login");
          })
          .catch((error) => {
            console.error("Error posting data:", error);
            alert("There was an issue with the registration data submission.");
          });
      })
      .catch((error) => {
        console.error("Error registering user:", error);
        alert("Registration failed! Please try again.");
      });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 transition-colors px-6 py-12">
      <div className="max-w-md w-full bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white text-center">
          Register as {role === "student" ? "Student" : "Supervisor"}
        </h2>

        <div className="mb-6 text-center">
          <label className="mr-4 font-medium text-slate-700 dark:text-gray-300">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={handleRoleChange}
              className="mr-1"
            />
            Student
          </label>
          <label className="font-medium text-slate-700 dark:text-gray-300">
            <input
              type="radio"
              name="role"
              value="supervisor"
              checked={role === "supervisor"}
              onChange={handleRoleChange}
              className="mr-1"
            />
            Supervisor
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
              {role === "student" ? "G-Suite Email" : "BRAC Email"}
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={
                role === "student"
                  ? "example@gsuite.bracu.ac.bd"
                  : "example@bracu.ac.bd"
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
            />
          </div>

          {role === "student" && (
            <>
              <div>
                <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
                  Student ID
                </label>
                <input
                  required
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g., 1801234"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
                  Total Credits Completed
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  max={200}
                  name="creditsCompleted"
                  value={formData.creditsCompleted}
                  onChange={handleChange}
                  placeholder="e.g., 75"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
              Photo URL
            </label>
            <input
              required
              type="url"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="Paste a URL to your photo"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
            />
            {formData.photoUrl && (
              <img
                src={formData.photoUrl}
                alt="Photo preview"
                className="mt-3 w-28 h-28 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
              Password
            </label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a strong password"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#7b1e3c] hover:bg-[#651730] transition text-white font-semibold py-3 rounded-lg"
          >
            Register
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;
