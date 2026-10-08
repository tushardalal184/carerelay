-- Pre-seeded test accounts for instant development (Password for all: 'password123')
-- BCrypt hash for 'password123': $2a$10$wT37tB6R3mE1h/a64QvHte5c56lY.vC5xY4d5sVw45kS8u7bZz9C6

INSERT INTO users (id, email, password_hash, first_name, last_name, role, department, is_active, created_at)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'dr.alice@hospital.org', '$2a$10$7zVn2qg6Yq89t5XJk21KweHhE6xWjF3bFpU1a3uDqMhH1cM4YyJ8a', 'Alice', 'Smith', 'DOCTOR', 'Cardiology', true, NOW()),
    ('a0000000-0000-0000-0000-000000000002', 'dr.bob@hospital.org', '$2a$10$7zVn2qg6Yq89t5XJk21KweHhE6xWjF3bFpU1a3uDqMhH1cM4YyJ8a', 'Bob', 'Johnson', 'DOCTOR', 'Neurology', true, NOW()),
    ('a0000000-0000-0000-0000-000000000003', 'nurse.carol@hospital.org', '$2a$10$7zVn2qg6Yq89t5XJk21KweHhE6xWjF3bFpU1a3uDqMhH1cM4YyJ8a', 'Carol', 'Davis', 'NURSE', 'Cardiology', true, NOW()),
    ('a0000000-0000-0000-0000-000000000004', 'admin.sarah@hospital.org', '$2a$10$7zVn2qg6Yq89t5XJk21KweHhE6xWjF3bFpU1a3uDqMhH1cM4YyJ8a', 'Sarah', 'Connor', 'ADMIN', 'Hospital Operations', true, NOW())
ON CONFLICT (email) DO NOTHING;
