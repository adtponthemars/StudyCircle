import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { getDomains } from "../services/recommendationApi";
import { fetchSearchMaterials } from "@/services/studyMaterialsApi";

const ExplorePage = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(""); // for domains
  const [searchQuery, setSearchQuery] = useState(""); // for materials

  const [materials, setMaterials] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 📦 Fetch domains (once)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDomains();
        setDomains(data);
      } catch (err) {
        console.error("Error fetching domains:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Debounced search for materials
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setMaterials([]);
        return;
      }

      try {
        setSearchLoading(true);
        const data = await fetchSearchMaterials(searchQuery );
        setMaterials(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // 🔎 Filter domains locally
  const filteredDomains = domains.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-linear-to-br 
      from-[oklch(0.75_0.08_180)] 
      via-[oklch(0.65_0.10_185)] 
      to-[oklch(0.55_0.12_190)] 
      text-foreground p-6"
    >
      {/* 🔍 Search */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search study materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base rounded-(--radius) bg-white"
          />
        </div>
      </div>

      {/* 🧭 Title */}
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-3xl text-white font-semibold tracking-tight">
          Explore Domains
        </h2>
        <p className="text-teal-50 text-sm mt-1">
          Discover areas of interest tailored for you
        </p>
      </div>

      {/* 📚 Domains */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-(--radius)" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDomains.map((domain, i) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-(--radius) border border-border bg-white hover:scale-[1.04] transition-transform cursor-pointer">
                  <CardContent className="flex items-center justify-center h-24">
                    <p className="font-medium text-center text-sm">
                      {domain.name}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredDomains.length === 0 && (
          <p className="text-center text-white mt-10">
            No domains found
          </p>
        )}
      </div>

      {/* 🔎 Search Results */}
      <div className="max-w-6xl mx-auto mt-12">
        {searchLoading && (
          <p className="text-center text-white">Searching...</p>
        )}

        {!searchLoading && searchQuery && materials.length === 0 && (
          <p className="text-center text-white">
            No materials found
          </p>
        )}

        {materials.length > 0 && (
          <>
            <h2 className="text-2xl text-white font-semibold mb-4">
              Search Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-white hover:scale-[1.03] transition-transform">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {item.summary}
                      </p>

                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {item.difficulty}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {item.word_count} words
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
