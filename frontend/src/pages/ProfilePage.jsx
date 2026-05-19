import React, { useEffect, useState } from "react";
import { getUserProfile } from "../services/profileApi";
import MyUploads from "../components/MyUploads";
import WizardForm from "../components/WizardForm";
import { useAuth } from "../services/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const data = await getUserProfile(user, token);
      setUserData(data);
    };
    fetchUserProfile();
  }, [user, token]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  const { academic_info, interests, bio } = userData;

  return (
    <div className="min-h-screen  p-6 space-y-6 max-w-5xl mx-auto">

      {/* ================= HEADER ================= */}
      <Card>
        <CardContent className="flex items-center gap-5 p-6">
          
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {userData.name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{userData.name}</h1>
            <p className="text-sm text-muted-foreground">{userData.email}</p>

            <Badge variant="secondary">
              {userData.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ================= BIO ================= */}
      {/* {bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {bio}
            </p>
          </CardContent>
        </Card>
      )} */}

      {/* ================= GRID ================= */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* ===== Academic Info ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Info</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Level:</span>{" "}
              <Badge variant="outline" className="capitalize">
                {academic_info.level}
              </Badge>
            </p>

            {academic_info.level === "school" && (
              <p>
                <span className="font-medium">Grade:</span>{" "}
                {academic_info.grade}
              </p>
            )}

            {academic_info.level === "college" && (
              <>
                <p>
                  <span className="font-medium">Course:</span>{" "}
                  {academic_info.course_name}
                </p>
                <p>
                  <span className="font-medium">Semester:</span>{" "}
                  {academic_info.semester}
                </p>
              </>
            )}

            {academic_info.level === "none" && (
              <p className="text-muted-foreground">
                No academic details provided
              </p>
            )}
          </CardContent>
        </Card>

        {/* ===== Interests ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>

          <CardContent>
            {interests?.subjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.subjects.map((sub, index) => (
                  <Badge key={index} variant="secondary">
                    {sub}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No subjects added
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================= FOOTER INFO ================= */}
      <Card>
        <CardContent className="p-6 space-y-2 text-sm text-muted-foreground">
          <p>
            Account created:{" "}
            <span className="text-foreground">
              {new Date(userData.created_at).toLocaleDateString()}
            </span>
          </p>

          <p>
            Last updated:{" "}
            <span className="text-foreground">
              {userData.updated_at
                ? new Date(userData.updated_at).toLocaleDateString()
                : "Not updated yet"}
            </span>
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* ================= USER CONTENT ================= */}
      <div className="space-y-6">
        <MyUploads />
        {/* <WizardForm /> */}
      </div>
    </div>
  );
};

export default ProfilePage;