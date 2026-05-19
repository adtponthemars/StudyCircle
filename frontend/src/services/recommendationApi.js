import axios from "axios";

const API = "http://localhost:8000";

//Get subject recommendation 
export const getRecommendedSubjects = async (token) => {
    try {
        if (!token) throw new Error("User not authenticated");

        const res = await axios.get(`${API}/materials/recommended`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return res.data || { materials: [] };

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return { materials: [] }; 
    }
};

export const getRecommendations= async (token) => {
    try {
        if (!token) throw new Error("User not authenticated");

        const res = await axios.get(`${API}/recommend`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(res.data)    
        return res.data || { materials: [] };

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return { materials: [] }; 
    }
};

//Fetch domain names
export const getDomains = async ()=>{
    try {
        const res = await axios.get(`${API}/domains`)
        return res.data
    } catch (error) {
         console.error("Error fetching domains:", error);
        return []; // safer
    }
}
