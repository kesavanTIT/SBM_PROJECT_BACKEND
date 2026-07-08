# SBM Backend Project

A Node.js + Express backend service using Prisma ORM with PostgreSQL.

## Features
- **Express App**: Custom global error handling, helmet security headers, cors, and dev logging with morgan.
- **Prisma ORM**: Set up with a PostgreSQL datasource and user schemas.
- **ES Modules**: Modern JavaScript syntax (`import`/`export`) support.
- **Nodemon**: Automatic hot reloading in development.

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- PostgreSQL running locally or in the cloud.

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file from the template (already created for you):
- Open `.env` and replace `DATABASE_URL` with your actual PostgreSQL connection string.

### 4. Database Setup & Migrations
To initialize the database schema and generate the Prisma Client, run:
```bash
# Generate the Prisma client
npm run prisma:generate

# Create database tables and run migrations
npm run prisma:migrate
```

### 5. Running the Application

#### Development Mode (with hot-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm run build # (if any transpilation is added in future)
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Service status check

### Users Resource
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create a new user (JSON body: `{ "email": "user@example.com", "name": "User Name" }`)
- `GET /api/v1/users/:id` - Get user details by ID
