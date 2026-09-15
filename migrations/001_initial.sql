CREATE TABLE IF NOT EXISTS "user" (
    id INT PRIMARY KEY,
    email VARCHAR(250) NOT NULL,
    phone INT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS device (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    device_token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user" (id)
);