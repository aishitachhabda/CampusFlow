CREATE DATABASE IF NOT EXISTS campusflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusflow;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    google_sub VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture TEXT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'google',
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    first_login_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    login_count INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(100) NULL,
    user_agent TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_login_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS prediction_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    resource_name VARCHAR(100) NOT NULL,
    prediction_type ENUM('image', 'future_time', 'best_time', 'overview') NOT NULL,
    requested_time DATETIME NULL,
    image_filename VARCHAR(255) NULL,
    predicted_score DECIMAL(6,2) NULL,
    predicted_class ENUM('Free', 'Moderate', 'Busy') NULL,
    confidence DECIMAL(6,4) NULL,
    recommendation TEXT NULL,
    model_name VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prediction_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_login_events_created_at ON login_events(created_at);
CREATE INDEX idx_prediction_logs_created_at ON prediction_logs(created_at);
CREATE INDEX idx_prediction_logs_resource ON prediction_logs(resource_name);

-- Optional seed table for resources.
CREATE TABLE IF NOT EXISTS resources (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO resources (name, display_name) VALUES
('canteen', 'Canteen'),
('amul', 'Amul'),
('snackify', 'Snackify'),
('nescafe', 'Nescafe');
