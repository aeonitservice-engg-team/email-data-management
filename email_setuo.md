# Email Collection System - MySQL Setup Documentation

**Date**: January 2, 2026  
**Server**: AWS EC2 (colloquys.com)  
**Database**: MariaDB  
**Application**: Next.js on Netlify

---

## 1. AWS EC2 Security Group Configuration

### Open MySQL Port (3306)

1. Go to **AWS Console** → **EC2** → **Instances**
2. Select your instance running colloquys.com
3. Click **Security** tab → Click the **Security Group** link
4. Click **Edit inbound rules**
5. Click **Add rule**:
   - **Type**: MySQL/Aurora
   - **Protocol**: TCP
   - **Port**: 3306
   - **Source**: `0.0.0.0/0` (or restrict to specific IPs for production)
   - **Description**: MySQL remote access for Next.js
6. Click **Save rules**

---

## 2. MariaDB Configuration for Remote Access

### Step 2.1: SSH into EC2

```bash
ssh -i your-key.pem ubuntu@colloquys.com

Step 2.2: Find and Edit Config File

# Check which config files exist
ls /etc/my.cnf.d/
ls /etc/mysql/mariadb.conf.d/

# Edit the server config (use whichever exists on your system)
sudo nano /etc/my.cnf.d/server.cnf
# OR
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
# OR
sudo nano /etc/my.cnf

Step 2.3: Add bind-address Configuration
Add these lines under the  mysqld  or  server  section:
[mysqld]
bind-address = 0.0.0.0
skip-name-resolve

Save:  Ctrl+X , then  Y , then  Enter 
Step 2.4: Restart MariaDB

sudo systemctl restart mariadb

# Verify it's running
sudo systemctl status mariadb

# Verify MariaDB is listening on all interfaces
sudo netstat -tlnp | grep 3306
# Should show: tcp  0  0  0.0.0.0:3306  (not 127.0.0.1:3306)

3. Create Database User with Remote Access
Step 3.1: Login to MariaDB

sudo mariadb
# OR if password required:
sudo mariadb -u root -p

Step 3.2: Create Database and User

-- Create database
CREATE DATABASE IF NOT EXISTS email_contacts_db 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user for remote access (NOT root!)
CREATE USER 'email_app'@'%' IDENTIFIED BY 'YourStrongPassword123!';

-- Grant permissions to email database only
GRANT ALL PRIVILEGES ON email_contacts_db.* TO 'email_app'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify user created with '%' host
SELECT user, host FROM mysql.user WHERE user='email_app';
-- Expected output: email_app | %


