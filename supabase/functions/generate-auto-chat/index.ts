import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_USERNAMES = [
  '00nlylexx',
  'JUST_KKE',
  'lyicals',
  'epetted',
  'Lowrises',
  'WHENDOESTHEPARTYSTOP'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { recentMessages } = await req.json();

    // Get recent active users to avoid - simulate some being "AFK"
    const recentActiveUsers = recentMessages?.slice(-4).map((m: any) => m.username) || [];
    
    // Pick 1 user, preferring someone who hasn't spoken recently (simulates different people being active)
    const availableUsers = ALLOWED_USERNAMES.filter(u => !recentActiveUsers.includes(u));
    const userPool = availableUsers.length > 0 ? availableUsers : ALLOWED_USERNAMES;
    const selectedUser = userPool[Math.floor(Math.random() * userPool.length)];

    // Check if we should respond to someone or start fresh topic
    const shouldReply = recentMessages && recentMessages.length > 0 && Math.random() > 0.3;
    const lastMessage = recentMessages?.[recentMessages.length - 1];

    const systemPrompt = `You're ${selectedUser} in a chill Roblox trading group chat. Be natural and subtle.

STYLE:
- lowercase, minimal punctuation
- short messages (4-12 words usually)
- abbreviations sometimes: ngl, fr, tbh, lol, idk
- don't force slang, be natural
- sometimes just agree or react simply

${shouldReply && lastMessage ? `
You're replying to ${lastMessage.username} who said: "${lastMessage.message}"
- respond naturally to what they said
- can agree, disagree, add info, or ask followup
- reference their point casually
` : `
Start a new topic casually like you just got on:
- ask a quick question about an item
- share something you noticed about prices
- mention something happening in trading
`}

GOOD EXAMPLES:
- "yeah fr the valk market is weird rn"
- "wait really? i thought it was still stable"
- "anyone trading korblox btw"
- "just checked and headless dropped again lol"
- "idk man demand seems fine to me"

Output ONLY the message, no quotes.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the chat message.' }
        ],
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    // Clean up
    content = content.trim().replace(/^["']|["']$/g, '').replace(/^.*?:\s*/, '');
    
    const messages = [];
    if (content && content.length > 2) {
      messages.push({ username: selectedUser, message: content });
    }

    return new Response(JSON.stringify({ messages }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating auto chat:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
