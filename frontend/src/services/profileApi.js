import axios from "axios";
import { auth } from "./firebase";

export const authenticateUser = async (firebaseToken) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/auth",
      {},
      {
        headers: {
          Authorization: `Bearer ${firebaseToken}`
        }
      });
    console.log(response.data)
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("User Authentication Error:", error);

    return {
      success: false,
      error:
        error.response?.data?.detail ||
        error.message,
    };
  }
};
//FETCH USER PROFILE 
export const getUserProfile = async (user, token) => {
  try {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Axios GET request
    const response = await axios.get("http://localhost:8000/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;

  } catch (error) {
    console.error("Error fetching profile:", error);

    if (error.response) {
      throw new Error(error.response.data.detail || "Failed to fetch profile");
    }
    throw error;
  }
};

//CREATE USER PROFILE 
export const createUserProfile = async (data) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get Firebase ID token
    const idToken = await user.getIdToken();
    const response = await axios.post("http://localhost:8000/profile/setup",
      data,
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
    return response.data;

  } catch (error) {
    console.error("Error setting up profile:", error);

    // Optional: better error handling
    if (error.response) {
      // Backend responded with error status
      throw new Error(error.response.data.detail || "Failed to create profile");
    }

    throw error;
  }
}
