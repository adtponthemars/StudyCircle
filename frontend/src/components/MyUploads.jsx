import React, { useEffect, useState } from "react";
import { getMyMaterials, deleteMaterial, updateMaterial } from "../services/studyMaterialsApi";
import { useAuth } from "../services/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash, Eye, Save, X } from "lucide-react";

const MyUploads = () => {
  const { user, token, loading } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    fetchData();
  }, [user, token]);

  const fetchData = async () => {
    try {
      const data = await getMyMaterials(token);
      setMaterials(data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  // 🗑️ Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this material?");
    if (!confirmDelete) return;

    try {
      await deleteMaterial(id);

      // Optimistic UI update
      setMaterials(materials.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ✏️ Start Editing
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setNewDescription(item.description || "");
    setNewTitle(item.title || ""); // ✅ add this
  };

  // 💾 Save Edit
  const handleSave = async (id) => {
    try {
      await updateMaterial(id, {
        title: newTitle,
        description: newDescription,
      });

      // Update UI
      setMaterials((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, title: newTitle, description: newDescription }
            : item
        )
      );

      setEditingId(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        My Uploads
      </h2>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((item) => (
          <Card
            key={item.id}
            className="bg-white/80 backdrop-blur-md border border-gray-100 
            shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <CardContent className="p-5 flex flex-col justify-between h-full">

              {/* TOP CONTENT */}
              <div className="space-y-3">
                {/* TITLE */}
                {editingId === item.id ? (
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="font-semibold"
                  />
                ) : (
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {item.title || "Untitled"}
                  </h3>
                )}

                {/* SUBJECT */}
                <p className="text-xs text-gray-500">
                  {item.subject?.name}
                </p>

                {/* DESCRIPTION */}
                {editingId === item.id ? (
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.description || "No description"}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex flex-wrap gap-2">

                {/* VIEW */}
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() =>
                    window.open(
                      `https://docs.google.com/viewer?url=${item.file_url}`,
                      "_blank"
                    )
                  }
                >
                  <Eye size={16} />
                  View
                </Button>

                {editingId === item.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSave(item.id)}
                      className="gap-1"
                    >
                      <Save size={16} />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="gap-1"
                    >
                      <X size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(item)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MyUploads;