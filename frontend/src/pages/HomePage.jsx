import React, { useEffect, useState } from 'react'
import Home from './Home'
import { useAuth } from '@/services/AuthContext'
import { authenticateUser } from '@/services/profileApi'
import { useNavigate } from 'react-router-dom'
import LoginButton from '@/components/LoginButton'

const HomePage = () => {
    const { user, token } = useAuth();
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {

            if (!user || !token) {
                setLoading(false);
                return;
            }
            try {
                const result = await authenticateUser(token);

                // AUTH FAILED
                if (!result.success) {
                    console.log(result.error);
                    setLoading(false);
                    return;
                }

                // PROFILE NOT COMPLETED
                if (!result.profileCompleted) {
                    navigate("/create-profile");
                    return;
                }

                // PROFILE COMPLETE
                setLoading(false);

            } catch (error) {
                console.log("Error while fetching user authentication data: ", error)
                setLoading(false);
            }
        }
        fetchData();
    }, [user, token, navigate])

      // LOADING STATE
    if (loading) {
        return <div>Loading...</div>;
    }
    // NOT LOGGED IN
    if (!user) {
        return (
            <div className="bg-teal-500 w-full h-full">
                <LoginButton />
            </div>
        );
    }
    // LOGGED IN + PROFILE COMPLETE
    return <Home />;
}

export default HomePage