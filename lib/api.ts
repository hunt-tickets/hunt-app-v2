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

// Artist Types
export interface Artist {
  id: string;
  name: string;
  logo: string | null;
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
        ...(options.headers as Record<string, string>),
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

  // Get user producers using RPC
  static async getUserProducers(userToken?: string): Promise<Producer[]> {
    return this.makeRpcRequest<Producer[]>('fetch_user_producers', userToken);
  }

  // Get producer users (team members) using RPC
  static async getProducerUsers(producerId: string, userToken?: string): Promise<ProducerUsersResponse> {
    try {
      console.log('🔍 getProducerUsers called with:', {
        producerId,
        hasToken: !!userToken,
        tokenPreview: userToken ? userToken.substring(0, 20) + '...' : 'No token'
      });

      const requestBody = {
        producer_id_param: producerId
      };

      console.log('📤 API Request:', {
        url: `${API_REST_URL}/rpc/get_producer_users_unified_app`,
        method: 'POST',
        body: requestBody
      });

      const response = await fetch(`${API_REST_URL}/rpc/get_producer_users_unified_app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch producer users: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Success Response:', data);
      return data;
    } catch (error) {
      console.error('💥 Error fetching producer users:', error);
      throw error;
    }
  }

  // Get venues
  static async getVenues(userToken?: string): Promise<Venue[]> {
    try {
      const response = await fetch(`${API_REST_URL}/venues?select=id,name,logo&order=name.asc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch venues: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  }

  // Get artists
  static async getArtists(userToken?: string): Promise<Artist[]> {
    try {
      const response = await fetch(`${API_REST_URL}/rpc/get_artists_with_logo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch artists: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching artists:', error);
      throw error;
    }
  }

  // Add producer user role
  static async addProducerUserRole(
    producerId: string,
    email: string,
    roleType: number,
    userToken?: string
  ): Promise<any> {
    try {
      const response = await fetch(`${API_REST_URL}/rpc/add_producer_user_role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          producer_id_param: producerId,
          email_param: email,
          role_type: roleType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add producer user role: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding producer user role:', error);
      throw error;
    }
  }

  // Get promoter events history
  static async getPromoterEventsHistory(
    userToken?: string,
    paginate: boolean = false,
    page: number = 1,
    limit: number = 10
  ): Promise<PromoterEventsResponse> {
    try {
      console.log('🚀 Starting getPromoterEventsHistory request...');
      console.log('📍 URL:', `${API_REST_URL}/rpc/get_promoter_events_history`);
      console.log('🔑 Token:', userToken ? `${userToken.substring(0, 20)}...` : 'No token provided');

      const requestHeaders = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${userToken}`
      };

      console.log('📋 Request headers:', requestHeaders);

      const requestBody = {
        p_paginate: paginate,
        p_page: page,
        p_limit: limit
      };

      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_REST_URL}/rpc/get_promoter_events_history`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response status text:', response.statusText);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`Failed to fetch promoter events: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Raw API response:', JSON.stringify(data, null, 2));
      console.log('📈 Response type:', typeof data);
      console.log('🔍 Response keys:', Object.keys(data));

      if (data.success !== undefined) {
        console.log('✅ Success field:', data.success);
      }
      if (data.active_events) {
        console.log('🎯 Active events count:', data.active_events.length);
        console.log('🎯 Active events sample:', data.active_events[0]);
      }
      if (data.past_events) {
        console.log('📅 Past events count:', data.past_events.length);
        console.log('📅 Past events sample:', data.past_events[0]);
      }

      return data;
    } catch (error) {
      console.error('💥 Error fetching promoter events:', error);
      console.error('💥 Error type:', error.constructor.name);
      console.error('💥 Error message:', error.message);
      throw error;
    }
  }

  // Get producer details
  static async getProducerDetails(
    producerId: string,
    userToken?: string
  ): Promise<Producer> {
    try {
      console.log('🔍 getProducerDetails called with:', {
        producerId,
        hasToken: !!userToken
      });

      const response = await fetch(`${API_REST_URL}/producers?id=eq.${producerId}&select=*`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        }
      });

      console.log('📥 Get Producer Details Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get Producer Details Error:', errorText);
        throw new Error(`Failed to get producer details: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Producer details fetched successfully:', data);

      if (!data || data.length === 0) {
        throw new Error('Producer not found');
      }

      return data[0];
    } catch (error) {
      console.error('💥 Error fetching producer details:', error);
      throw error;
    }
  }

  // Update producer profile
  static async updateProducer(
    producerId: string,
    producerData: UpdateProducerRequest,
    userToken?: string
  ): Promise<void> {
    try {
      console.log('🔄 updateProducer called with:', {
        producerId,
        producerData,
        hasToken: !!userToken
      });

      const response = await fetch(`${API_REST_URL}/producers?id=eq.${producerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          ...producerData,
          updated_at: 'now()'
        })
      });

      console.log('📥 Update Producer Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update Producer Error:', errorText);
        throw new Error(`Failed to update producer: ${response.status} - ${errorText}`);
      }

      console.log('✅ Producer updated successfully');
    } catch (error) {
      console.error('💥 Error updating producer:', error);
      throw error;
    }
  }

  // Get all sales history with pagination
  static async getAllMySales(
    userToken: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<SalesHistoryResponse> {
    try {
      console.log('🔍 getAllMySales called with:', {
        pageNumber,
        pageSize,
        hasToken: !!userToken
      });

      const response = await fetch(`${API_REST_URL}/rpc/get_all_my_sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          page_number: pageNumber,
          page_size: pageSize
        })
      });

      console.log('📥 Get All Sales Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get All Sales Error:', errorText);
        throw new Error(`Failed to get sales history: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Sales history fetched successfully:', {
        totalRecords: data.pagination?.total_records,
        currentPage: data.pagination?.current_page,
        recordsCount: data.records?.length
      });

      return data;
    } catch (error) {
      console.error('💥 Error fetching sales history:', error);
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

// Producer interface
export interface Producer {
  id: string;
  name: string;
  logo: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: boolean;
  banner?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Producer users interfaces
export interface ProducerUser {
  email: string;
  user_id: string;
  formatted_name: string;
}

export interface ProducerAdmin extends ProducerUser {
  admin_id: string;
}

export interface ProducerSeller extends ProducerUser {
  seller_id: string;
}

export interface ProducerScanner extends ProducerUser {
  scanner_id: string;
}

export interface ProducerUsersResponse {
  admins: ProducerAdmin[];
  sellers: ProducerSeller[];
  scanners: ProducerScanner[];
  timestamp: string;
  producer_id: string;
  producer_name: string;
}

// Add producer user role request interface
export interface AddProducerUserRoleRequest {
  producer_id_param: string;
  email_param: string;
  role_type: number; // 1 = admin, 2 = seller, 3 = scanner
}

// Update producer request interface
export interface UpdateProducerRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  status?: boolean;
  banner?: string;
  logo?: string;
}

// Promoter events interfaces
export interface PromoterEvent {
  event_id: string;
  event_name: string;
  event_date: string;
  event_flyer: string;
  tickets_sold: number;
  total_revenue: number;
  cash_revenue: number;
  web_revenue: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  past_total: number;
  past_pages: number;
  active_total: number;
  active_pages: number;
}

export interface PromoterEventsResponse {
  success: boolean;
  pagination?: PaginationInfo;
  past_events: PromoterEvent[];
  active_events: PromoterEvent[];
}

// Sales History Types
export interface SaleRecord {
  order_id: string;
  total: number;
  payment: string;
  user_name: string;
  user_email: string;
  ticket_name: string;
  quantity: string;
  transaction_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface SalesPagination {
  current_page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
}

export interface SalesHistoryResponse {
  code: number;
  msg: string;
  pagination: SalesPagination;
  records: SaleRecord[];
}

export interface Venue {
  id: string;
  name: string;
  logo: string | null;
}