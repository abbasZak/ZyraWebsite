
-- Liquidity positions
CREATE TABLE public.liquidity_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pair TEXT NOT NULL,
  token_a_amount NUMERIC NOT NULL DEFAULT 0,
  token_b_amount NUMERIC NOT NULL DEFAULT 0,
  lp_tokens NUMERIC NOT NULL DEFAULT 0,
  pool_share NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.liquidity_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own positions" ON public.liquidity_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create positions" ON public.liquidity_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own positions" ON public.liquidity_positions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own positions" ON public.liquidity_positions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_liquidity_positions_updated_at BEFORE UPDATE ON public.liquidity_positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stakes
CREATE TABLE public.stakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  apr NUMERIC NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  rewards_earned NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stakes" ON public.stakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create stakes" ON public.stakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stakes" ON public.stakes FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_stakes_updated_at BEFORE UPDATE ON public.stakes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Governance proposals
CREATE TABLE public.governance_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id TEXT NOT NULL UNIQUE,
  author_id UUID NOT NULL,
  author_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  votes_for BIGINT NOT NULL DEFAULT 0,
  votes_against BIGINT NOT NULL DEFAULT 0,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposals" ON public.governance_proposals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create proposals" ON public.governance_proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their proposals" ON public.governance_proposals FOR UPDATE USING (auth.uid() = author_id);

CREATE TRIGGER update_governance_proposals_updated_at BEFORE UPDATE ON public.governance_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Governance votes
CREATE TABLE public.governance_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  proposal_id UUID NOT NULL REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  vote_direction TEXT NOT NULL CHECK (vote_direction IN ('for', 'against')),
  voting_power BIGINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, proposal_id)
);

ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.governance_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.governance_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to update proposal vote counts on new vote
CREATE OR REPLACE FUNCTION public.update_proposal_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vote_direction = 'for' THEN
    UPDATE governance_proposals SET votes_for = votes_for + NEW.voting_power WHERE id = NEW.proposal_id;
  ELSE
    UPDATE governance_proposals SET votes_against = votes_against + NEW.voting_power WHERE id = NEW.proposal_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_cast AFTER INSERT ON public.governance_votes FOR EACH ROW EXECUTE FUNCTION public.update_proposal_votes();

-- Enable realtime for proposals (live vote updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.governance_proposals;
