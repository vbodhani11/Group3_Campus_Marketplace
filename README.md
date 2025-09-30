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
#Clone the project
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

Step 1: Copy the example files
macOS/Linux:

cp api/.env.example api/.env
cp web/.env.example web/.env

Windows (PowerShell):

copy api\.env.example api\.env
copy web\.env.example web\.env

Step 2: Update values
api/.env → fill in DATABASE_URL, JWT secrets, SMTP if needed.

web/.env → confirm VITE_API_BASE_URL=http://localhost:3000.

## Running the Apps
Terminal 1 – Backend:
cd api
npm run dev

Terminal 2 – Frontend:
cd web
npm run dev

API → http://localhost:3000

Web → http://localhost:5173

## Common Issues

Port in use: Stop other processes on 3000 or 5173.

Database error: Ensure Postgres is running and URL is correct.

Node modules issue:
rm -rf node_modules package-lock.json
npm install
