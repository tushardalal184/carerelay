# 🏥 CareRelay — Clinical Handoff & Patient Referral Coordination Platform

A production-grade, distributed microservices platform demonstrating the **Saga Pattern**, **Apache Kafka** event-driven messaging, **Spring Cloud Gateway**, **Resilience4j**, and an **AI clinical summarization layer**.

Built by **Tushar Dalal** as a showcase project for Master's in Computer Science admissions (PoliMi, Sapienza, Bologna).

---

## 💡 100% Free Resources Architecture

Everything in this project runs **100% locally with zero cloud or API costs**:
- **PostgreSQL 16 (Alpine)**: Local Docker container with schema isolation per microservice.
- **Apache Kafka (KRaft mode)**: Local Docker container without heavy Zookeeper dependencies.
- **Service Discovery & Gateway**: Open-source Netflix Eureka + Spring Cloud Gateway.
- **AI Insights Layer**: Includes a built-in deterministic clinical summarizer mock (0 tokens, $0 cost) + optional support for Claude API if an API key is provided.
- **100% Java (Java 21 LTS)**: Built using pure Java across all 7 backend services.

---

## 🏗️ System Architecture & Services

| Service | Port | Database | Primary Responsibility |
|---|---|---|---|
| **Eureka Server** | `8761` | None | Service Registry & Discovery Dashboard |
| **API Gateway** | `8080` | None | JWT Verification, Dynamic Routing, CORS |
| **Auth Service** | `8085` | `auth_db` | Registration, Login, JWT Token Issuance, RBAC |
| **Referral Service** | `8081` | `referral_db` | Referral Lifecycle, Saga Orchestrator, SLA Tracking |
| **Patient Record Service** | `8082` | `patient_record_db` | Patient Demographics, Medical Records, Transfer Packages |
| **Notification Service** | `8083` | `notification_db` | Event Consumers, In-App Notification Feed |
| **AI Insights Service** | `8084` | None | Safe Retrieval & Clinical Handoff Summarization |

---

## 🚀 Quickstart Guide

### 1. Start Infrastructure (Docker)
Ensure Docker Desktop is running, then start PostgreSQL and Kafka:
```powershell
docker compose up -d
```

### 2. Build & Package Entire Backend
From the root `projects/carerelay` directory:
```powershell
mvn clean package -DskipTests
```
*(Builds and packages all 7 microservices into runnable JARs in ~25 seconds)*

### 3. Run Microservices

Run each service in a terminal tab:

```powershell
# Tab 1: Service Registry (Eureka)
cd eureka-server && mvn spring-boot:run
# Dashboard: http://localhost:8761

# Tab 2: API Gateway
cd api-gateway && mvn spring-boot:run
# Gateway: http://localhost:8080

# Tab 3: Auth Service
cd auth-service && mvn spring-boot:run
# Port: 8085

# Tab 4: Referral Service (Saga Orchestrator)
cd referral-service && mvn spring-boot:run
# Port: 8081

# Tab 5: Patient Record Service
cd patient-record-service && mvn spring-boot:run
# Port: 8082

# Tab 6: Notification Service
cd notification-service && mvn spring-boot:run
# Port: 8083

# Tab 7: AI Insights Service
cd ai-insights-service && mvn spring-boot:run
# Port: 8084
```

---

## 🔑 Pre-Seeded Test Data

### 1. Staff Accounts (Password for all: `password123`)
* `dr.alice@hospital.org` — Role: `DOCTOR` (Cardiology)
* `dr.bob@hospital.org` — Role: `DOCTOR` (Neurology)
* `nurse.carol@hospital.org` — Role: `NURSE` (Cardiology)
* `admin.sarah@hospital.org` — Role: `ADMIN` (Hospital Operations)

### 2. Pre-Seeded Patient
* **MRN-78491**: Eleanor Vance (Age: 44, Allergies: Penicillin, Latex)
  * Diagnosis: Persistent Atrial Fibrillation
  * Lab: Complete Metabolic Panel (Creatinine 1.1 mg/dL, Troponin negative)
  * Rx: Metoprolol 50mg daily

---

## 🧪 End-to-End Referral Workflow Test

All requests can be routed directly through the **API Gateway** (`http://localhost:8080`):

### Step 1: Login as Doctor
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.alice@hospital.org","password":"password123"}'
```
*(Extract the returned `token` from the JSON response)*

### Step 2: Create a Referral (Triggers Saga Step 1)
```bash
curl -X POST http://localhost:8080/api/v1/referrals \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "b0000000-0000-0000-0000-000000000001",
    "receivingDoctorId": "a0000000-0000-0000-0000-000000000002",
    "referringDepartment": "Cardiology",
    "receivingDepartment": "Neurology",
    "reason": "Evaluation of recurrent syncope episodes",
    "urgency": "URGENT",
    "notes": "Patient Afib stabilized. Please evaluate for neurological etiology."
  }'
```

### Step 3: Accept Referral (Triggers Saga Step 2 & 3)
```bash
curl -X PUT http://localhost:8080/api/v1/referrals/<REFERRAL_ID>/accept \
  -H "Authorization: Bearer <TOKEN>"
```

### Step 4: Confirm Clinical Handoff (Triggers Saga Step 4)
```bash
curl -X PUT http://localhost:8080/api/v1/referrals/<REFERRAL_ID>/confirm \
  -H "Authorization: Bearer <TOKEN>"
```

### Step 5: Generate AI Clinical Handoff Briefing (100% Free / Local Engine)
```bash
curl -X POST http://localhost:8080/api/v1/ai/handoff-summary/<REFERRAL_ID> \
  -H "Authorization: Bearer <TOKEN>"
```
