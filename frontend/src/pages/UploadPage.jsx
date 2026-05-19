import { useState } from "react";
import { auth } from "../services/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [desc, setDesc] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [viewMode, setViewMode] = useState("upload"); 

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    const user = auth.currentUser;
    if (!user) return alert("User not logged in");

    setLoading(true);
    setStep("Uploading file...");

    try {
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", desc);
      formData.append("title", title);

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setStep("Analyzing document with AI...");

      const result = await response.json();
      setData(result);

      // ✅ SWITCH TO RESULT VIEW
      setViewMode("result");

    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  // RESET BACK TO UPLOAD FORM
  const handleReset = () => {
    setViewMode("upload");
    setFile(null);
    setData(null);
    setDesc("");
    setTitle("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-2xl relative">
        <CardHeader>
          <CardTitle>Upload Study Material</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ===================== UPLOAD FORM ===================== */}
          {viewMode === "upload" && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Add description (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label>File</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileChange}
                />

                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <Button onClick={handleUpload} className="w-full">
                Upload
              </Button>
            </>
          )}

          {/* ===================== RESULT VIEW ===================== */}
          {viewMode === "result" && data && (
            <div className="space-y-4">
              <Separator />

              <h2 className="text-lg font-semibold">AI Analysis</h2>

              <div className="text-sm space-y-1">
                <p><b>📘 Title:</b> {data?.title || "Untitled"}</p>
                <p><b>🧠 Subject:</b> {data?.subject?.name || data?.subject || "N/A"}</p>
                <p><b>📂 Category:</b> {data?.category?.name || data?.category || "N/A"}</p>
                <p><b>🌐 Domain:</b> {data?.domain?.name || data?.domain || "N/A"}</p>
                <p><b>🎯 Difficulty:</b> {data?.difficulty || "N/A"}</p>
              </div>

              <div>
                <p className="font-medium">📝 Summary</p>
                <p className="text-sm text-muted-foreground">
                  {data?.summary || "No summary available"}
                </p>
              </div>

              <div>
                <p className="font-medium">📌 Topics</p>
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

              <div>
                <p className="font-medium">🏷 Tags</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data?.tags?.length ? (
                    data.tags.map((t, i) => (
                      <Badge key={i} variant="outline">
                        #{typeof t === "object" ? t.name : t}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tags available
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ DONE BUTTON */}
              <Button onClick={handleReset} className="w-full mt-4">
                Done
              </Button>
            </div>
          )}

          {/* LOADING OVERLAY */}
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-sm text-muted-foreground">
                {step || "Processing..."}
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}