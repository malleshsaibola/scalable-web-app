import { getDb, saveDb } from './db';
import { randomUUID } from 'crypto';

// Type Definitions
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface CreateTaskData {
  userId: string;
  title: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

// User CRUD Functions
export function createUser(data: CreateUserData): User {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const user: User = {
    id,
    email: data.email,
    password: data.password,
    name: data.name,
    createdAt: now,
    updatedAt: now,
  };

  // Check for duplicate email
  if (db.users.some((u: User) => u.email === data.email)) {
    throw new Error('Email already exists');
  }

  db.users.push(user);
  saveDb();

  return user;
}

export function findUserByEmail(email: string): User | null {
  const db = getDb();
  return db.users.find((u: User) => u.email === email) || null;
}

export function findUserById(id: string): User | null {
  const db = getDb();
  return db.users.find((u: User) => u.id === id) || null;
}

export function updateUser(id: string, data: { name?: string; email?: string }): User | null {
  const db = getDb();
  const now = new Date().toISOString();
  
  const userIndex = db.users.findIndex((u: User) => u.id === id);
  if (userIndex === -1) return null;

  const user = db.users[userIndex];
  
  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  user.updatedAt = now;

  saveDb();
  return user;
}

// Task CRUD Functions
export function createTask(data: CreateTaskData): Task {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const task: Task = {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description || null,
    status: data.status || 'active',
    createdAt: now,
    updatedAt: now,
  };

  db.tasks.push(task);
  saveDb();

  return task;
}

export function findTasksByUserId(userId: string): Task[] {
  const db = getDb();
  return db.tasks
    .filter((t: Task) => t.userId === userId)
    .sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function findTaskById(id: string): Task | null {
  const db = getDb();
  return db.tasks.find((t: Task) => t.id === id) || null;
}

export function updateTask(id: string, data: UpdateTaskData): Task | null {
  const db = getDb();
  const now = new Date().toISOString();
  
  const taskIndex = db.tasks.findIndex((t: Task) => t.id === id);
  if (taskIndex === -1) return null;

  const task = db.tasks[taskIndex];
  
  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.status !== undefined) task.status = data.status;
  task.updatedAt = now;

  saveDb();
  return task;
}

export function deleteTask(id: string): boolean {
  const db = getDb();
  const initialLength = db.tasks.length;
  
  db.tasks = db.tasks.filter((t: Task) => t.id !== id);
  
  if (db.tasks.length < initialLength) {
    saveDb();
    return true;
  }
  
  return false;
}

export function verifyTaskOwnership(taskId: string, userId: string): boolean {
  const task = findTaskById(taskId);
  return task !== null && task.userId === userId;
}
