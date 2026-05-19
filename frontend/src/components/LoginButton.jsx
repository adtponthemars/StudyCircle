import React from 'react'
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";
import axios from "axios";

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    // 🔥 Get Firebase ID token
    const idToken = await user.getIdToken();

    // Send token to backend
    await axios.post("http://localhost:8000/auth", {
      token: idToken
    });

    alert("Login successful!");

  } catch (error) {
    console.error(error);
    console.error("FULL ERROR:", error);
console.error("CODE:", error.code);
console.error("MESSAGE:", error.message);
  }
};

const LoginButton = () => {
  return (
    <div className='p-3' onClick={loginWithGoogle}>Sign up with Google</div>
  )
}

export default LoginButton
// import React, { useState } from "react";
// import { signInWithPopup } from "firebase/auth";
// import { auth, provider } from "../services/firebase";
// import axios from "axios";

// const LoginPage = () => {
//   const [loading, setLoading] = useState(false);

//   const loginWithGoogle = async () => {
//     try {
//       setLoading(true);

//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;

//       const idToken = await user.getIdToken();

//       await axios.post("http://localhost:8000/auth", {
//         token: idToken,
//       });

//       alert("Login successful!");
//     } catch (error) {
//       console.error(error);
//       alert("Login failed. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-teal-600">
//       {/* Card */}
//       <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
//         {/* Heading */}
//         <h1 className="text-2xl font-bold text-center mb-2">
//           Welcome to <span className="text-teal-500">Study Circle</span>
//         </h1>
//         <p className="text-gray-500 text-center mb-6">
//           Sign up or log in to continue
//         </p>

//         {/* Google Button */}
//         <button
//           onClick={loginWithGoogle}
//           disabled={loading}
//           className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
//         >
//           <img
//             src="https://www.svgrepo.com/show/475656/google-color.svg"
//             alt="Google"
//             className="w-5 h-5"
//           />
//           {loading ? "Signing in..." : "Continue with Google"}
//         </button>

       

//         {/* Footer */}
//         <p className="text-sm text-gray-500 text-center mt-6">
//           By continuing, you agree to our Terms & Privacy Policy
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;