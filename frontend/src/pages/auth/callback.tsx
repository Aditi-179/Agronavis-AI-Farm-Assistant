import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

/**
 * OAuth Callback Page
 *
 * Supabase PKCE flow redirects here after Google OAuth.
 * This page exchanges the auth code for a valid session,
 * then checks whether the user has a farmer profile and routes accordingly.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth code exchange
    const handleCallback = async () => {
      try {
        // exchangeCodeForSession processes the ?code= param in the URL
        // This is what actually establishes the authenticated session client-side
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/auth/login?error=callback_failed');
          return;
        }

        const user = data?.session?.user;
        if (!user) {
          router.replace('/auth/login');
          return;
        }

        // Check if the user already has a farmer profile
        const { data: farmerProfile, error: profileError } = await supabase
          .from('farmers')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = "row not found" — that's expected for new users
          console.error('Error checking farmer profile:', profileError);
          router.replace('/onboarding/profile');
          return;
        }

        if (farmerProfile) {
          // Profile exists — check if a farm is set up
          const { data: farm } = await supabase
            .from('farms')
            .select('id')
            .eq('farmer_id', user.id)
            .single();

          if (farm) {
            router.replace('/dashboard');
          } else {
            router.replace('/onboarding/farm');
          }
        } else {
          // New user — go through onboarding
          router.replace('/onboarding/profile');
        }
      } catch (err) {
        console.error('Unexpected callback error:', err);
        router.replace('/auth/login?error=unexpected');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in…</p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}
