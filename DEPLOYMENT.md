# Prompt Manager Deployment Guide

This guide provides instructions for deploying the Prompt Manager application in various environments.

## Prerequisites

- Docker Engine 20.10.0 or later
- Docker Compose v2.0.0 or later
- 1GB RAM minimum (2GB recommended)
- 10GB disk space minimum

## Quick Start

```bash
# Clone the repository
git clone [your-repo-url]
cd prompt-manager

# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d
```

The application will be available at `http://localhost:3001`

## Deployment Options

### 1. Local Production Deployment

```bash
# Build and start with default settings
docker-compose -f docker-compose.prod.yml up -d

# Or with custom port
PORT=8080 docker-compose -f docker-compose.prod.yml up -d
```

### 2. Cloud Provider Deployment

#### Generic Cloud Steps:

1. Build the production image:
   ```bash
   docker build -f Dockerfile.prod -t prompt-manager:v1.0.0 .
   ```

2. Tag for your registry:
   ```bash
   docker tag prompt-manager:v1.0.0 your-registry/prompt-manager:v1.0.0
   ```

3. Push to registry:
   ```bash
   docker push your-registry/prompt-manager:v1.0.0
   ```

#### Common Cloud Platforms

- **AWS Elastic Container Service (ECS)**:
  - Use the provided Dockerfile.prod
  - Configure ECS Task Definition with:
    - Container port: 3001
    - Volume mount for `/app/data`
    - Health check endpoint: `/api/prompts`

- **Google Cloud Run**:
  - Deploy using:
  ```bash
  gcloud run deploy prompt-manager \
    --image your-registry/prompt-manager:v1.0.0 \
    --port 3001 \
    --memory 1Gi \
    --allow-unauthenticated
  ```

- **Digital Ocean App Platform**:
  - Use the `docker-compose.prod.yml` as reference
  - Configure persistent volume for `/app/data`

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Application port | 3001 | No |
| NODE_ENV | Environment | production | Yes |
| DB_PATH | Database location | /app/data | Yes |

## Data Persistence

The application uses a SQLite database stored in a Docker volume. To manage data:

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec app \
  sqlite3 /app/data/prompts.db ".backup '/app/data/backup.db'"

# Copy backup locally
docker cp prompt-manager-prod-app-1:/app/data/backup.db ./backups/
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backups/backup.db prompt-manager-prod-app-1:/app/data/

# Restore backup
docker-compose -f docker-compose.prod.yml exec app \
  sqlite3 /app/data/prompts.db ".restore '/app/data/backup.db'"
```

## Health Monitoring

The application includes built-in health checks:

- Health check endpoint: `http://localhost:3001/api/prompts`
- Docker health check interval: 30s
- Timeout: 10s
- Retries: 3

Monitor container health:
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## Security Considerations

1. **Port Exposure**:
   - Only expose port 3001 if needed
   - Use reverse proxy for SSL termination

2. **Data Protection**:
   - Regular database backups
   - Secure volume permissions
   - Non-root container user

3. **Updates**:
   - Regularly update base image
   - Monitor for dependency updates

## Troubleshooting

1. **Container won't start**:
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

2. **Database issues**:
   ```bash
   # Check volume
   docker volume inspect prompt-manager-prod-data
   ```

3. **Permission issues**:
   ```bash
   # Reset permissions
   docker-compose -f docker-compose.prod.yml exec app \
     chown -R appuser:appgroup /app/data
   ```

## Maintenance

### Regular Updates

```bash
# Pull latest changes
git pull

# Rebuild with latest changes
docker-compose -f docker-compose.prod.yml up -d --build
```

### Log Management

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Clear logs
docker-compose -f docker-compose.prod.yml down
docker system prune -f
```

## Support

For issues and support:
- Check container logs
- Verify environment variables
- Ensure volume permissions
- Check disk space and system resources

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Production Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [SQLite Backup Documentation](https://sqlite.org/backup.html)
