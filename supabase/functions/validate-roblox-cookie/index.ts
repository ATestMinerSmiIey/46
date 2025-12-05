import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cookie } = await req.json();

    if (!cookie) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cookie is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const cleanCookie = cookie.trim();
    console.log('Attempting to validate Roblox cookie...');

    // Validate the cookie by making a request to Roblox's authenticated endpoint
    const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
      method: 'GET',
      headers: {
        'Cookie': `.ROBLOSECURITY=${cleanCookie}`,
        'Accept': 'application/json',
      },
    });

    console.log('Roblox API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Roblox API error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid cookie or authentication failed' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const userData = await response.json();
    console.log('Successfully authenticated user:', userData.name);

    // Fetch user's avatar headshot
    let avatarUrl = '';
    try {
      const avatarResponse = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userData.id}&size=150x150&format=Png&isCircular=false`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json();
        avatarUrl = avatarData.data?.[0]?.imageUrl || '';
        console.log('Avatar URL:', avatarUrl);
      }
    } catch (avatarError) {
      console.error('Error fetching avatar:', avatarError);
    }

    // Fetch user's Robux balance
    let robuxBalance = 0;
    try {
      const currencyResponse = await fetch(
        `https://economy.roblox.com/v1/users/${userData.id}/currency`,
        {
          headers: {
            'Cookie': `.ROBLOSECURITY=${cleanCookie}`,
            'Accept': 'application/json',
          },
        }
      );
      if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        robuxBalance = currencyData.robux || 0;
        console.log('Robux balance:', robuxBalance);
      }
    } catch (currencyError) {
      console.error('Error fetching robux:', currencyError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.id,
          name: userData.name,
          displayName: userData.displayName,
          hasVerifiedBadge: userData.hasVerifiedBadge || false,
          avatarUrl,
          robuxBalance,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating cookie:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
