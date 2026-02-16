"use client";

import React from "react";
import { ProfileForm } from "./components/ProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  return (
    <div className="max-w-2xl mx-auto pt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          <CardDescription>
            Manage your account information and security preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;


