import { auth } from "../services/firebase";

const BASE_URL = "http://localhost:8000";

async function getToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function trackEvent(documentId, action) {
  try {
    const token = await getToken();
    if (!token) return;

    await fetch(`${BASE_URL}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({  document_id: documentId,
      action }),
    });
    return await res.json()
  } catch (err) {
    console.error("Tracking failed:", err);
  }
}

export const getRecentlyViewed = async (token) => {
  const res = await fetch(`${BASE_URL}/recently-viewed`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await res.json();
};
