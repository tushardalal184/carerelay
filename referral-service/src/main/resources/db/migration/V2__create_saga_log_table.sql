CREATE TABLE IF NOT EXISTS saga_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_status VARCHAR(30) NOT NULL CHECK (step_status IN ('STARTED', 'SUCCEEDED', 'FAILED', 'COMPENSATED')),
    payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
