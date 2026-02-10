# Database Documentation

## Overview

This application uses SQLite with better-sqlite3 for data persistence. The database file (`app.db`) is stored in the root of the scalable-web-app directory.

## Database Schema

### Users Table

Stores user account information for authentication and profile management.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID for user identification
  email TEXT UNIQUE NOT NULL,       -- User's email (unique constraint)
  password TEXT NOT NULL,           -- Bcrypt hashed password
  name TEXT NOT NULL,               -- User's display name
  createdAt TEXT NOT NULL,          -- Account creation timestamp
  updatedAt TEXT NOT NULL           -- Last update timestamp
)
```

**Indexes:**
- `idx_users_email` on `email` column for fast lookups

**Requirements Satisfied:**
- Requirement 1.1: User registration with email, password, name
- Requirement 8.1, 8.2: Password hashing and secure storage
- Requirement 11.1: Database connectivity

### Tasks Table

Stores user tasks with CRUD operations support.

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,              -- UUID for task identification
  userId TEXT NOT NULL,             -- Foreign key to users table
  title TEXT NOT NULL,              -- Task title (required)
  description TEXT,                 -- Task description (optional)
  status TEXT NOT NULL,             -- Task status: 'active', 'completed', 'archived'
  createdAt TEXT NOT NULL,          -- Task creation timestamp
  updatedAt TEXT NOT NULL,          -- Last update timestamp
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)
```

**Indexes:**
- `idx_tasks_userId` on `userId` column for fast user task queries

**Requirements Satisfied:**
- Requirement 5.1: Entity creation with user association
- Requirement 5.2: Entity retrieval by user
- Requirement 5.5: Ownership enforcement via foreign key

## Database Initialization

The database is automatically initialized when the application first accesses it through the `getDb()` function. Tables are created if they don't exist.

### Manual Initialization

You can manually initialize the database using one of these methods:

#### Method 1: Using npm script
```bash
npm run init-db
```

#### Method 2: Using the API endpoint
Start the development server and visit:
```
GET http://localhost:3000/api/init
```

#### Method 3: Using the test script
```bash
node test-db.mjs
```

## Database Connection

The database connection is managed through `lib/db.ts`:

```typescript
import { getDb } from '@/lib/db';

// Get database connection (creates tables if needed)
const db = getDb();

// Use the database
const users = db.prepare('SELECT * FROM users').all();
```

### Connection Pooling

The application implements a singleton pattern for database connections (Requirement 11.3):
- Single connection is reused across the application
- Connection is created on first access
- WAL (Write-Ahead Logging) mode is enabled for better concurrency

### Error Handling

Database errors are handled gracefully (Requirements 11.2, 11.4):
- Connection failures are logged and throw descriptive errors
- Table initialization errors are caught and logged
- The application doesn't crash on database errors

## Database Location

The database file is stored at:
```
scalable-web-app/app.db
```

This location is determined by `process.cwd()` which points to the application root directory.

## Backup and Maintenance

### Backup
To backup the database, simply copy the `app.db` file:
```bash
cp app.db app.db.backup
```

### Reset Database
To reset the database, delete the file and restart the application:
```bash
rm app.db
npm run dev
```

The tables will be recreated automatically on first access.

## Development Notes

- SQLite is used for rapid development (30-minute timeline)
- No separate database server required
- WAL mode provides better concurrency for multiple connections
- Foreign key constraints ensure data integrity
- Indexes optimize query performance

## Production Considerations

For production deployment, consider:
- Migrating to PostgreSQL or MySQL for better scalability
- Implementing proper database migrations
- Setting up automated backups
- Using connection pooling with a dedicated pool manager
- Implementing database monitoring and logging
