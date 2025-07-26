
import { User } from "@/types";

const API_URL = "https://api.example.com"; // Replace with your actual backend URL when deployed

export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    // For demo purposes, we'll simulate a successful login
    // In a real application, you'd make an API call to your backend
    
    // Simulated API call
    // const response = await fetch(`${API_URL}/api/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // if (!response.ok) throw new Error('Login failed');
    // const data = await response.json();
    // return data;

    // This is a simulated response for demonstration
    if (email === "admin@example.com" && password === "password") {
      return {
        user: {
          id: "admin-123",
          name: "Admin User",
          email,
          role: "admin",
        },
        token: "simulated-jwt-token-for-admin",
      };
    } else if (email && password) {
      return {
        user: {
          id: "student-456",
          name: "Student User",
          email,
          role: "student",
        },
        token: "simulated-jwt-token-for-student",
      };
    }
    throw new Error("Invalid credentials");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const registerUser = async (
  name: string, 
  email: string, 
  password: string, 
  role: 'student' | 'admin' = 'student'
): Promise<{ user: User; token: string }> => {
  try {
    // Simulated API call
    // const response = await fetch(`${API_URL}/api/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, email, password, role })
    // });
    // if (!response.ok) throw new Error('Registration failed');
    // const data = await response.json();
    // return data;

    // This is a simulated response
    return {
      user: {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
      },
      token: `simulated-jwt-token-for-${role}`,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const storeAuthData = (user: User, token: string): void => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
};

export const getStoredAuthData = (): { user: User | null; token: string | null } => {
  const userJson = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  
  return {
    user: userJson ? JSON.parse(userJson) : null,
    token,
  };
};

export const clearAuthData = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};
