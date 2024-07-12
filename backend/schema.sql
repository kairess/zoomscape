DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS images;

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    filename TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
