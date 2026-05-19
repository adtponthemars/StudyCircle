import React, { useState, useEffect } from 'react'
import { homePgImg } from '../assets/assets'
import Categories from '../components/Categories'
import MaterialsCarousel from '@/components/MaterialCarousel'
import { getRecommendations, getRecommendedSubjects } from '@/services/recommendationApi'
import { getRecentlyViewed } from '@/services/userActivity'
import { getUserProfile } from "../services/profileApi";
import RecentUpload from '@/components/RecentUpload'
import { useAuth } from "../services/AuthContext";
import { Badge } from "@/components/ui/badge";
import LoginPage from '@/components/LoginButton'
import LoginButton from '@/components/LoginButton'

const Home = () => {
  const { user, token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserProfile = async () => {

      if (!user || !token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getUserProfile(user, token);
        setUserData(data);
      } catch (error) {
        console.log("Error fetching user profile Data on Home Page", error);

      } finally {
        setLoading(false);
      }

    };
    fetchUserProfile();

  }, [user, token]);
  
  // LOADING
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className='flex-col  p-2'>
      <div className=' h-72 bg-teal-600  flex justify-between items-center rounded-md  '>
        <div className='m-6 text-white'>
          <h1 className='text-5xl font-semibold '>Hello, {userData.name}</h1>
          <Badge variant="secondary">
            {userData.role}
          </Badge>
          <p>{userData.academic_info.course_name}</p>
        </div>
        <div className='h-100 mt-3 overflow-hidden'>
          <img src={homePgImg.homeBanner1} className='w-full h-full object-cover mt-2 ' alt="" />
        </div>
      </div>
      <div>
        <MaterialsCarousel
          title="Recommended For You"
          fetchFunction={getRecommendations} />

        <MaterialsCarousel
          title="Based on Your Profile"
          fetchFunction={getRecommendedSubjects} />

        <MaterialsCarousel
          title="Recently Viewed"
          fetchFunction={getRecentlyViewed} />
        <Categories />

        <RecentUpload />
      </div>
    </div>
  )
}

export default Home