// Mock Firebase Auth Module
// Since we're having issues with Firebase, this provides a mock implementation
// for testing purposes

// Define a User interface that matches Firebase User properties we need
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Store users in localStorage for persistence
const USERS_STORAGE_KEY = 'workflow_app_users';
const CURRENT_USER_KEY = 'workflow_app_current_user';

// Helper to get users from storage
const getUsers = (): Record<string, { email: string; password: string }> => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : {};
};

// Helper to save users to storage
const saveUsers = (users: Record<string, { email: string; password: string }>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Helper to set current user
const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Helper to get current user
const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Authentication functions
export const signIn = async (email: string, password: string) => {
  const users = getUsers();
  const userEmail = email.toLowerCase();
  
  if (!users[userEmail]) {
    throw new Error('User not found');
  }
  
  if (users[userEmail].password !== password) {
    throw new Error('Incorrect password');
  }
  
  // Create a user object similar to Firebase User
  const user: User = {
    uid: userEmail, // Using email as UID for simplicity
    email: userEmail,
    displayName: userEmail.split('@')[0],
  };
  
  // Store the current user
  setCurrentUser(user);
  
  // Notify listeners
  authListeners.forEach(listener => listener(user));
  
  return { user };
};

export const signUp = async (email: string, password: string) => {
  const users = getUsers();
  const userEmail = email.toLowerCase();
  
  if (users[userEmail]) {
    throw new Error('Email already in use');
  }
  
  // Store new user
  users[userEmail] = { email: userEmail, password };
  saveUsers(users);
  
  // Create a user object
  const user: User = {
    uid: userEmail,
    email: userEmail,
    displayName: userEmail.split('@')[0],
  };
  
  // Store the current user
  setCurrentUser(user);
  
  // Notify listeners
  authListeners.forEach(listener => listener(user));
  
  return { user };
};

export const signOut = async () => {
  setCurrentUser(null);
  
  // Notify listeners
  authListeners.forEach(listener => listener(null));
};

// Auth state change management
const authListeners: Array<(user: User | null) => void> = [];

export const onAuthChange = (callback: (user: User | null) => void) => {
  // Add the listener
  authListeners.push(callback);
  
  // Call it immediately with current auth state
  setTimeout(() => {
    callback(getCurrentUser());
  }, 0);
  
  // Return an unsubscribe function
  return () => {
    const index = authListeners.indexOf(callback);
    if (index !== -1) {
      authListeners.splice(index, 1);
    }
  };
};

// Mock auth object for compatibility
export const auth = {
  currentUser: getCurrentUser(),
};

// Mock db object for compatibility
export const db = {};
