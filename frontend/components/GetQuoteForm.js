import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "../utils/axiosInstance";

export default function GetQuoteForm({ propertyId, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setSuccess(null);
    setError(null);
    try {
      await axios.post("/quotes", { propertyId, ...data });
      setSuccess("Your quote request has been sent successfully!");
      reset();
      setTimeout(() => onClose(), 5000);
    } catch (err) {
      console.error("Quote submit error:", err);
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(serverMsg);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Get a Quote</h2>

      {success && <p className="text-green-600 mb-2">{success}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <input
            type="text"
            placeholder="Your Name"
            {...register("name", { required: "Name is required" })}
            className={`w-full border px-4 py-2 rounded ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Your Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            className={`w-full border px-4 py-2 rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            placeholder="Your Contact Number"
            {...register("contactNumber", {
              required: "Contact number is required",
              pattern: {
                value: /^[0-9+\-()\s]{7,}$/,
                message: "Invalid contact number",
              },
            })}
            className={`w-full border px-4 py-2 rounded ${
              errors.contactNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.contactNumber.message}
            </p>
          )}
        </div>

        <div>
          <textarea
            placeholder="Your Message"
            rows="4"
            {...register("message", { required: "Message is required" })}
            className={`w-full border px-4 py-2 rounded ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
