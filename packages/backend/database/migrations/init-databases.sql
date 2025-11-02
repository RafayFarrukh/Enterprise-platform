-- Initialize three separate databases for the Enterprise Platform

-- Database 1: SSO/Authentication Service
CREATE DATABASE IF NOT EXISTS `enterprise_sso` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Database 2: User Service
CREATE DATABASE IF NOT EXISTS `enterprise_users` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Database 3: Agency Service  
CREATE DATABASE IF NOT EXISTS `enterprise_agencies` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON enterprise_sso.* TO 'app_user'@'%';
-- GRANT ALL PRIVILEGES ON enterprise_users.* TO 'app_user'@'%';
-- GRANT ALL PRIVILEGES ON enterprise_agencies.* TO 'app_user'@'%';
-- FLUSH PRIVILEGES;

