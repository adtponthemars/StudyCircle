import axios from "axios";
import { auth } from "./firebase";
import { getAuth } from "firebase/auth";

const API = "http://localhost:8000";

export const getStudyMaterials = async (token) => {
  try {
    const response = await axios.get("http://localhost:8000/materials");
    console.log(response)
    return response.data;
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
};
//Like study materials
export const likeStudyItem = async (materialId) => {
  try {
    const res = await axios.post(`http://localhost:8000/materials/${materialId}/like`);
    console.log(res.data);
    return res.data;

  } catch (error) {
    console.log(error)
    return null
  }
}
//Edit Study Materials
export const updateMaterial = async (materialId, { title, description }) => {
  const user = getAuth().currentUser;

  if (!user) throw new Error("User not logged in");

  const token = await user.getIdToken();

  const res = await axios.put(
    `${API}/materials/${materialId}`,
    {
      title,         // ✅ added
      description,   // ✅ existing
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
//Delete Study Materials
export const deleteMaterial = async (materialId) => {
  const user = getAuth().currentUser;

  if (!user) throw new Error("User not logged in");

  const token = await user.getIdToken();

  const res = await axios.delete(`${API}/materials/${materialId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

//Get Study Materials by user Id
export const getMyMaterials = async (token) => {
  try {

    if (!token) throw new Error("User not logged in");
    const res = await axios.get(`${API}/my-materials`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return res.data;
  }
  catch (error) {
    console.log(error)
    return null
  }
};

export const getDocumentSummary = async (docId) => {
  try {
    const response = await axios.get(`${API}/${docId}/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return null;
  }
};

  export const fetchSearchMaterials = async (query) => {
    const res = await axios.get(`${API}/materials/search`, {
      params: { query }
    });
    return res.data
  };