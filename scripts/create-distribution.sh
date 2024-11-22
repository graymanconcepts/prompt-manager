#!/bin/bash

# Script to create a distribution package of the Prompt Manager application

# Configuration
DIST_DIR="prompt-manager-dist"
PACKAGE_NAME="prompt-manager"
ZIP_NAME="prompt-manager-production.zip"
VERSION=$(node -p "require('../package.json').version")

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
print_status() {
    echo -e "${BLUE}=> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Cleanup any existing distribution
if [ -d "$DIST_DIR" ]; then
    print_status "Cleaning up existing distribution directory..."
    rm -rf "$DIST_DIR"
fi

if [ -f "$ZIP_NAME" ]; then
    print_status "Removing existing zip file..."
    rm -f "$ZIP_NAME"
fi

# Create distribution directory structure
print_status "Creating distribution directory structure..."
mkdir -p "$DIST_DIR/$PACKAGE_NAME"

# Copy required files
print_status "Copying required files..."
FILES_TO_COPY=(
    "Dockerfile.prod"
    "docker-compose.prod.yml"
    "package.json"
    "package-lock.json"
    "src"
    "server"
    ".dockerignore"
)

for file in "${FILES_TO_COPY[@]}"; do
    if [ -e "$file" ]; then
        cp -r "$file" "$DIST_DIR/$PACKAGE_NAME/"
        print_success "Copied $file"
    else
        echo "Warning: $file not found, skipping..."
    fi
done

# Create README file
print_status "Creating README.md..."
cat > "$DIST_DIR/$PACKAGE_NAME/README.md" << 'EOL'
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
EOL

print_success "Created README.md"

# Create zip file
print_status "Creating distribution package..."
(cd "$DIST_DIR" && zip -r "../$ZIP_NAME" .)
print_success "Created $ZIP_NAME"

# Cleanup
print_status "Cleaning up temporary files..."
rm -rf "$DIST_DIR"
print_success "Removed temporary directory"

print_success "Distribution package created successfully!"
echo -e "${GREEN}Package: $ZIP_NAME${NC}"
echo -e "${GREEN}Version: $VERSION${NC}"
