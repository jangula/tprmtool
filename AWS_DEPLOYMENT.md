# AWS EC2 Deployment Guide - TPRM Training Tool

## Quick EC2 Deployment (Recommended)

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Configure:
   - **Name**: `tprm-training`
   - **AMI**: Amazon Linux 2023 (or Ubuntu 22.04)
   - **Instance type**: `t3.small` (sufficient for training)
   - **Key pair**: Create new or select existing
   - **Security Group**: Create new with these rules:
     - SSH (port 22) - Your IP
     - Custom TCP (port 8888) - Anywhere (0.0.0.0/0)

3. Launch the instance

### Step 2: Upload Application

From your local machine, zip and upload the tprm-tool folder:

```bash
# On your Mac/local machine
cd /Users/angula/Desktop/tprm
zip -r tprm-tool.zip tprm-tool

# Upload to EC2 (replace with your key and EC2 IP)
scp -i your-key.pem tprm-tool.zip ec2-user@YOUR-EC2-IP:~/
```

### Step 3: Deploy on EC2

SSH into your EC2 instance and run:

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@YOUR-EC2-IP

# Unzip the application
unzip tprm-tool.zip
cd tprm-tool

# Run the deployment script
sudo bash deploy-ec2.sh
```

### Step 4: Access the Application

Open your browser and go to:
```
http://YOUR-EC2-IP:8888
```

---

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@YOUR-EC2-IP

# Install Docker (Amazon Linux 2023)
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Log out and back in
exit
ssh -i your-key.pem ec2-user@YOUR-EC2-IP

# Upload and extract your app, then:
cd tprm-tool
docker build -t tprm-tool .
docker run -d -p 8888:8888 --name tprm tprm-tool
```

---

## For Training Delegates

Share this with your training participants:

1. Open browser and go to: `http://YOUR-EC2-IP:8888`
2. Click "Register" to create an account
3. Follow the TPRM lifecycle activities:
   - Add a vendor (Onboarding)
   - Complete risk assessment
   - Fill out security questionnaire
   - Log monitoring issues
   - Complete offboarding checklist

---

## Useful Commands

```bash
# View application logs
docker logs tprm

# Stop the application
docker stop tprm

# Start the application
docker start tprm

# Restart the application
docker restart tprm

# Remove and rebuild
docker stop tprm && docker rm tprm
docker build -t tprm-tool .
docker run -d -p 8888:8888 --name tprm tprm-tool
```

---

## After Training - Cleanup

**Important**: Terminate your EC2 instance to avoid charges!

```bash
# On EC2 - stop the container
docker stop tprm

# In AWS Console
# EC2 → Instances → Select instance → Instance State → Terminate
```

---

## Estimated Cost

| Duration | Approximate Cost |
|----------|-----------------|
| 1 hour   | ~$0.02          |
| 8 hours  | ~$0.17          |
| 1 day    | ~$0.50          |

(Based on t3.small in us-east-1)

---

## Troubleshooting

**Can't access the app?**
- Check Security Group allows port 8888
- Verify Docker is running: `docker ps`
- Check logs: `docker logs tprm`

**Connection refused?**
- Wait 30 seconds after starting container
- Check: `curl http://localhost:8888`

**Need to reset the database?**
```bash
docker stop tprm && docker rm tprm
docker run -d -p 8888:8888 --name tprm tprm-tool
```
