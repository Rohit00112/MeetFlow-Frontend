"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/AuthContext";
import meetingService, { Meeting, Participant } from "@/services/MeetingService";
import Link from "next/link";

const MeetingRoom = () => {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const meetingId = params?.id as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [participantMenuOpen, setParticipantMenuOpen] = useState<string | null>(null);
  
  // Load meeting data
  useEffect(() => {
    if (!meetingId || !user) return;
    
    try {
      const meetingData = meetingService.getMeeting(meetingId);
      
      if (!meetingData) {
        setError("Meeting not found. The meeting may have ended or the code is incorrect.");
        return;
      }
      
      if (!meetingData.isActive) {
        setError("This meeting has ended.");
        return;
      }
      
      // Join the meeting if not already joined
      const isParticipant = meetingData.participants.some(p => p.id === user.id);
      
      if (!isParticipant) {
        meetingService.joinMeeting(meetingId, user.id, user.name);
      }
      
      setMeeting(meetingData);
      
      // Find user's participant data
      const participantData = meetingData.participants.find(p => p.id === user.id);
      if (participantData) {
        setIsMuted(participantData.isMuted);
        setIsVideoOn(participantData.isVideoOn);
      }
      
      // Set up interval to refresh meeting data
      const intervalId = setInterval(() => {
        const updatedMeeting = meetingService.getMeeting(meetingId);
        if (updatedMeeting && updatedMeeting.isActive) {
          setMeeting(updatedMeeting);
        } else if (updatedMeeting && !updatedMeeting.isActive) {
          setError("This meeting has ended.");
          clearInterval(intervalId);
        }
      }, 5000);
      
      return () => {
        clearInterval(intervalId);
        // Leave meeting when component unmounts
        if (user && meetingId) {
          meetingService.leaveMeeting(meetingId, user.id);
        }
      };
    } catch (error) {
      console.error("Error loading meeting:", error);
      setError("An error occurred while loading the meeting.");
    }
  }, [meetingId, user]);
  
  const handleToggleMute = () => {
    if (!meeting || !user) return;
    
    const success = meetingService.toggleMute(meetingId, user.id);
    if (success) {
      setIsMuted(!isMuted);
    }
  };
  
  const handleToggleVideo = () => {
    if (!meeting || !user) return;
    
    const success = meetingService.toggleVideo(meetingId, user.id);
    if (success) {
      setIsVideoOn(!isVideoOn);
    }
  };
  
  const handleToggleScreenShare = () => {
    if (!meeting?.settings.allowScreenSharing) return;
    
    setIsScreenSharing(!isScreenSharing);
  };
  
  const handleEndMeeting = () => {
    if (!meeting || !user) return;
    
    // Check if user is host
    const isHost = meeting.participants.some(p => p.id === user.id && p.isHost);
    
    if (isHost) {
      // End meeting for everyone
      meetingService.endMeeting(meetingId);
    } else {
      // Leave meeting
      meetingService.leaveMeeting(meetingId, user.id);
    }
    
    // Redirect to home
    router.push("/");
  };
  
  const handleCopyMeetingLink = () => {
    if (!meetingId) return;
    
    const meetingLink = `${window.location.origin}/join?code=${meetingId}`;
    navigator.clipboard.writeText(meetingLink);
    
    // Show toast or notification (simplified for now)
    alert("Meeting link copied to clipboard!");
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const isUserHost = meeting?.participants.some(p => p.id === user?.id && p.isHost);
  
  if (error) {
    return (
      <>
        <Navbar />
        <main className="px-4 md:px-6 py-12 max-w-md mx-auto mt-20">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Icon icon="heroicons:exclamation-circle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Meeting Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <Icon icon="heroicons:home" className="h-5 w-5 mr-2" />
              Return to Home
            </Link>
          </div>
        </main>
      </>
    );
  }
  
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Meeting: {meetingId}</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopyMeetingLink}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Icon icon="heroicons:link" className="w-5 h-5" />
                Copy Link
              </button>
              <button 
                onClick={handleEndMeeting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Icon icon="heroicons:phone-x-mark" className="w-5 h-5" />
                {isUserHost ? "End Meeting" : "Leave Meeting"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
              {isVideoOn ? (
                <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-white">
                  <p>Video stream would appear here</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <Icon icon="heroicons:video-camera-slash" className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl">Your camera is off</p>
                  <button 
                    onClick={handleToggleVideo}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Turn on camera
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Meeting Info</h2>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Icon icon="heroicons:link" className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">{meetingId}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Icon icon="heroicons:clock" className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      Started at {meeting ? formatTime(meeting.startTime) : "--:--"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Icon icon="heroicons:user" className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">
                      Host: {meeting?.hostName || "Unknown"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">
                  Participants ({meeting?.participants.length || 0})
                </h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {meeting?.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {participant.name.charAt(0)}
                        </div>
                        <span>
                          {participant.name} {participant.isHost ? "(Host)" : ""}
                          {participant.id === user?.id ? " (You)" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {participant.isMuted && (
                          <Icon icon="heroicons:microphone-slash" className="w-5 h-5 text-gray-500" />
                        )}
                        {!participant.isVideoOn && (
                          <Icon icon="heroicons:video-camera-slash" className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button 
              onClick={handleToggleMute}
              className={`p-3 ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-full transition-colors`}
            >
              <Icon icon={isMuted ? "heroicons:microphone-slash" : "heroicons:microphone"} className="w-6 h-6" />
            </button>
            <button 
              onClick={handleToggleVideo}
              className={`p-3 ${!isVideoOn ? 'bg-red-100 text-red-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-full transition-colors`}
            >
              <Icon icon={isVideoOn ? "heroicons:video-camera" : "heroicons:video-camera-slash"} className="w-6 h-6" />
            </button>
            <button 
              onClick={handleToggleScreenShare}
              className={`p-3 ${isScreenSharing ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-full transition-colors ${!meeting?.settings.allowScreenSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!meeting?.settings.allowScreenSharing}
            >
              <Icon icon="heroicons:computer-desktop" className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3 ${isChatOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-full transition-colors ${!meeting?.settings.allowChat ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!meeting?.settings.allowChat}
            >
              <Icon icon="heroicons:chat-bubble-left-right" className="w-6 h-6" />
            </button>
            <button 
              onClick={handleEndMeeting}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            >
              <Icon icon="heroicons:phone-x-mark" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default MeetingRoom;
