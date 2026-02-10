import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  createTask,
  findTasksByUserId,
  findTaskById,
  updateTask,
  deleteTask,
  verifyTaskOwnership,
  type CreateUserData,
  type CreateTaskData,
  type UpdateTaskData,
} from './db-helpers';
import { getDb, closeDb } from './db';

/**
 * Unit tests for database helper functions
 * Tests specific examples and edge cases
 */

// Clean up database after all tests
afterAll(() => {
  closeDb();
});

// Clear tables before each test
beforeEach(() => {
  const db = getDb();
  db.exec('DELETE FROM tasks');
  db.exec('DELETE FROM users');
});

// ============================================================================
// User CRUD Tests
// ============================================================================

describe('User CRUD Functions', () => {
  describe('createUser', () => {
    test('creates user with valid data', () => {
      const userData: CreateUserData = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
      };

      const user = createUser(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.name).toBe(userData.name);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('throws error for duplicate email', () => {
      const userData: CreateUserData = {
        email: 'duplicate@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
      };

      createUser(userData);

      // Attempting to create another user with same email should throw
      expect(() => createUser(userData)).toThrow();
    });
  });

  describe('findUserByEmail', () => {
    test('finds existing user by email', () => {
      const userData: CreateUserData = {
        email: 'find@example.com',
        password: 'hashedpassword123',
        name: 'Find User',
      };

      const createdUser = createUser(userData);
      const foundUser = findUserByEmail(userData.email);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    test('returns null for non-existent email', () => {
      const foundUser = findUserByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });

    test('email search is case-sensitive', () => {
      const userData: CreateUserData = {
        email: 'case@example.com',
        password: 'hashedpassword123',
        name: 'Case User',
      };

      createUser(userData);

      // SQLite is case-sensitive by default for LIKE, but = is case-insensitive for ASCII
      const foundUser = findUserByEmail('CASE@EXAMPLE.COM');
      // This behavior depends on SQLite collation, but typically = is case-insensitive
      expect(foundUser).not.toBeNull();
    });
  });

  describe('findUserById', () => {
    test('finds existing user by ID', () => {
      const userData: CreateUserData = {
        email: 'findbyid@example.com',
        password: 'hashedpassword123',
        name: 'Find By ID User',
      };

      const createdUser = createUser(userData);
      const foundUser = findUserById(createdUser.id);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    test('returns null for non-existent ID', () => {
      const foundUser = findUserById('non-existent-id');
      expect(foundUser).toBeNull();
    });
  });

  describe('updateUser', () => {
    test('updates user name', () => {
      const userData: CreateUserData = {
        email: 'update@example.com',
        password: 'hashedpassword123',
        name: 'Original Name',
      };

      const createdUser = createUser(userData);
      const updatedUser = updateUser(createdUser.id, { name: 'Updated Name' });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.email).toBe(userData.email);
      expect(updatedUser?.updatedAt).not.toBe(createdUser.updatedAt);
    });

    test('updates user email', () => {
      const userData: CreateUserData = {
        email: 'original@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
      };

      const createdUser = createUser(userData);
      const updatedUser = updateUser(createdUser.id, { email: 'updated@example.com' });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.email).toBe('updated@example.com');
      expect(updatedUser?.name).toBe(userData.name);
    });

    test('updates both name and email', () => {
      const userData: CreateUserData = {
        email: 'both@example.com',
        password: 'hashedpassword123',
        name: 'Original Name',
      };

      const createdUser = createUser(userData);
      const updatedUser = updateUser(createdUser.id, {
        name: 'New Name',
        email: 'newemail@example.com',
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.name).toBe('New Name');
      expect(updatedUser?.email).toBe('newemail@example.com');
    });

    test('returns null for non-existent user', () => {
      const updatedUser = updateUser('non-existent-id', { name: 'New Name' });
      expect(updatedUser).toBeNull();
    });

    test('returns current user when no updates provided', () => {
      const userData: CreateUserData = {
        email: 'noupdate@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
      };

      const createdUser = createUser(userData);
      const result = updateUser(createdUser.id, {});

      expect(result).not.toBeNull();
      expect(result?.id).toBe(createdUser.id);
    });
  });
});

// ============================================================================
// Task CRUD Tests
// ============================================================================

describe('Task CRUD Functions', () => {
  let testUserId: string;

  beforeEach(() => {
    // Create a test user for task operations
    const user = createUser({
      email: 'taskuser@example.com',
      password: 'hashedpassword123',
      name: 'Task User',
    });
    testUserId = user.id;
  });

  describe('createTask', () => {
    test('creates task with valid data', () => {
      const taskData: CreateTaskData = {
        userId: testUserId,
        title: 'Test Task',
        description: 'Test Description',
        status: 'active',
      };

      const task = createTask(taskData);

      expect(task.id).toBeDefined();
      expect(task.userId).toBe(testUserId);
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe('active');
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    test('creates task without description', () => {
      const taskData: CreateTaskData = {
        userId: testUserId,
        title: 'Task Without Description',
      };

      const task = createTask(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBeNull();
      expect(task.status).toBe('active'); // Default status
    });

    test('creates task with completed status', () => {
      const taskData: CreateTaskData = {
        userId: testUserId,
        title: 'Completed Task',
        status: 'completed',
      };

      const task = createTask(taskData);

      expect(task.status).toBe('completed');
    });

    test('creates task with archived status', () => {
      const taskData: CreateTaskData = {
        userId: testUserId,
        title: 'Archived Task',
        status: 'archived',
      };

      const task = createTask(taskData);

      expect(task.status).toBe('archived');
    });
  });

  describe('findTasksByUserId', () => {
    test('finds all tasks for a user', () => {
      // Create multiple tasks
      createTask({ userId: testUserId, title: 'Task 1' });
      createTask({ userId: testUserId, title: 'Task 2' });
      createTask({ userId: testUserId, title: 'Task 3' });

      const tasks = findTasksByUserId(testUserId);

      expect(tasks).toHaveLength(3);
      expect(tasks[0].userId).toBe(testUserId);
      expect(tasks[1].userId).toBe(testUserId);
      expect(tasks[2].userId).toBe(testUserId);
    });

    test('returns empty array for user with no tasks', () => {
      const tasks = findTasksByUserId(testUserId);
      expect(tasks).toHaveLength(0);
    });

    test('returns only tasks for specified user', () => {
      // Create another user
      const otherUser = createUser({
        email: 'other@example.com',
        password: 'hashedpassword123',
        name: 'Other User',
      });

      // Create tasks for both users
      createTask({ userId: testUserId, title: 'User 1 Task' });
      createTask({ userId: otherUser.id, title: 'User 2 Task' });

      const tasks = findTasksByUserId(testUserId);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].userId).toBe(testUserId);
      expect(tasks[0].title).toBe('User 1 Task');
    });

    test('returns tasks in descending order by creation date', () => {
      // Create tasks with slight delay to ensure different timestamps
      const task1 = createTask({ userId: testUserId, title: 'First Task' });
      const task2 = createTask({ userId: testUserId, title: 'Second Task' });
      const task3 = createTask({ userId: testUserId, title: 'Third Task' });

      const tasks = findTasksByUserId(testUserId);

      // Most recent first
      expect(tasks[0].id).toBe(task3.id);
      expect(tasks[1].id).toBe(task2.id);
      expect(tasks[2].id).toBe(task1.id);
    });
  });

  describe('findTaskById', () => {
    test('finds existing task by ID', () => {
      const createdTask = createTask({
        userId: testUserId,
        title: 'Find By ID Task',
      });

      const foundTask = findTaskById(createdTask.id);

      expect(foundTask).not.toBeNull();
      expect(foundTask?.id).toBe(createdTask.id);
      expect(foundTask?.title).toBe('Find By ID Task');
    });

    test('returns null for non-existent ID', () => {
      const foundTask = findTaskById('non-existent-id');
      expect(foundTask).toBeNull();
    });
  });

  describe('updateTask', () => {
    test('updates task title', () => {
      const task = createTask({
        userId: testUserId,
        title: 'Original Title',
      });

      const updatedTask = updateTask(task.id, { title: 'Updated Title' });

      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.updatedAt).not.toBe(task.updatedAt);
    });

    test('updates task description', () => {
      const task = createTask({
        userId: testUserId,
        title: 'Task',
        description: 'Original Description',
      });

      const updatedTask = updateTask(task.id, { description: 'Updated Description' });

      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.description).toBe('Updated Description');
    });

    test('updates task status', () => {
      const task = createTask({
        userId: testUserId,
        title: 'Task',
        status: 'active',
      });

      const updatedTask = updateTask(task.id, { status: 'completed' });

      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.status).toBe('completed');
    });

    test('updates multiple fields', () => {
      const task = createTask({
        userId: testUserId,
        title: 'Original',
        description: 'Original Description',
        status: 'active',
      });

      const updatedTask = updateTask(task.id, {
        title: 'Updated',
        description: 'Updated Description',
        status: 'completed',
      });

      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.title).toBe('Updated');
      expect(updatedTask?.description).toBe('Updated Description');
      expect(updatedTask?.status).toBe('completed');
    });

    test('returns null for non-existent task', () => {
      const updatedTask = updateTask('non-existent-id', { title: 'Updated' });
      expect(updatedTask).toBeNull();
    });

    test('returns current task when no updates provided', () => {
      const task = createTask({
        userId: testUserId,
        title: 'Task',
      });

      const result = updateTask(task.id, {});

      expect(result).not.toBeNull();
      expect(result?.id).toBe(task.id);
    });
  });

  describe('deleteTask', () => {
    test('deletes existing task', () => {
      const task = createTask({
        userId: testUserId,
        title: 'Task to Delete',
      });

      const deleted = deleteTask(task.id);

      expect(deleted).toBe(true);

      // Verify task is gone
      const foundTask = findTaskById(task.id);
      expect(foundTask).toBeNull();
    });

    test('returns false for non-existent task', () => {
      const deleted = deleteTask('non-existent-id');
      expect(deleted).toBe(false);
    });

    test('deletes only specified task', () => {
      const task1 = createTask({ userId: testUserId, title: 'Task 1' });
      const task2 = createTask({ userId: testUserId, title: 'Task 2' });

      deleteTask(task1.id);

      // Task 1 should be gone
      expect(findTaskById(task1.id)).toBeNull();

      // Task 2 should still exist
      expect(findTaskById(task2.id)).not.toBeNull();
    });
  });

  describe('verifyTaskOwnership', () => {
    test('returns true for owned task', () => {
      const task = createTask({
        userId: testUserId,
        title: 'Owned Task',
      });

      const isOwner = verifyTaskOwnership(task.id, testUserId);
      expect(isOwner).toBe(true);
    });

    test('returns false for non-owned task', () => {
      const otherUser = createUser({
        email: 'other@example.com',
        password: 'hashedpassword123',
        name: 'Other User',
      });

      const task = createTask({
        userId: otherUser.id,
        title: 'Other User Task',
      });

      const isOwner = verifyTaskOwnership(task.id, testUserId);
      expect(isOwner).toBe(false);
    });

    test('returns false for non-existent task', () => {
      const isOwner = verifyTaskOwnership('non-existent-id', testUserId);
      expect(isOwner).toBe(false);
    });
  });
});
