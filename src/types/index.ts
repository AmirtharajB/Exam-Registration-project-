
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  date: string;
  applicationDeadline: string;
  fee: number;
  location: string;
  availableSeats: number;
}

export type RegistrationStatus = "pending" | "paid" | "confirmed" | "cancelled" | "shown";

export interface Registration {
  id: string;
  examId: string;
  userId: string;
  status: RegistrationStatus;
  paymentId?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

