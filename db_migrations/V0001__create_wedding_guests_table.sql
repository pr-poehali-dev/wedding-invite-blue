CREATE TABLE IF NOT EXISTS wedding_guests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0),
    alcohol VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);