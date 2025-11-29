# Green Shield – server

**AI-Powered Plant Disease Detection for Smart Agriculture**  
An intelligent mobile + backend system that helps farmers instantly detect maize (corn) leaf diseases using smartphone photos, powered by deep learning and real-time image analysis.

This repository contains the **backend server** (Node.js + TypeScript + Express + Prisma) for the **Green Shield** project — a 5-week capstone initiative started on November 17, 2025.

### Core Features

- Leaf image upload & processing (`multipart/form-data`)
- AI inference endpoint (integrates with TensorFlow Lite / Python model)
- Disease identification with confidence score & severity
- Bilingual (English + Arabic) disease & treatment database
- RESTful API with clean, testable architecture (`app.ts` / `server.ts` split)
- Ready for mobile app integration (React Native)

### Dataset

Built exclusively on:  
[Corn or Maize Leaf Disease Dataset – Kaggle](https://www.kaggle.com/datasets/smaranjitghose/corn-or-maize-leaf-disease-dataset)  
Classes: `Healthy`, `Common Rust`, `Gray Leaf Spot`, `Blight`

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **File Upload**: Multer
- **Authentication**: JWT (ready, optional in MVP)
- **Architecture**: TDD-ready (`app.ts` separated from `server.ts` for Jest + Supertest)
- **Deployment**: Render / Railway (free tier)

## Folder Structure

```text
├── prisma/
|   └── schema.prisma           → Database schema (User, Disease, Prediction, etc.)
├──src/
|   ├── app.ts                  → Express app (testable with Jest)
|   ├── server.ts               → Server startup only (ignored in tests)
|   ├── controllers/            → Request handlers
|   ├── routes/                 → API route definitions
|   ├── middleware/             → asyncWrapper, errorHandler, upload
|   ├── services/               → Business logic (auth, prediction)
|   ├── utils/                  → JWT, hash, response helpers
|   ├── seed/diseases.seed.ts   → Seeds 4 maize diseases + Arabic info
|   ├── generated/prisma/       → Auto-generated Prisma client
|   └── schema.prisma           → Full database schema (User, Disease, Prediction, etc.)

```

## How to Setup Instructions

```bash
# 1. Clone repo
git clone https://github.com/Ahmed3zzeldeen/green-shield-server.git
cd green-shield-server

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env → add your DATABASE_URL and JWT_SECRET

# 4. Run migrations
npx prisma migrate dev

# 5. Run generation (after each migration)
npx prisma generate

# 6. Seed maize diseases (with Arabic translations)
npx tsx src/seed/diseases.seed.ts

# 7. Start development server
npm run dev
```
