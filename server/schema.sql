
-- Chaitra Real Estate (MySQL) schema
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS pixelfla_chaitra_ventures CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pixelfla_chaitra_ventures;

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price BIGINT NOT NULL DEFAULT 0,
  listing_type ENUM('sale','rent') NOT NULL,
  property_type VARCHAR(64) NOT NULL,
  location VARCHAR(255) NOT NULL,
  bedrooms INT NOT NULL DEFAULT 0,
  bathrooms INT NOT NULL DEFAULT 0,
  area INT NOT NULL DEFAULT 0,
  images JSON NULL,
  amenities JSON NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('available','sold','rented') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  image VARCHAR(1024) NOT NULL,
  status VARCHAR(64) NOT NULL,
  completion_year VARCHAR(32) NOT NULL,
  units INT NOT NULL DEFAULT 0,
  type VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  image VARCHAR(1024) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX(property_id)
);
