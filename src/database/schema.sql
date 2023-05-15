CREATE DATABASE kanban;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  username VARCHAR UNIQUE,
  password VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS boards (
  id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  userId UUID,
  FOREIGN KEY(userId) REFERENCES users(id),
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS columns (
  id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description VARCHAR,
  "order" INTEGER NOT NULL,
  boardId UUID,
  FOREIGN KEY(boardId) REFERENCES boards(id),
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description VARCHAR,
  "order" INTEGER NOT NULL,
  columnId UUID,
  FOREIGN KEY(columnId) REFERENCES columns(id),
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS subtasks (
  id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  "order" INTEGER NOT NULL,
  completed BOOLEAN NOT NULL,
  taksId UUID,
  FOREIGN KEY(taksId) REFERENCES tasks(id),
  created_at TIMESTAMP NOT NULL
);