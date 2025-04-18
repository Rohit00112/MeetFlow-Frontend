"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { updateProfile as updateProfileAction } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import ChangePasswordModal from "@/components/ChangePasswordModal";

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Avatar component that shows image or initials
const Avatar = ({ src, name, size = 100, className = '' }: { src: string | null, name: string, size?: number, className?: string }) => {
  if (src) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Image
          src={src}
          alt={name || 'Avatar'}
          width={size}
          height={size}
          className="rounded-full object-cover ring-4 ring-white shadow-lg"
        />
      </div>
    );
  }

  // If no image, show initials
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? `bg-blue-500` : 'bg-gray-300';

  return (
    <div
      className={`flex items-center justify-center rounded-full ${bgColor} text-white font-medium ring-4 ring-white shadow-lg ${className}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initials}
    </div>
  );
};

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state: any) => state.auth);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setProfileImageUrl(user.avatar || null);
    }
  }, [user]);

  // Create object URL for preview when profile image changes
  useEffect(() => {
    if (profileImage) {
      const objectUrl = URL.createObjectURL(profileImage);
      setProfileImageUrl(objectUrl);

      // Free memory when this component is unmounted
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [profileImage]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  // Handle avatar click to open file dialog
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateForm = (): boolean => {
    // Reset errors
    setNameError(null);
    setEmailError(null);
    setSaveError(null);

    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    return isValid;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset success state
    setSaveSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);

    try {
      // Convert image to base64 if it exists
      let imageBase64 = null;
      if (profileImage) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(profileImage);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      // Update profile using Redux
      const resultAction = await dispatch(updateProfileAction({ name, email, profileImage: imageBase64 }));

      if (!updateProfileAction.fulfilled.match(resultAction)) {
        throw new Error(resultAction.payload as string);
      }

      // Show success message
      setSaveSuccess(true);

      // Exit edit mode after a short delay
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
      console.error("Profile update failed:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="eos-icons:loading" className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
          >
            <Icon
              icon="heroicons:arrow-left"
              className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
            />
            Back to Home
          </Link>
        </div>
        {/* Profile Header with Background */}
        <div className="relative mb-8">
          <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl overflow-hidden">
            <div className="absolute inset-0 bg-opacity-20 bg-black flex items-center justify-center">
              <div className="w-full h-full bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}></div>
            </div>
          </div>

          <div className="absolute -bottom-16 left-0 w-full flex justify-center">
            <div
              onClick={handleAvatarClick}
              className={`${isEditing ? 'cursor-pointer transform hover:scale-105' : ''} transition-all duration-300`}
              title={isEditing ? "Click to change profile picture" : ""}
            >
              <Avatar src={profileImageUrl} name={name} size={130} />
            </div>
          </div>
        </div>

        {/* Profile Card with Elevated Design */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mt-12 transition-all duration-300 hover:shadow-2xl">
          <div className="px-6 py-8 sm:px-8 flex justify-between items-center border-b border-gray-200">
            <div className="text-center w-full mt-4">
              <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
              <p className="text-gray-500 flex items-center justify-center mt-1">
                <Icon icon="heroicons:envelope" className="h-4 w-4 mr-1" />
                {email}
              </p>
              <div className="mt-4 flex justify-center space-x-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-300 hover:shadow-lg"
                  >
                    <Icon icon="heroicons:pencil" className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSaveProfile}>
              <div className="px-6 py-6 sm:px-8">
                {saveError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Icon icon="heroicons:exclamation-circle" className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{saveError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {saveSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-sm">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Icon icon="heroicons:check-circle" className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">Profile updated successfully!</p>
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="flex flex-col items-center mb-8">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="profile-image"
                    />
                    <p className="text-sm text-blue-600 mt-1 bg-blue-50 px-4 py-2 rounded-full inline-flex items-center">
                      <Icon icon="heroicons:camera" className="h-4 w-4 mr-2" />
                      {profileImage ? profileImage.name : "Click avatar to change profile picture"}
                    </p>
                  </div>
                )}

                {isEditing ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="group">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Icon icon="heroicons:user" className="h-4 w-4 mr-1 text-blue-500" />
                        Full Name
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`block w-full px-4 py-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 ${nameError ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                          placeholder="Your full name"
                        />
                        {nameError && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <Icon icon="heroicons:exclamation-circle" className="h-4 w-4 mr-1" />
                            {nameError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Icon icon="heroicons:envelope" className="h-4 w-4 mr-1 text-blue-500" />
                        Email Address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`block w-full px-4 py-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 ${emailError ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                          placeholder="Your email address"
                        />
                        {emailError && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <Icon icon="heroicons:exclamation-circle" className="h-4 w-4 mr-1" />
                            {emailError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {isEditing && (
                <div className="px-6 py-4 bg-gray-50 sm:px-8 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {saveLoading ? (
                      <>
                        <Icon icon="eos-icons:loading" className="animate-spin h-5 w-5 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon icon="heroicons:check" className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Settings Card */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <Icon icon="heroicons:cog-6-tooth" className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">Manage your account preferences</p>
            </div>
            <div>
              <dl>
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Icon icon="heroicons:key" className="h-5 w-5 text-gray-400 mr-2" />
                    <dt className="text-sm font-medium text-gray-700">Password</dt>
                  </div>
                  <dd className="text-sm text-gray-900 flex items-center justify-end">
                    <span className="mr-3">••••••••</span>
                    <button
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center group transition-all duration-200"
                    >
                      <span>Change</span>
                      <Icon icon="heroicons:arrow-right" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </dd>
                </div>
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Icon icon="heroicons:check-badge" className="h-5 w-5 text-gray-400 mr-2" />
                    <dt className="text-sm font-medium text-gray-700">Account Status</dt>
                  </div>
                  <dd className="text-sm text-gray-900">
                    <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <Icon icon="heroicons:check-circle" className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  </dd>
                </div>
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Icon icon="heroicons:calendar" className="h-5 w-5 text-gray-400 mr-2" />
                    <dt className="text-sm font-medium text-gray-700">Account Created</dt>
                  </div>
                  <dd className="text-sm text-gray-900">
                    {new Date().toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center">
                <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">Irreversible account actions</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center">
                    <Icon icon="heroicons:trash" className="h-4 w-4 text-red-500 mr-1" />
                    Delete Account
                  </h3>
                  <div className="mt-1 text-sm text-gray-500">
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                </div>
                <div className="sm:ml-6 sm:flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 hover:shadow-lg"
                  >
                    <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
