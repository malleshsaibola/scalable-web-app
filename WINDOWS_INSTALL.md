# Windows Installation Guide

## Quick Start

The application has been updated to use `sql.js` instead of `better-sqlite3` to avoid requiring Visual Studio build tools on Windows.

### Installation Steps

1. **Install dependencies**:
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## What Changed

- Replaced `better-sqlite3` (requires native compilation) with `sql.js` (pure JavaScript)
- Updated `lib/db.ts` to use sql.js API
- Updated `lib/db-helpers.ts` to work with sql.js
- All functionality remains the same

## Testing the Application

1. Register a new account at `/register`
2. Login with your credentials
3. Create, edit, and delete tasks
4. Update your profile
5. Test search and filter features

## Troubleshooting

### If npm install still fails

Try clearing the npm cache:
```bash
npm cache clean --force
npm install
```

### If the database doesn't initialize

The database will be created automatically on first API call. If you want to manually initialize it:
```bash
npm run init-db
```

### Port already in use

If port 3000 is already in use:
```bash
set PORT=3001
npm run dev
```

## Features

✅ User authentication (register, login, logout)  
✅ Protected dashboard  
✅ Task CRUD operations  
✅ Search and filter tasks  
✅ Profile management  
✅ Responsive design  
✅ Error handling  

Enjoy your scalable web app!
