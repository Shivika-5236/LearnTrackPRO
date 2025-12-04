import db from './database';

export interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    college: string;
    created_at?: string;
}

// User CRUD operations
export const userService = {
    // Create new user (signup)
    createUser: (email: string, password: string, name: string, college: string): User | null => {
        try {
            const result = db.runSync(
                'INSERT INTO users (email, password, name, college) VALUES (?, ?, ?, ?)',
                [email, password, name, college]
            );

            if (result.lastInsertRowId) {
                return getUserById(result.lastInsertRowId);
            }
            return null;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    },

    // Get user by email and password (login)
    authenticateUser: (email: string, password: string): User | null => {
        try {
            const result = db.getFirstSync<User>(
                'SELECT * FROM users WHERE email = ? AND password = ?',
                [email, password]
            );
            return result || null;
        } catch (error) {
            console.error('Error authenticating user:', error);
            return null;
        }
    },

    // Get user by ID
    getUserById: (id: number): User | null => {
        try {
            const result = db.getFirstSync<User>(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return result || null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    // Update user profile
    updateUser: (id: number, name: string, email: string, college: string): boolean => {
        try {
            db.runSync(
                'UPDATE users SET name = ?, email = ?, college = ? WHERE id = ?',
                [name, email, college, id]
            );
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    },

    // Check if email exists
    emailExists: (email: string): boolean => {
        try {
            const result = db.getFirstSync<{ count: number }>(
                'SELECT COUNT(*) as count FROM users WHERE email = ?',
                [email]
            );
            return (result?.count || 0) > 0;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    },
};

// Helper function (not exported directly but used internally)
function getUserById(id: number): User | null {
    return userService.getUserById(id);
}

export default userService;
