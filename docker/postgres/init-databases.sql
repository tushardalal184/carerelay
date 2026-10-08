-- Create separate databases for each microservice (Database-per-Service pattern)
CREATE DATABASE auth_db;
CREATE DATABASE referral_db;
CREATE DATABASE patient_record_db;
CREATE DATABASE notification_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE referral_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE patient_record_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO postgres;
