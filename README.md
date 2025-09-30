**Group3_Campus_Marketplace**

# Project Setup Guide

This README explains how to set up the project locally.  
It is written so that a **new contributor** can get the backend (`/api`) and frontend (`/web`) running in under **10 minutes**.

## Prerequisites

Before you start, install the following:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)  
  👉 Used to run both backend and frontend.  
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)  
  👉 For installing dependencies.  
- [PostgreSQL](https://www.postgresql.org/)  
  👉 Required database for backend. Can be installed locally or run via Docker.  
- [Git](https://git-scm.com/)  
  👉 To clone and manage the repository.  

## Clone the Repository

```bash
# Clone the project
git clone <your-repo-url>

# Move into the project folder
cd <repo-name>

## Install Dependencies

# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../web
npm install

## Environment Setup
We use .env files to store environment variables.
Example files are already provided as .env.example.

**Step 1: Copy the example files -**
macOS:
cp api/.env.example api/.env
cp web/.env.example web/.env

Windows:
copy api\.env.example api\.env
copy web\.env.example web\.env

**Step 2: Update values**
Open api/.env and update:

DATABASE_URL → your local Postgres connection string.

JWT_ACCESS_SECRET / JWT_REFRESH_SECRET → generate strong random strings.

SMTP values if email is needed.

Open web/.env and confirm:

VITE_API_BASE_URL=http://localhost:3000

## Running the Apps
Open two terminals (one for API, one for Web).

Terminal 1 – Start backend (API):
cd api
npm run dev

Terminal 2 – Start frontend (Web):
cd web
npm run dev

## Common Issues

Port already in use
Stop other processes on 3000 or 5173, then retry.

Database connection failed
Ensure PostgreSQL is running and DATABASE_URL is correct.

Node modules error
Delete old modules and reinstall:

rm -rf node_modules package-lock.json
npm install
