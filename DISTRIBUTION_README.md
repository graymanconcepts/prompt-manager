# Prompt Manager - Docker Production Setup

## Prerequisites
- Docker Engine 20.10.0 or later
- Docker Compose v2.0.0 or later
- 1GB RAM minimum (2GB recommended)
- 10GB disk space minimum

## Quick Start

1. Extract the zip file contents to your desired location

2. Navigate to the directory:
```bash
cd prompt-manager
```

3. Build and start the application:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. Access the application at:
```
http://localhost:3001
```

## Stopping the Application

To stop the application:
```bash
docker-compose -f docker-compose.prod.yml down
```

Note: Add `-v` flag to also remove persistent data:
```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

If port 3001 is already in use, you can modify the port in docker-compose.prod.yml or set the PORT environment variable:
```bash
PORT=3002 docker-compose -f docker-compose.prod.yml up -d
```
