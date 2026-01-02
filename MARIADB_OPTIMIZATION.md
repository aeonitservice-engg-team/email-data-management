# MariaDB Performance Optimization Guide for EC2

## Quick Optimizations (Immediate - Run These First)

### 1. Connect to your EC2 MariaDB instance:
```bash
mysql -u root -p
```

### 2. Run these optimization commands:
```sql
-- Increase buffer sizes for better write performance
SET GLOBAL innodb_buffer_pool_size = 1073741824;  -- 1GB (adjust based on your RAM)
SET GLOBAL innodb_log_file_size = 268435456;      -- 256MB
SET GLOBAL innodb_log_buffer_size = 16777216;     -- 16MB

-- Optimize for bulk inserts
SET GLOBAL bulk_insert_buffer_size = 268435456;   -- 256MB
SET GLOBAL max_allowed_packet = 67108864;         -- 64MB

-- Increase connection limits
SET GLOBAL max_connections = 200;

-- Optimize write performance
SET GLOBAL innodb_flush_log_at_trx_commit = 2;    -- Faster, slightly less durable
SET GLOBAL innodb_flush_method = O_DIRECT;

-- Show current settings
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_allowed_packet';
```

### 3. Temporary optimizations during large imports:
```sql
-- Before import
SET autocommit = 0;
SET unique_checks = 0;
SET foreign_key_checks = 0;
SET sql_log_bin = 0;

-- After import (IMPORTANT - re-enable these!)
SET autocommit = 1;
SET unique_checks = 1;
SET foreign_key_checks = 1;
SET sql_log_bin = 1;
```

---

## Permanent Configuration Changes

### Edit MariaDB configuration file on EC2:
```bash
# SSH into your EC2 instance
ssh your-ec2-user@your-ec2-ip

# Edit the configuration file
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
# OR
sudo nano /etc/my.cnf
```

### Add/modify these settings under [mysqld]:
```ini
[mysqld]
# Connection Settings
max_connections = 200
connect_timeout = 10
wait_timeout = 600
interactive_timeout = 600

# Buffer Settings (adjust based on available RAM)
innodb_buffer_pool_size = 1G              # 50-70% of RAM for dedicated DB server
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
innodb_write_io_threads = 4
innodb_read_io_threads = 4

# Query Cache (MariaDB 10.5 and below)
query_cache_size = 64M
query_cache_type = 1
query_cache_limit = 2M

# Bulk Insert
bulk_insert_buffer_size = 256M
max_allowed_packet = 64M

# Performance Schema
performance_schema = OFF                   # Disable if not needed

# InnoDB Optimizations
innodb_flush_log_at_trx_commit = 2        # 0=fastest, 1=safest, 2=balanced
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
innodb_doublewrite = 0                     # Disable for faster writes (less safe)

# Thread Cache
thread_cache_size = 50

# Table Cache
table_open_cache = 2000
table_definition_cache = 1000

# Slow Query Log (for monitoring)
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
```

### Restart MariaDB after configuration changes:
```bash
sudo systemctl restart mariadb
# OR
sudo systemctl restart mysql
```

---

## For Your Application (.env.local optimization)

Update your DATABASE_URL with these connection pool parameters:
```env
DATABASE_URL="mysql://username:password@ec2-host:3306/database?connection_limit=10&pool_timeout=20&connect_timeout=10&socket_timeout=60"
```

---

## Performance Testing

### Test connection speed:
```sql
SELECT BENCHMARK(1000000, 1+1);
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Innodb_buffer_pool%';
```

### Monitor during import:
```bash
# In another terminal, monitor MySQL process
watch -n 1 'mysql -u root -p -e "SHOW PROCESSLIST;"'
```

---

## Expected Performance Improvements

**Before optimization:** 8 seconds for 1000 records  
**After optimization:** 1-2 seconds for 1000 records  
**Best case:** 0.5-1 second for 1000 records

---

## Important Notes

1. **RAM-based settings**: Adjust `innodb_buffer_pool_size` based on your EC2 instance RAM:
   - t2.micro (1GB RAM): 512M
   - t2.small (2GB RAM): 1G
   - t2.medium (4GB RAM): 2G
   - t3.medium (4GB RAM): 2.5G

2. **Safety vs Speed**:
   - `innodb_flush_log_at_trx_commit = 2` is faster but less durable
   - For production, consider using `1` (safest) or `2` (balanced)
   - `0` is fastest but can lose up to 1 second of transactions

3. **Monitoring**: Watch MySQL logs for errors:
   ```bash
   sudo tail -f /var/log/mysql/error.log
   ```

4. **Backup before changes**: Always backup your config:
   ```bash
   sudo cp /etc/mysql/mariadb.conf.d/50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf.backup
   ```

---

## Quick Test Script

Create this file to test import speed:
```bash
#!/bin/bash
echo "Testing import performance..."
time mysql -u your_user -p your_database < test_import.sql
```

---

## Rollback if needed

If something goes wrong:
```bash
sudo cp /etc/mysql/mariadb.conf.d/50-server.cnf.backup /etc/mysql/mariadb.conf.d/50-server.cnf
sudo systemctl restart mariadb
```
