import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  verifyEmailOtp,
  clearError,
} from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { Loader } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const {
    loading,
    error,
    isAuthenticated,
    registerSuccess,
    verificationSuccess,
  } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  const handleVerify = (e) => {
    e.preventDefault();
    dispatch(verifyEmailOtp({ email: formData.email, otp }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-black rounded-2xl shadow-xl p-10 border border-gray-100 dark:border-gray-800">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          {registerSuccess
            ? verificationSuccess
              ? "Verified!"
              : "Verify Email"
            : "Create Account"}
        </h2>

        {registerSuccess ? (
          verificationSuccess ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                <p className="font-semibold">Email Verified Successfully!</p>
              </div>
              <Link
                to="/login"
                className="inline-block w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-lg transition-all"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                We sent a verification code to {formData.email}. Please enter it
                below.
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center tracking-widest text-2xl px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex justify-center items-center shadow-lg shadow-violet-500/30"
                >
                  {loading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </form>
            </div>
          )
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex justify-center items-center shadow-lg shadow-violet-500/30"
              >
                {loading ? <Loader className="animate-spin" /> : "Sign Up"}
              </button>
            </form>
          </>
        )}

        {/* Existing login link footer needs to act conditionally or be part of the conditional forms? 
            Currently inside the card, let's keep it visible only if not success, or just hide it since success block has its own link.
        */}
        {!registerSuccess && (
          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-600 hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
