#!/bin/bash
# EC2 Deployment Script for TPRM Training Tool
# Run this script ON the EC2 instance after uploading the tprm-tool folder

set -e

echo "=========================================="
echo "TPRM Tool - EC2 Deployment Script"
echo "=========================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo bash deploy-ec2.sh"
    exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS"
    exit 1
fi

echo "Detected OS: $OS"

# Install Docker
echo ""
echo "Installing Docker..."
if [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get update
    apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
else
    echo "Unsupported OS: $OS"
    exit 1
fi

# Add current user to docker group
CURRENT_USER=${SUDO_USER:-$USER}
usermod -aG docker $CURRENT_USER

echo "Docker installed successfully!"

# Build and run the container
echo ""
echo "Building TPRM Tool Docker image..."
docker build -t tprm-tool .

# Stop existing container if running
docker stop tprm 2>/dev/null || true
docker rm tprm 2>/dev/null || true

echo ""
echo "Starting TPRM Tool container..."
docker run -d \
    -p 8888:8888 \
    --name tprm \
    -e SESSION_SECRET="tprm-training-$(date +%s)" \
    -e NODE_ENV=production \
    -e PORT=8888 \
    --restart unless-stopped \
    tprm-tool

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Access your TPRM Tool at:"
echo "  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR-EC2-IP'):8888"
echo ""
echo "Make sure your EC2 Security Group allows inbound traffic on port 8888"
echo ""
echo "Useful commands:"
echo "  View logs:     docker logs tprm"
echo "  Stop app:      docker stop tprm"
echo "  Start app:     docker start tprm"
echo "  Restart app:   docker restart tprm"
echo ""
