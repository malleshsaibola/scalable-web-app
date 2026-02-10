/**
 * Simple test script for database helper functions
 * Run with: node test-helpers.js
 * 
 * This tests the compiled JavaScript output
 */

const { getDb, closeDb } = require('./lib/db.ts');
const {
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
} = require('./lib/db-helpers.ts');

console.log('🧪 Testing Database Helper Functions\n');

// Clean up database
const db = getDb();
db.exec('DELETE FROM tasks');
db.exec('DELETE FROM users');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.log(`❌ ${message}`);
    testsFailed++;
  }
}

try {
  // ============================================================================
  // User CRUD Tests
  // ============================================================================

  console.log('📝 Testing User CRUD Functions\n');

  // Test createUser
  const user1 = createUser({
    email: 'test1@example.com',
    password: 'hashedpassword123',
    name: 'Test User 1',
  });
  assert(user1.id, 'createUser: Creates user with ID');
  assert(user1.email === 'test1@example.com', 'createUser: Sets correct email');
  assert(user1.name === 'Test User 1', 'createUser: Sets correct name');

  // Test findUserByEmail
  const foundUser = findUserByEmail('test1@example.com');
  assert(foundUser !== null, 'findUserByEmail: Finds existing user');
  assert(foundUser?.id === user1.id, 'findUserByEmail: Returns correct user');

  const notFoundUser = findUserByEmail('nonexistent@example.com');
  assert(notFoundUser === null, 'findUserByEmail: Returns null for non-existent user');

  // Test findUserById
  const foundById = findUserById(user1.id);
  assert(foundById !== null, 'findUserById: Finds existing user');
  assert(foundById?.email === user1.email, 'findUserById: Returns correct user');

  const notFoundById = findUserById('non-existent-id');
  assert(notFoundById === null, 'findUserById: Returns null for non-existent ID');

  // Test updateUser
  const updatedUser = updateUser(user1.id, { name: 'Updated Name' });
  assert(updatedUser !== null, 'updateUser: Updates user successfully');
  assert(updatedUser?.name === 'Updated Name', 'updateUser: Updates name correctly');
  assert(updatedUser?.email === user1.email, 'updateUser: Preserves email');

  // Test duplicate email
  try {
    createUser({
      email: 'test1@example.com',
      password: 'hashedpassword123',
      name: 'Duplicate User',
    });
    assert(false, 'createUser: Should throw error for duplicate email');
  } catch (error) {
    assert(true, 'createUser: Throws error for duplicate email');
  }

  console.log('\n📝 Testing Task CRUD Functions\n');

  // Create a second user for ownership tests
  const user2 = createUser({
    email: 'test2@example.com',
    password: 'hashedpassword123',
    name: 'Test User 2',
  });

  // Test createTask
  const task1 = createTask({
    userId: user1.id,
    title: 'Test Task 1',
    description: 'Test Description',
    status: 'active',
  });
  assert(task1.id, 'createTask: Creates task with ID');
  assert(task1.userId === user1.id, 'createTask: Sets correct userId');
  assert(task1.title === 'Test Task 1', 'createTask: Sets correct title');
  assert(task1.status === 'active', 'createTask: Sets correct status');

  // Test createTask without description
  const task2 = createTask({
    userId: user1.id,
    title: 'Task Without Description',
  });
  assert(task2.description === null, 'createTask: Handles null description');
  assert(task2.status === 'active', 'createTask: Sets default status');

  // Test createTask with different status
  const task3 = createTask({
    userId: user1.id,
    title: 'Completed Task',
    status: 'completed',
  });
  assert(task3.status === 'completed', 'createTask: Sets completed status');

  // Create task for user2
  const task4 = createTask({
    userId: user2.id,
    title: 'User 2 Task',
  });

  // Test findTasksByUserId
  const user1Tasks = findTasksByUserId(user1.id);
  assert(user1Tasks.length === 3, 'findTasksByUserId: Returns all user tasks');
  assert(user1Tasks.every(t => t.userId === user1.id), 'findTasksByUserId: Returns only user tasks');

  const user2Tasks = findTasksByUserId(user2.id);
  assert(user2Tasks.length === 1, 'findTasksByUserId: Returns correct tasks for user 2');

  // Test findTaskById
  const foundTask = findTaskById(task1.id);
  assert(foundTask !== null, 'findTaskById: Finds existing task');
  assert(foundTask?.title === 'Test Task 1', 'findTaskById: Returns correct task');

  const notFoundTask = findTaskById('non-existent-id');
  assert(notFoundTask === null, 'findTaskById: Returns null for non-existent ID');

  // Test updateTask
  const updatedTask = updateTask(task1.id, {
    title: 'Updated Title',
    status: 'completed',
  });
  assert(updatedTask !== null, 'updateTask: Updates task successfully');
  assert(updatedTask?.title === 'Updated Title', 'updateTask: Updates title correctly');
  assert(updatedTask?.status === 'completed', 'updateTask: Updates status correctly');

  // Test updateTask with partial data
  const partialUpdate = updateTask(task2.id, { description: 'Added Description' });
  assert(partialUpdate !== null, 'updateTask: Handles partial updates');
  assert(partialUpdate?.description === 'Added Description', 'updateTask: Updates description');
  assert(partialUpdate?.title === 'Task Without Description', 'updateTask: Preserves title');

  // Test verifyTaskOwnership
  const isOwner = verifyTaskOwnership(task1.id, user1.id);
  assert(isOwner === true, 'verifyTaskOwnership: Returns true for owner');

  const isNotOwner = verifyTaskOwnership(task1.id, user2.id);
  assert(isNotOwner === false, 'verifyTaskOwnership: Returns false for non-owner');

  const nonExistentOwnership = verifyTaskOwnership('non-existent-id', user1.id);
  assert(nonExistentOwnership === false, 'verifyTaskOwnership: Returns false for non-existent task');

  // Test deleteTask
  const deleted = deleteTask(task3.id);
  assert(deleted === true, 'deleteTask: Deletes existing task');

  const deletedTask = findTaskById(task3.id);
  assert(deletedTask === null, 'deleteTask: Task is removed from database');

  const notDeleted = deleteTask('non-existent-id');
  assert(notDeleted === false, 'deleteTask: Returns false for non-existent task');

  // Verify remaining tasks
  const remainingTasks = findTasksByUserId(user1.id);
  assert(remainingTasks.length === 2, 'deleteTask: Only deletes specified task');

  // ============================================================================
  // Summary
  // ============================================================================

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  console.log(`   📈 Total:  ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log('\n⚠️  Some tests failed!\n');
    process.exit(1);
  }

} catch (error) {
  console.error('\n❌ Test execution failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  // Clean up
  closeDb();
}
