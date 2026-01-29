-- Таблица для хранения подтверждений гостей на свадьбу
CREATE TABLE IF NOT EXISTS wedding_guests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    alcohol VARCHAR(100),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрой сортировки по дате
CREATE INDEX idx_wedding_guests_created_at ON wedding_guests(created_at DESC);