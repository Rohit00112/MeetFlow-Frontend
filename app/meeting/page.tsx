"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/AuthContext";
import meetingService from "@/services/MeetingService";

const CreateMeetingPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingSettings, setMeetingSettings] = useState({
    allowScreenSharing: true,
    allowChat: true,
    muteParticipantsOnEntry: true,
    allowParticipantsToUnmute: true,
    allowRecording: false,
  });

  const handleCreateMeeting = () => {
    if (!user) return;

    setIsCreating(true);
    setError(null);

    try {
      // Create a new meeting
      const meeting = meetingService.createMeeting(user.id, user.name, meetingSettings);

      // Redirect to the meeting room
      router.push(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
      setError("An error occurred while creating the meeting. Please try again.");
      setIsCreating(false);
    }
  };

  const handleSettingChange = (setting: string) => {
    setMeetingSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="px-4 md:px-6 py-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create a New Meeting</h1>
            <p className="text-gray-600 mt-2">
              Set up your meeting preferences and invite participants
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Icon icon="heroicons:exclamation-circle" className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Meeting Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:computer-desktop" className="w-5 h-5 text-gray-600" />
                    <span>Allow screen sharing</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={meetingSettings.allowScreenSharing}
                      onChange={() => handleSettingChange('allowScreenSharing')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 text-gray-600" />
                    <span>Allow chat</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={meetingSettings.allowChat}
                      onChange={() => handleSettingChange('allowChat')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:microphone-slash" className="w-5 h-5 text-gray-600" />
                    <span>Mute participants on entry</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={meetingSettings.muteParticipantsOnEntry}
                      onChange={() => handleSettingChange('muteParticipantsOnEntry')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:microphone" className="w-5 h-5 text-gray-600" />
                    <span>Allow participants to unmute themselves</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={meetingSettings.allowParticipantsToUnmute}
                      onChange={() => handleSettingChange('allowParticipantsToUnmute')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:video-camera" className="w-5 h-5 text-gray-600" />
                    <span>Allow recording</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={meetingSettings.allowRecording}
                      onChange={() => handleSettingChange('allowRecording')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleCreateMeeting}
                disabled={isCreating}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Icon icon="eos-icons:loading" className="animate-spin w-5 h-5" />
                    Creating Meeting...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:video-camera" className="w-5 h-5" />
                    Start Meeting Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default CreateMeetingPage;
