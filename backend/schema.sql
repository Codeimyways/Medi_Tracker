-- Create the database
CREATE DATABASE IF NOT EXISTS med_tracker;
USE med_tracker;

-- Table to store medications
CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(50), -- e.g., "500mg"
    frequency VARCHAR(50), -- e.g., "Twice Daily"
    total_stock INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to track history (Logs)
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    med_id INT,
    action_type ENUM('TAKEN', 'MISSED', 'REFILLED'),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (med_id) REFERENCES medications(id) ON DELETE CASCADE
);

-- Insert some dummy data to start
INSERT INTO medications (name, dosage, frequency, total_stock, low_stock_threshold) 
VALUES 
('Amoxicillin', '500mg', 'Every 8 hours', 20, 5),
('Vitamin D', '1000IU', 'Once Daily', 4, 10); -- This one starts with low stock!