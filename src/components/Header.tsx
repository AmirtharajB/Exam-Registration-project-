
import { Button } from "@/components/ui/button";
import { getStoredAuthData, clearAuthData } from "@/lib/auth";
import { useEffect, useState } from "react";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const { user } = getStoredAuthData();
    setUser(user);
  }, []);
  
  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/login");
  };
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold text-exam-blue">Exam Registration</span>
            </a>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            <a href="/" className="px-3 py-2 text-gray-700 hover:text-exam-blue">Home</a>
            <a href="/exams" className="px-3 py-2 text-gray-700 hover:text-exam-blue">Exams</a>
            {user?.role === "admin" && (
              <a href="/admin" className="px-3 py-2 text-gray-700 hover:text-exam-blue">Admin</a>
            )}
          </nav>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.name} ({user.role})
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
