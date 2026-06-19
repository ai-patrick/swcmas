# SWCMAS Deployment Guide

This guide covers deploying the AI-Powered Smart Waste Compliance, Monitoring and Analytics System (SWCMAS) using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- (Optional) Registered domain and SSL certificates for production

## Deployment via Docker Compose

The simplest way to deploy the entire stack (Frontend, Backend, and MongoDB) is using the provided `docker-compose.yml`.

### 1. Configure Environment Variables

Before starting the containers, update the `docker-compose.yml` environment variables under the `backend` service, specifically:
- `JWT_SECRET`: Generate a strong, secure random string.
- `DEEPSEEK_API_KEY`: Your DeepSeek API key for AI features.
- Email configuration (`EMAIL_HOST`, `EMAIL_USER`, etc.) for notifications.

### 2. Start the Stack

Run the following command from the root of the project directory where `docker-compose.yml` is located:

```bash
docker-compose up -d --build
```

This command will:
1. Build the Node.js backend container.
2. Build the React frontend (Vite) and serve it statically via Nginx.
3. Pull and start a MongoDB instance.
4. Wire everything together on an internal Docker network (`swcmas-network`).

### 3. Verify Deployment

Check the status of the containers:
```bash
docker-compose ps
```

You can view the logs if something fails:
```bash
docker-compose logs -f
```

### 4. Seeding the Database (Initial Run Only)

On a fresh deployment, you will want to populate the database with the initial setup (admin users, demo apartments, sample data).
Run the seed script inside the backend container:

```bash
docker-compose exec backend npm run seed
```

This will clear the database and inject comprehensive demo data spanning users, apartments, collections, and complaints.

### 5. Access the Application

- **Frontend Application**: `http://localhost:80` (or your server's IP/Domain)
- **Backend API**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000/api-docs`

---

## Architecture Overview

- **Frontend**: Served via Nginx on port `80`. Nginx handles the SPA routing fallback to `index.html`.
- **Backend**: Runs on port `5000`. Internally scheduled cron jobs (e.g., Anomaly Detections, Collection Scheduler) run automatically.
- **Database**: MongoDB instance running on port `27017` with persistent volumes mounted to preserve data across restarts.

## Production Considerations

- **Reverse Proxy / SSL**: It is highly recommended to place the entire `docker-compose` setup behind a reverse proxy like Nginx or Traefik to handle SSL termination (HTTPS) before traffic hits the application containers.
- **Database Security**: Add authentication to the MongoDB instance and update the `MONGO_URI` in `docker-compose.yml` accordingly.
- **Data Backup**: Setup cron jobs on the host machine to backup the `swcmas-data` docker volume periodically.
