-- Create table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  avatar TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for snipe feeds
CREATE TABLE public.snipe_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_thumbnail TEXT,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access (everyone can see chats)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snipe_feeds ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can read chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

-- Anyone can read snipe feeds
CREATE POLICY "Anyone can read snipe feeds" 
ON public.snipe_feeds 
FOR SELECT 
USING (true);

-- Only allow inserts (no auth check since admin handles this)
CREATE POLICY "Allow insert chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow insert snipe feeds" 
ON public.snipe_feeds 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.snipe_feeds;
