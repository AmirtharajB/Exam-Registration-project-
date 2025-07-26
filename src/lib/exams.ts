
import { Exam, Registration } from "@/types";

// Mock data for exams
const mockExams: Exam[] = [
  {
    id: "exam-001",
    title: "Computer Science Fundamentals",
    description: "Test your knowledge of algorithms, data structures, and programming concepts.",
    date: "2025-06-15",
    applicationDeadline: "2025-05-15",
    fee: 50,
    location: "Online",
    availableSeats: 200,
  },
  {
    id: "exam-002",
    title: "Advanced Mathematics",
    description: "Comprehensive test covering calculus, linear algebra, and statistics.",
    date: "2025-06-20",
    applicationDeadline: "2025-05-20",
    fee: 60,
    location: "Main Campus - Building A",
    availableSeats: 150,
  },
  {
    id: "exam-2",
    title: "Database Management System",
    description: "Comprehensive test covering calculus, linear algebra, and statistics.",
    date: "2025-06-20",
    applicationDeadline: "2025-06-29",
    fee: 60,
    location: "Main Campus - Building A",
    availableSeats: 150,
  },
  {
    id: "exam-003",
    title: "English Literature",
    description: "Essay-based examination on classical and contemporary literary works.",
    date: "2025-06-25",
    applicationDeadline: "2025-05-25",
    fee: 45,
    location: "Liberal Arts Center",
    availableSeats: 100,
  },
  {
    id: "exam-004",
    title: "Physics Principles",
    description: "Theoretical and practical examination of fundamental physics concepts.",
    date: "2025-07-05",
    applicationDeadline: "2025-06-05",
    fee: 55,
    location: "Science Building - Lab 103",
    availableSeats: 80,
  },
];

// Mock registrations
const mockRegistrations: Registration[] = [];

export const getExams = async (): Promise<Exam[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockExams;
};

export const getExamById = async (id: string): Promise<Exam | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockExams.find(exam => exam.id === id);
};

export const createExam = async (examData: Omit<Exam, "id">): Promise<Exam> => {
  const newExam: Exam = {
    ...examData,
    id: `exam-{Date.now()}`,
  };
  mockExams.push(newExam);
  return newExam;
};

export const updateExam = async (id: string, examData: Partial<Exam>): Promise<Exam | undefined> => {
  const examIndex = mockExams.findIndex(exam => exam.id === id);
  if (examIndex === -1) return undefined;
  
  mockExams[examIndex] = { ...mockExams[examIndex], ...examData };
  return mockExams[examIndex];
};

export const deleteExam = async (id: string): Promise<boolean> => {
  const examIndex = mockExams.findIndex(exam => exam.id === id);
  if (examIndex === -1) return false;
  
  mockExams.splice(examIndex, 1);
  return true;
};

export const registerForExam = async (examId: string, userId: string): Promise<Registration> => {
  const exam = await getExamById(examId);
  if (!exam) throw new Error("Exam not found");
  if (exam.availableSeats <= 0) throw new Error("No available seats");
  
  const registration: Registration = {
    id: `reg-${Date.now()}`,
    examId,
    userId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  
  mockRegistrations.push(registration);
  
  // Update available seats
  const updatedExam = { ...exam, availableSeats: exam.availableSeats - 1 };
  await updateExam(examId, updatedExam);
  
  return registration;
};

export const getRegistrations = async (userId?: string): Promise<Registration[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (userId) {
    return mockRegistrations.filter(reg => reg.userId === userId);
  }
  return mockRegistrations;
};

export const updateRegistrationStatus = async (
  registrationId: string, 
  status: Registration["status"],
  paymentId?: string
): Promise<Registration | undefined> => {
  const regIndex = mockRegistrations.findIndex(reg => reg.id === registrationId);
  if (regIndex === -1) return undefined;
  
  mockRegistrations[regIndex] = { 
    ...mockRegistrations[regIndex], 
    status, 
    ...(paymentId && { paymentId }) 
  };
  
  return mockRegistrations[regIndex];
};
