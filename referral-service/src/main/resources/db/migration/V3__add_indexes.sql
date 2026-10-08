CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_receiving_doctor ON referrals(receiving_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_doctor ON referrals(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_sla_deadline ON referrals(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_saga_log_referral_id ON saga_log(referral_id);
