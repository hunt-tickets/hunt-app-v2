// API Types
export interface EventDate {
  num: number;
  month: string;
}

export interface Venue {
  name: string;
}

export interface Event {
  id: string;
  'date.num': number;
  'date.month': string;
  name: string;
  flyer: string;
  'venue.name': string;
  popularity_score: number;
  priority: boolean;
  url: string;
  ics: string;
}

// Admin Event Type
export interface AdminEvent {
  id: string;
  url: string;
  date: string;
  name: string;
  flyer: string | null;
  status: string | null;
}

export interface EventsResponse {
  greeting: string;
  events: Event[];
}

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  prefix: string;
  lastName: string;
  birthdate: string;
  document_id: string;
  document_type_id: string;
}

// API Service
const API_BASE_URL = 'https://jtfcfsnksywotlbsddqb.supabase.co/functions/v1';
const API_REST_URL = 'https://jtfcfsnksywotlbsddqb.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZmNmc25rc3l3b3RsYnNkZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2NTMxNjksImV4cCI6MjA0NTIyOTE2OX0.JMasBB86_w6ra1aDaVJG2w7Xo33L0SAJW_DZlumAKIk';

export class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    userToken?: string
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        ...options.headers,
      };

      // If user is authenticated, use their token, otherwise use anon key
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      } else {
        headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. Check your permissions.');
        }
        if (response.status === 404) {
          throw new Error('Events endpoint not found.');
        }
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  static async getMainEvents(userToken?: string): Promise<EventsResponse> {
    return this.makeRequest<EventsResponse>('/main_events_app', {}, userToken);
  }

  // RPC endpoint for REST API calls
  private static async makeRpcRequest<T>(
    rpcFunction: string,
    userToken?: string
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      };

      // If user is authenticated, use their token, otherwise use anon key
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      } else {
        headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(`${API_REST_URL}/rpc/${rpcFunction}`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. Check your permissions.');
        }
        if (response.status === 404) {
          throw new Error('Profile endpoint not found.');
        }
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`RPC Error (${rpcFunction}):`, error);
      throw error;
    }
  }

  static async getUserProfile(userToken?: string): Promise<UserProfile> {
    return this.makeRpcRequest<UserProfile>('get_current_user_profile', userToken);
  }

  // Get all events for admin panel (ordered)
  static async getAllEventsOrdered(userToken?: string): Promise<AdminEvent[]> {
    try {
      const response = await fetch(`${API_REST_URL}/rpc/get_all_events_ordered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as AdminEvent[];
    } catch (error) {
      console.error('Error fetching admin events:', error);
      throw error;
    }
  }

  // Future API endpoints can be added here
  static async getEventDetails(eventId: string, userToken?: string) {
    // This can be implemented when the endpoint is available
    return this.makeRequest(`/events/${eventId}`, {}, userToken);
  }
}

// Utility functions for event data transformation
export const formatEventDate = (event: Event): string => {
  return `${event['date.num']} ${event['date.month']}`;
};

export const getEventImageUrl = (event: Event): string => {
  return event.flyer;
};

export const getEventVenue = (event: Event): string => {
  return event['venue.name'];
};

export const isEventPriority = (event: Event): boolean => {
  return event.priority;
};

export const getEventUrl = (event: Event): string => {
  return event.url;
};

export const getEventCalendarUrl = (event: Event): string => {
  return event.ics;
};