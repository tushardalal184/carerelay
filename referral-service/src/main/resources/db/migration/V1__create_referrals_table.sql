CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    referring_doctor_id UUID NOT NULL,
    receiving_doctor_id UUID NOT NULL,
    referring_department VARCHAR(100) NOT NULL,
    receiving_department VARCHAR(100) NOT NULL,
    reason TEXT,
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('ROUTINE', 'URGENT', 'EMERGENCY')),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    saga_step VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
    sla_deadline TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
