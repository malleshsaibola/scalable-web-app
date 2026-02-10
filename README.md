# Scalable Web App

A full-stack web application built with Next.js featuring JWT-based authentication, protected dashboard, and CRUD operations for task management.

## Features

- **User Authentication**
  - User registration with email and password
  - Secure login with JWT tokens
  - Password hashing with bcrypt
  - Protected routes and API endpoints

- **Task Management**
  - Create, read, update, and delete tasks
  - Task status tracking (active, completed, archived)
  - Search and filter functionality
  - Real-time updates

- **User Profile**
  - View and edit profile information
  - Update name and email
  - Secure profile management

- **Responsive Design**
  - Mobile-friendly interface
  - TailwindCSS styling
  - Modern UI components

## Tech Stack

- **Frontend**: Next.js 14+ (React), TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT (jose library), bcrypt
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scalable-web-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
Create a `.env.local` file in the root directory:
```env
JWT_SECRET=your-secret-key-change-in-production
```

4. Initialize the database:
```bash
npm run init-db
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
scalable-web-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── tasks/           # Task CRUD endpoints
│   │   └── profile/         # Profile endpoints
│   ├── dashboard/           # Protected dashboard pages
│   │   ├── tasks/           # Tasks management page
│   │   ├── profile/         # Profile page
│   │   └── layout.tsx       # Dashboard layout
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ProtectedRoute.tsx   # Route protection component
│   └── TaskForm.tsx         # Task form component
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utility libraries
│   ├── db.ts               # Database connection
│   ├── db-helpers.ts       # Database CRUD functions
│   ├── auth.ts             # Authentication utilities
│   └── middleware.ts       # API middleware
└── data/                    # Database files
    └── app.db              # SQLite database
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  - Body: `{ email, password, name }`
  - Returns: `{ token, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `GET /api/auth/me` - Get current user (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user }`

### Tasks

- `GET /api/tasks` - Get all user tasks (protected)
  - Headers: `Authorization: Bearer <token>`
  - Query: `?search=<query>` (optional)
  - Returns: `{ tasks: [] }`

- `POST /api/tasks` - Create new task (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title, description?, status? }`
  - Returns: `{ task }`

- `PUT /api/tasks/[id]` - Update task (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title?, description?, status? }`
  - Returns: `{ task }`

- `DELETE /api/tasks/[id]` - Delete task (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success: true }`

### Profile

- `GET /api/profile` - Get user profile (protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user }`

- `PUT /api/profile` - Update profile (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name?, email? }`
  - Returns: `{ user }`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication with 7-day expiration
- Protected API routes with middleware
- Client-side and server-side validation
- Generic error messages to prevent user enumeration
- CORS and security headers

## Usage

1. **Register a new account**:
   - Navigate to `/register`
   - Enter your name, email, and password (min 8 characters)
   - Click "Create account"

2. **Login**:
   - Navigate to `/login`
   - Enter your email and password
   - Click "Sign in"

3. **Manage tasks**:
   - Navigate to "Tasks" in the dashboard
   - Click "+ New Task" to create a task
   - Use search and filters to find tasks
   - Click "Edit" to modify a task
   - Click "Delete" to remove a task

4. **Update profile**:
   - Navigate to "Profile" in the dashboard
   - Click "Edit Profile"
   - Update your name or email
   - Click "Save Changes"

5. **Logout**:
   - Click "Logout" button in the navigation bar

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-change-in-production` |

**Important**: Change the JWT_SECRET in production!

## Troubleshooting

### Database Issues

If you encounter database errors:
```bash
# Reinitialize the database
npm run init-db
```

### Port Already in Use

If port 3000 is already in use:
```bash
# Run on a different port
PORT=3001 npm run dev
```

### Clear Browser Storage

If you experience authentication issues:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear localStorage
4. Refresh the page

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
