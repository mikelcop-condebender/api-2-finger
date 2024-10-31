-- Create the database
CREATE DATABASE ac_app;

-- Use the database
USE ac_app;

-- Create the table with specified columns
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    contents TEXT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
