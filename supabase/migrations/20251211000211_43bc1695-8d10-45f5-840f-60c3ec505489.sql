-- Add delete policies for both tables
CREATE POLICY "Allow delete chat messages"
ON public.chat_messages
FOR DELETE
USING (true);

CREATE POLICY "Allow delete snipe feeds"
ON public.snipe_feeds
FOR DELETE
USING (true);
