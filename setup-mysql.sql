-- Email Data Management Database Setup for MySQL
-- Database: email_data_management
-- Run this script in your local MySQL database

-- Create database (if needed)
-- CREATE DATABASE IF NOT EXISTS email_data_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE email_data_management;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS `email_contacts`;
DROP TABLE IF EXISTS `journals`;
DROP TABLE IF EXISTS `brands`;

-- Create brands table
CREATE TABLE `brands` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) UNIQUE NOT NULL,
  `code` VARCHAR(255) UNIQUE NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_brands_status` (`status`),
  INDEX `idx_brands_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create journals table
CREATE TABLE `journals` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `issn` VARCHAR(255) NULL,
  `subject` VARCHAR(255) NULL,
  `frequency` VARCHAR(255) NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `brand_id` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE CASCADE,
  INDEX `idx_journals_brand_id` (`brand_id`),
  INDEX `idx_journals_status` (`status`),
  INDEX `idx_journals_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create email_contacts table
CREATE TABLE `email_contacts` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NULL,
  `article_title` TEXT NULL,
  `year` INT NULL,
  `journal_id` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`journal_id`) REFERENCES `journals`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `email_journal_unique` (`email`, `journal_id`),
  INDEX `idx_email_contacts_journal_id` (`journal_id`),
  INDEX `idx_email_contacts_email` (`email`),
  INDEX `idx_email_contacts_year` (`year`),
  INDEX `idx_email_contacts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample brands
INSERT INTO `brands` (`id`, `name`, `code`, `status`) VALUES
('brand_gmx_001', 'GMX Publications', 'GMX', 'ACTIVE'),
('brand_cm_002', 'Clinical Medicine', 'CM', 'ACTIVE'),
('brand_sci_003', 'Science Direct', 'SCI', 'ACTIVE');

-- Insert sample journals
INSERT INTO `journals` (`id`, `name`, `issn`, `subject`, `frequency`, `brand_id`, `status`) VALUES
('journal_001', 'Journal of Medical Research', '1234-5678', 'Medicine', 'Monthly', 'brand_gmx_001', 'ACTIVE'),
('journal_002', 'Clinical Studies Quarterly', '2345-6789', 'Clinical Medicine', 'Quarterly', 'brand_cm_002', 'ACTIVE'),
('journal_003', 'Science & Technology Review', '3456-7890', 'Technology', 'Bi-monthly', 'brand_sci_003', 'ACTIVE'),
('journal_004', 'Advanced Medical Sciences', '4567-8901', 'Medicine', 'Monthly', 'brand_gmx_001', 'ACTIVE');

-- Verify setup
SELECT 'Brands:' as 'Table', COUNT(*) as 'Count' FROM brands
UNION ALL
SELECT 'Journals:', COUNT(*) FROM journals
UNION ALL
SELECT 'Email Contacts:', COUNT(*) FROM email_contacts;

SELECT 'Setup complete!' as 'Status';
