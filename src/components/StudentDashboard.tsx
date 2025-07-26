import { useEffect, useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredAuthData } from "@/lib/auth";
import { getExams, getRegistrations, registerForExam } from "@/lib/exams";
import { Exam, Registration, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { user } = getStoredAuthData();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);

    const fetchData = async () => {
      try {
        const [fetchedExams, fetchedRegistrations] = await Promise.all([
          getExams(),
          getRegistrations(user.id),
        ]);
        setExams(fetchedExams);
        setRegistrations(fetchedRegistrations);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, toast]);

  const handleRegisterExam = async (examId: string) => {
    if (!user) return;

    try {
      const registration = await registerForExam(examId, user.id);
      setRegistrations(prev => [...prev, registration]);

      toast({
        title: "Registration successful",
        description: "You've been registered for the exam. Please complete the payment to confirm.",
      });

      const updatedExams = await getExams();
      setExams(updatedExams);
      navigate(`/payment/${registration.id}`);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
    }
  };

  const getExamById = (examId: string) => exams.find(exam => exam.id === examId);

  const isRegistered = (examId: string) => registrations.some(reg => reg.examId === examId);

  const getRegistrationStatus = (examId: string) => {
    const registration = registrations.find(reg => reg.examId === examId);
    return registration?.status;
  };

  const handleViewAdmitCard = (registrationId: string) => {
    navigate(`/admit-card/${registrationId}`);
    setRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId
          ? { ...reg, status: "shown" as Registration["status"] } // Safely assert type
          : reg
      )
    );
  };

  const handleCompletePayment = (registrationId: string) => {
    navigate(`/payment/${registrationId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-exam-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Available Exams</TabsTrigger>
          <TabsTrigger value="registered">My Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">No exams available at the moment.</p>
            ) : (
              exams.map(exam => {
                const status = getRegistrationStatus(exam.id);
                return (
                  <Card key={exam.id} className="exam-card flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{exam.title}</CardTitle>
                        <Badge variant={isRegistered(exam.id) ? "secondary" : "outline"}>
                          {isRegistered(exam.id) ? "Registered" : "Open"}
                        </Badge>
                      </div>
                      <CardDescription>{exam.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Deadline:</span>
                          <span className="font-medium">{new Date(exam.applicationDeadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fee:</span>
                          <span className="font-medium">${exam.fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="font-medium">{exam.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Available Seats:</span>
                          <span className="font-medium">{exam.availableSeats}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isRegistered(exam.id) ? (
                        <div className="w-full">
                          <div className="flex items-center justify-center mb-2">
                            <Badge className="mx-auto">{status?.toUpperCase()}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {status === "pending" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  const reg = registrations.find(r => r.examId === exam.id);
                                  if (reg) handleCompletePayment(reg.id);
                                }}
                              >
                                Pay Now
                              </Button>
                            )}
                            {(status === "paid" || status === "shown") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full col-span-2"
                                onClick={() => {
                                  const reg = registrations.find(r => r.examId === exam.id);
                                  if (reg) handleViewAdmitCard(reg.id);
                                }}
                              >
                                View Admit Card
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleRegisterExam(exam.id)}
                          disabled={exam.availableSeats <= 0}
                          className="w-full"
                        >
                          {exam.availableSeats <= 0 ? "Fully Booked" : "Register"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="registered">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {registrations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">You haven't registered for any exams yet.</p>
                <Button
                  variant="link"
                  className="mt-2 text-exam-blue"
                  onClick={() =>
                    document.querySelector('[data-value="upcoming"]')?.dispatchEvent(
                      new MouseEvent("click", { bubbles: true })
                    )
                  }
                >
                  Browse available exams
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map(registration => {
                      const exam = getExamById(registration.examId);
                      return (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{exam?.title || "Unknown Exam"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{exam ? new Date(exam.date).toLocaleDateString() : "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${exam?.fee.toFixed(2) || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                registration.status === "paid" || registration.status === "shown"
                                  ? "bg-green-100 text-green-800"
                                  : registration.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {registration.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {registration.status === "pending" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompletePayment(registration.id)}
                              >
                                Pay Now
                              </Button>
                            ) : registration.status === "paid" || registration.status === "shown" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAdmitCard(registration.id)}
                              >
                                View Admit Card
                              </Button>
                            ) : (
                              <span className="text-gray-500">No actions</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
