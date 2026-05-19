import { useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Heart, Sparkles } from "lucide-react";
import { trackEvent } from "@/services/userActivity";
import { homePgImg } from "@/assets/assets";
import { getDocumentSummary } from "@/services/studyMaterialsApi";
import { Badge } from "@/components/ui/badge";

export default function ViewDocumentPage() {
  const { state } = useLocation();
  const item = state?.item;
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
  const fetchSummary = async () => {
    const res = await getDocumentSummary(item.id);
    if (res?.success) {
      setData(res);
    }
  };

  fetchSummary();
}, [item._id]);

  if (!item) {
    return <div className="p-6">No document found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <Card className="rounded-2xl col-span-1">
          <CardContent className="p-4">

            <img
              src={item.cover_image || homePgImg.coverImage}
              className="rounded-xl w-full h-72 object-cover"
            />

            <div className="mt-4 space-y-2">

              <Button onClick={() => {
                trackEvent(item.id, "view");
                window.open(
                  `https://docs.google.com/viewer?url=${item.file_url}`,
                  "_blank"
                );
              }} className="w-full flex gap-2">
                <Eye size={16} /> View Document
              </Button>

              <Button
                onClick={() => {
                  trackEvent(item.id, "download");
                  window.open(item.file_url, "_blank");
                }}
                variant="outline"
                className="w-full flex gap-2"
              >
                <Download size={16} /> Download
              </Button>

            </div>

            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1" onClick={() => trackEvent(id, "like")}
              >
                <Heart size={16} /> {item.likes}
              </div>
              <div className="flex items-center gap-1">
                <Download size={16} /> {item.downloads || 0}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* RIGHT SIDE */}
        <div className="col-span-2 space-y-6">

          {/* DETAILS */}
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-semibold">{item.title}</h1>

              <p className="text-gray-600 mt-2">
                {item.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                <div>
                  <p className="text-gray-500">Created On</p>
                  <p className="font-medium">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Subject</p>
                  <p className="font-medium">{item.subject.name || "N/A"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">
                    {item.material_type?.split("/").pop() || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI SUMMARY */}
          <Card>
            <CardContent className="p-6">

              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">AI Summary</h2>

                <Button
                  className="flex gap-2"
                >
                  <Sparkles size={16} />
                  AI Summary
                </Button>
              </div>

              <div className="mt-4 text-gray-600">
                {data.summary || "No summary available."}
              </div>
              
               <div>
                <p className="font-medium my-3">Topics</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data?.topics?.length ? (
                    data.topics.map((t, i) => (
                      <Badge key={i} variant="secondary">
                        {typeof t === "object" ? t.name : t}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No topics detected
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
