import { useState } from "react";
import { createUserProfile } from "../services/profileApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const WizardForm = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    academic_info: {
      level: "",
      grade: "",
      course_name: "",
      semester: "",
    },
    interests: {
      subjects: [],
    },
    bio: "",
  });

  const handleChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  const handleLevelChange = (value) => {
    setFormData({
      ...formData,
      academic_info: {
        level: value,
        grade: "",
        course_name: "",
        semester: "",
      },
    });
  };

  const handleSubjectChange = (e) => {
    const values = e.target.value.split(",").map((s) => s.trim());
    handleChange("interests", "subjects", values);
  };

  const handleSubmit = async () => {
    await createUserProfile(formData);
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Setup
            <Badge variant="secondary">Step {step} / 4</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <Label>Academic Level</Label>

              <select
                value={formData.academic_info.level}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full border rounded-md p-2 bg-background"
              >
                <option value="">Select level</option>
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="none">None</option>
              </select>

              {formData.academic_info.level === "school" && (
                <Input
                  placeholder="Enter Grade (e.g. 10th)"
                  value={formData.academic_info.grade}
                  onChange={(e) =>
                    handleChange("academic_info", "grade", e.target.value)
                  }
                />
              )}

              {formData.academic_info.level === "college" && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Course Name"
                    value={formData.academic_info.course_name}
                    onChange={(e) =>
                      handleChange("academic_info", "course_name", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Semester"
                    value={formData.academic_info.semester}
                    onChange={(e) =>
                      handleChange("academic_info", "semester", e.target.value)
                    }
                  />
                </div>
              )}

              <Button
                onClick={nextStep}
                disabled={!formData.academic_info.level}
                className="w-full"
              >
                Next
              </Button>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <Label>Subjects (comma separated)</Label>

              <Input
                placeholder="e.g. Math, Physics, AI"
                onChange={handleSubjectChange}
              />

              <div className="flex gap-2 flex-wrap">
                {formData.interests.subjects.map((sub, i) => (
                  <Badge key={i} variant="secondary">
                    {sub}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <Label>Bio</Label>

              <Textarea
                placeholder="Write a short bio..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <Label>Review</Label>

              <div className="bg-muted p-4 rounded text-sm">
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={handleSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default WizardForm;