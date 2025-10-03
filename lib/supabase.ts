import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtfcfsnksywotlbsddqb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZmNmc25rc3l3b3RsYnNkZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2NTMxNjksImV4cCI6MjA0NTIyOTE2OX0.JMasBB86_w6ra1aDaVJG2w7Xo33L0SAJW_DZlumAKIk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helper functions
export const authService = {
  async sendOTP(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            app_name: 'Hunt App',
          }
        }
      });

      if (error) {
        console.error('Supabase OTP Error:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Send OTP Error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  async verifyOTP(email: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('Supabase OTP Verification Error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          emailVerified: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at || '',
          metadata: data.user.user_metadata
        },
        session: {
          accessToken: data.session?.access_token || '',
          refreshToken: data.session?.refresh_token || '',
          expiresAt: data.session?.expires_at || 0
        }
      };
    } catch (error: any) {
      console.error('Verify OTP Error:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw new Error(error.message);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }
};