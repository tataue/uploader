# Uploader

A full-stack file upload and management application built with NestJS and React.

## Features

- **File Upload**: Secure and efficient file uploading.
- **Batch Download**: Download multiple files simultaneously.
- **File Management**: View, organize, and manage uploaded files.
- **API Documentation**: Integrated API docs for backend endpoints.
- **Modern UI**: Clean interface built with React and Tailwind CSS.

## Tech Stack

- **Backend**: NestJS, Multer (File handling)
- **Frontend**: React, Vite, Tailwind CSS, Lucide React (Icons)
- **Package Manager**: pnpm (Workspaces)

## Prerequisites

- Node.js >= 18.0.0
- pnpm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tataue/uploader.git
cd uploader
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Setup

**Backend**
Copy the example environment file in `packages/nestjs`:
```bash
cp packages/nestjs/.env.example packages/nestjs/.env
```
(Adjust configuration as needed)

**Frontend**
Check `packages/react-app` for environment configurations if necessary.

### 4. Running the Application

Start both backend and frontend in development mode:

```bash
pnpm run start
```
Or run them individually:

**Backend (Port 3001)**
```bash
cd packages/nestjs
pnpm run start:dev
```

**Frontend**
```bash
cd packages/react-app
pnpm run start
```

## Docker

Run the application using Docker:

```bash
docker run --rm -dt -p 8000:3000 -v $HOME/upload:/app/client/uploads zyfyy/nestapp
```

## Project Structure

- `packages/nestjs`: Backend API service
- `packages/react-app`: Frontend React application
