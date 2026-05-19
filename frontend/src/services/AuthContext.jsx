import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { authenticateUser } from "./profileApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [profile, setProfile] = useState(null);
    const [profileCompleted, setProfileCompleted] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (!firebaseUser) {

                    setUser(null);
                    setToken(null);
                    setProfile(null);
                    setProfileCompleted(false);
                    setLoading(false);

                    return;
                }
                // GET FIREBASE TOKEN
                const firebaseToken = await firebaseUser.getIdToken();

                // SAVE AUTH USER
                setUser(firebaseUser);
                setToken(firebaseToken);

                // CALL BACKEND
                const result = await authenticateUser(firebaseToken);

                if (!result.success) {

                    console.log(result.error);

                    setLoading(false);

                    return;
                }
                // SAVE PROFILE
                setProfile(result.data.user);


                // SAVE ONBOARDING STATE
                setProfileCompleted(
                    result.data.profile_completed
                );
            } catch (error) {
                console.log(
                    "Auth Context Error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        })
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            profile,
            profileCompleted,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => useContext(AuthContext);