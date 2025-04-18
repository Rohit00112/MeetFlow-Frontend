// Meeting Service for handling meeting room creation and management

// Types
export interface Meeting {
  id: string;
  hostId: string;
  hostName: string;
  startTime: Date;
  participants: Participant[];
  isActive: boolean;
  settings: MeetingSettings;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  joinTime: Date;
}

export interface MeetingSettings {
  allowScreenSharing: boolean;
  allowChat: boolean;
  muteParticipantsOnEntry: boolean;
  allowParticipantsToUnmute: boolean;
  allowRecording: boolean;
}

// Helper function to generate a random meeting ID
const generateMeetingId = (): string => {
  // Generate a 3-part code like "abc-defg-hij"
  const characters = 'abcdefghijklmnopqrstuvwxyz';

  const generatePart = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  return `${generatePart(3)}-${generatePart(4)}-${generatePart(3)}`;
};

// Mock storage for meetings (in a real app, this would be a database)
let meetings: Meeting[] = [];

// MeetingService class
class MeetingService {
  // Create a new meeting
  createMeeting(hostId: string, hostName: string, settings?: Partial<MeetingSettings>): Meeting {
    // Generate a unique meeting ID
    const meetingId = generateMeetingId();
    console.log('Creating new meeting with ID:', meetingId);

    // Define default settings
    const defaultSettings: MeetingSettings = {
      allowScreenSharing: true,
      allowChat: true,
      muteParticipantsOnEntry: true,
      allowParticipantsToUnmute: true,
      allowRecording: false,
    };

    // Create the new meeting object
    const newMeeting: Meeting = {
      id: meetingId,
      hostId,
      hostName,
      startTime: new Date(),
      participants: [
        {
          id: hostId,
          name: hostName,
          isHost: true,
          isMuted: false,
          isVideoOn: false,
          joinTime: new Date(),
        },
      ],
      isActive: true, // Always set to true for new meetings
      settings: { ...defaultSettings, ...settings },
    };

    // Add to meetings array
    meetings.push(newMeeting);
    console.log('Meeting created successfully:', newMeeting);
    console.log('Current meetings:', meetings);

    // Save to localStorage
    this.saveMeetingsToLocalStorage();

    // Verify the meeting was saved correctly
    const savedMeeting = this.getMeeting(meetingId);
    if (!savedMeeting) {
      console.error('Failed to save meeting:', meetingId);
    } else if (!savedMeeting.isActive) {
      console.error('Meeting saved but not active:', meetingId);
      // Force set to active
      savedMeeting.isActive = true;
      this.saveMeetingsToLocalStorage();
    }

    return newMeeting;
  }

  // Get a meeting by ID
  getMeeting(meetingId: string): Meeting | undefined {
    console.log('Getting meeting with ID:', meetingId);
    console.log('Available meetings:', meetings.map(m => ({ id: m.id, isActive: m.isActive })));

    const meeting = meetings.find(meeting => meeting.id === meetingId);

    if (!meeting) {
      console.log('Meeting not found with ID:', meetingId);
      return undefined;
    }

    console.log('Found meeting:', { id: meeting.id, isActive: meeting.isActive, participants: meeting.participants.length });
    return meeting;
  }

  // Join a meeting
  joinMeeting(meetingId: string, participantId: string, participantName: string): Meeting | null {
    const meeting = this.getMeeting(meetingId);

    if (!meeting || !meeting.isActive) {
      return null;
    }

    // Check if participant is already in the meeting
    const existingParticipant = meeting.participants.find(p => p.id === participantId);

    if (existingParticipant) {
      // Update join time if rejoining
      existingParticipant.joinTime = new Date();
    } else {
      // Add new participant
      meeting.participants.push({
        id: participantId,
        name: participantName,
        isHost: false,
        isMuted: meeting.settings.muteParticipantsOnEntry,
        isVideoOn: false,
        joinTime: new Date(),
      });
    }

    this.saveMeetingsToLocalStorage();

    return meeting;
  }

  // Leave a meeting
  leaveMeeting(meetingId: string, participantId: string): boolean {
    const meeting = this.getMeeting(meetingId);

    if (!meeting) {
      return false;
    }

    // If the host leaves, end the meeting
    const participant = meeting.participants.find(p => p.id === participantId);

    if (participant?.isHost) {
      return this.endMeeting(meetingId);
    }

    // Otherwise, remove the participant
    meeting.participants = meeting.participants.filter(p => p.id !== participantId);

    this.saveMeetingsToLocalStorage();

    return true;
  }

  // End a meeting
  endMeeting(meetingId: string): boolean {
    const meeting = this.getMeeting(meetingId);

    if (!meeting) {
      return false;
    }

    meeting.isActive = false;

    this.saveMeetingsToLocalStorage();

    return true;
  }

  // Toggle participant's mute status
  toggleMute(meetingId: string, participantId: string): boolean {
    const meeting = this.getMeeting(meetingId);

    if (!meeting) {
      return false;
    }

    const participant = meeting.participants.find(p => p.id === participantId);

    if (!participant) {
      return false;
    }

    participant.isMuted = !participant.isMuted;

    this.saveMeetingsToLocalStorage();

    return true;
  }

  // Toggle participant's video status
  toggleVideo(meetingId: string, participantId: string): boolean {
    const meeting = this.getMeeting(meetingId);

    if (!meeting) {
      return false;
    }

    const participant = meeting.participants.find(p => p.id === participantId);

    if (!participant) {
      return false;
    }

    participant.isVideoOn = !participant.isVideoOn;

    this.saveMeetingsToLocalStorage();

    return true;
  }

  // Get all active meetings
  getActiveMeetings(): Meeting[] {
    return meetings.filter(meeting => meeting.isActive);
  }

  // Get meetings hosted by a user
  getUserMeetings(userId: string): Meeting[] {
    return meetings.filter(meeting => meeting.hostId === userId);
  }

  // Load meetings from localStorage (for persistence between page refreshes)
  loadMeetingsFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const storedMeetings = localStorage.getItem('meetings');

      if (storedMeetings) {
        try {
          const parsedMeetings = JSON.parse(storedMeetings);

          // Convert string dates back to Date objects
          parsedMeetings.forEach((meeting: any) => {
            meeting.startTime = new Date(meeting.startTime);
            meeting.participants.forEach((participant: any) => {
              participant.joinTime = new Date(participant.joinTime);
            });
          });

          meetings = parsedMeetings;

          // Clean up any meetings that might be in an inconsistent state
          this.cleanupMeetings();
        } catch (error) {
          console.error('Error parsing meetings from localStorage:', error);
          // Reset meetings if there's an error
          meetings = [];
          localStorage.removeItem('meetings');
        }
      }
    }
  }

  // Clean up meetings that might be in an inconsistent state
  cleanupMeetings(): void {
    // Remove any meetings that don't have valid data
    meetings = meetings.filter(meeting => {
      return meeting && meeting.id && meeting.hostId && meeting.hostName &&
             Array.isArray(meeting.participants) && meeting.participants.length > 0;
    });

    // Save the cleaned up meetings
    this.saveMeetingsToLocalStorage();
  }

  // Save meetings to localStorage
  saveMeetingsToLocalStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        // Make sure all meetings have isActive property set
        meetings.forEach(meeting => {
          if (meeting.isActive === undefined) {
            meeting.isActive = true;
          }
        });

        const meetingsJson = JSON.stringify(meetings);
        localStorage.setItem('meetings', meetingsJson);
        console.log('Saved meetings to localStorage:', meetings.length);

        // Verify the data was saved correctly
        const savedData = localStorage.getItem('meetings');
        if (!savedData) {
          console.error('Failed to save meetings to localStorage');
        }
      } catch (error) {
        console.error('Error saving meetings to localStorage:', error);
      }
    }
  }

  // Initialize the service
  initialize(): void {
    // Clear any existing meetings for testing purposes
    if (typeof window !== 'undefined') {
      localStorage.removeItem('meetings');
    }
    meetings = [];

    // Load meetings from localStorage
    this.loadMeetingsFromLocalStorage();
  }
}

// Create and export a singleton instance
const meetingService = new MeetingService();
meetingService.initialize();

export default meetingService;
