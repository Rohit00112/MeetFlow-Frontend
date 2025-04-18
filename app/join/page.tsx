"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/AuthContext";
import meetingService from "@/services/MeetingService";
import Link from "next/link";

const JoinMeetingPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  
  // Check if there's a meeting code in the URL
  useEffect(() => {
    const code = searchParams?.get("code");
    if (code) {
      setMeetingCode(code);
    }
  }, [searchParams]);
  
  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingCode.trim()) {
      setError("Please enter a meeting code");
      return;
    }
    
    setIsJoining(true);
    setError("");
    
    try {
      // Validate meeting code format (optional)
      const codePattern = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
      if (!codePattern.test(meetingCode)) {
        setError("Invalid meeting code format. Expected format: abc-defg-hij");
        setIsJoining(false);
        return;
      }
      
      // Check if meeting exists
      const meeting = meetingService.getMeeting(meetingCode);
      
      if (!meeting) {
        setError("Meeting not found. Please check the code and try again.");
        setIsJoining(false);
        return;
      }
      
      if (!meeting.isActive) {
        setError("This meeting has ended.");
        setIsJoining(false);
        return;
      }
      
      // Join the meeting
      if (user) {
        meetingService.joinMeeting(meetingCode, user.id, user.name);
      }
      
      // Redirect to the meeting room
      router.push(`/meeting/${meetingCode}`);
    } catch (error) {
      console.error("Error joining meeting:", error);
      setError("An error occurred while joining the meeting. Please try again.");
      setIsJoining(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="px-4 md:px-6 py-12 max-w-md mx-auto mt-20">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Join a Meeting</h1>
            <p className="text-gray-600 mt-2">
              Enter the meeting code provided by the host
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
          
          <form onSubmit={handleJoinMeeting} className="space-y-6">
            <div>
              <label htmlFor="meeting-code" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Code
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon icon="heroicons:link" className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="meeting-code"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="abc-defg-hij"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value.toLowerCase())}
                  pattern="[a-z]{3}-[a-z]{4}-[a-z]{3}"
                  title="Meeting code format: abc-defg-hij"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Format: abc-defg-hij
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                Back to home
              </Link>
              
              <button
                type="submit"
                disabled={isJoining || !meetingCode.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <>
                    <Icon icon="eos-icons:loading" className="animate-spin h-5 w-5 mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:video-camera" className="h-5 w-5 mr-2" />
                    Join Meeting
                  </>
                )}
              </button>
            </div>
          </form>
          
          {!user && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>{" "}
                to join with your account
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default JoinMeetingPage;
