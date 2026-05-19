import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { Calendar, Eye, Download, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '@/services/userActivity';
import { homePgImg } from '@/assets/assets';

const MaterialsCarousel = ({ title, fetchFunction }) => {
  const { user, token, loading } = useAuth();
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;

    const fetchData = async () => {
      try {
        const result = await fetchFunction(token);
        setData(result.materials || []);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    fetchData();
  }, [user, token, fetchFunction]);

  const handleLike = async (id) => {
    try {
      const res = await trackEvent(id, "like");

      if (res?.incremented !== false) {
        setData(prev =>
          prev.map(item =>
            item.id === id
              ? { ...item, likes: item.likes + 1 }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleView = (item) => {
    trackEvent(item.id, "view"); // 👈 add this
    navigate("/view", { state: { item } });
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please login</p>;

  return (

   <div className="px-6 py-12 ">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 tracking-tight text-gray-800">
          {title}
        </h2>

        <div className="flex gap-6 overflow-x-auto pb-2">
          {data.map((item) => (
            <div
              key={item.id}
              className="group min-w-75 max-w-85 
                          bg-white/70 backdrop-blur-xl 
                          rounded-md shadow-md hover:shadow-2xl 
                          transition-all duration-300 overflow-hidden border border-white/40"
            >
              {/* Cover Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={item.cover_image || homePgImg.coverImage}
                  
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

                {/* Stats */}
                <div className="absolute bottom-3 left-3 flex gap-3 text-xs bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow">
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {item.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download size={14} /> {item.downloads || 0}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={20} />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1 hover:text-pink-500 transition"
                  >
                    <Heart size={20} /> {item.likes}
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold leading-snug line-clamp-2 group-hover:text-teal-600 transition">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {item.description ||
                    "Short description of the study material to give users a quick idea."}
                </p>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between">
                  <button
                    className="text-sm py-2 px-3 text-white font-medium bg-teal-600 hover:bg-teal-700 transition rounded-md"

                    onClick={() =>
                      handleView(item)
                    }
                  >
                    View Document →
                  </button>

                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    onClick={async () => {
                      const res = await trackEvent(item.id, "download");

                      if (res?.incremented !== false) {
                        setData(prev =>
                          prev.map(i =>
                            i.id === item.id
                              ? { ...i, downloads: (i.downloads || 0) + 1 }
                              : i
                          )
                        );
                      }

                      window.open(item.file_url, "_blank");
                    }}
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialsCarousel