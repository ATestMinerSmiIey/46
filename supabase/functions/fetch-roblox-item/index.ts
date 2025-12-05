import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RolimonsItem {
  name: string;
  rap: number;
  value: number;
}

// Rolimons data cache
let rolimonsCache: { data: Record<string, RolimonsItem> | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

async function fetchRolimonsData(): Promise<Record<string, RolimonsItem>> {
  const now = Date.now();
  // Cache for 5 minutes
  if (rolimonsCache.data && (now - rolimonsCache.timestamp) < 300000) {
    console.log('Using cached Rolimons data');
    return rolimonsCache.data;
  }

  console.log('Fetching fresh Rolimons data...');
  try {
    const response = await fetch('https://www.rolimons.com/itemapi/itemdetails', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error('Rolimons API error:', response.status);
      return rolimonsCache.data || {};
    }

    const data = await response.json();
    
    if (!data.success || !data.items) {
      console.error('Invalid Rolimons response');
      return rolimonsCache.data || {};
    }

    // Parse Rolimons data format: [Name, Acronym, Rap, Value, ...]
    const items: Record<string, RolimonsItem> = {};
    for (const [assetId, itemData] of Object.entries(data.items)) {
      if (Array.isArray(itemData) && itemData.length >= 4) {
        items[assetId] = {
          name: itemData[0] as string,
          rap: itemData[2] as number,
          value: itemData[3] as number
        };
      }
    }

    console.log(`Parsed ${Object.keys(items).length} limited items from Rolimons`);
    
    rolimonsCache = { data: items, timestamp: now };
    return items;
  } catch (error) {
    console.error('Failed to fetch Rolimons data:', error);
    return rolimonsCache.data || {};
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assetId } = await req.json();

    if (!assetId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Asset ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Fetching item data for asset:', assetId);

    // Fetch Rolimons data for RAP and limited status
    const rolimonsItems = await fetchRolimonsData();
    const rolimonsItem = rolimonsItems[String(assetId)];

    if (!rolimonsItem) {
      return new Response(
        JSON.stringify({ success: false, error: 'Item is not a limited or not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Fetch thumbnail
    let thumbnailUrl = '';
    try {
      const thumbResponse = await fetch(
        `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png&isCircular=false`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (thumbResponse.ok) {
        const thumbData = await thumbResponse.json();
        thumbnailUrl = thumbData.data?.[0]?.imageUrl || '';
      }
    } catch (e) {
      console.error('Failed to fetch thumbnail:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        assetId: Number(assetId),
        name: rolimonsItem.name,
        rap: rolimonsItem.rap,
        value: rolimonsItem.value,
        price: 0,
        isLimited: true,
        thumbnailUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching item:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
