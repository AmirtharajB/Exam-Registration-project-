import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getStoredAuthData } from "@/lib/auth";
import { getExams, createExam, updateExam, deleteExam, getRegistrations } from "@/lib/exams";
import { Exam, Registration, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExam, setCurrentExam] = useState<Partial<Exam>>({
    title: "",
    description: "",
    date: "",
    applicationDeadline: "",
    fee: 0,
    location: "",
    availableSeats: 0,
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const { user } = getStoredAuthData();
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    setUser(user);
    
    const fetchData = async () => {
      try {
        const [fetchedExams, fetchedRegistrations] = await Promise.all([
          getExams(),
          getRegistrations(),
        ]);
        
        setExams(fetchedExams);
        setRegistrations(fetchedRegistrations);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, toast]);
  
  const resetExamForm = () => {
    setCurrentExam({
      title: "",
      description: "",
      date: "",
      applicationDeadline: "",
      fee: 0,
      location: "",
      availableSeats: 0,
    });
    setIsEditing(false);
  };
  
  const handleCreateOrUpdateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentExam.id) {
        // Update existing exam
        const updatedExam = await updateExam(currentExam.id, currentExam);
        if (updatedExam) {
          setExams(exams.map(exam => exam.id === updatedExam.id ? updatedExam : exam));
          toast({
            title: "Exam updated",
            description: `${updatedExam.title} has been successfully updated.`,
          });
        }
      } else {
        // Create new exam
        const newExam = await createExam(currentExam as Omit<Exam, "id">);
        setExams([...exams, newExam]);
        toast({
          title: "Exam created",
          description: `${newExam.title} has been successfully created.`,
        });
      }
      setIsDialogOpen(false);
      resetExamForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditExam = (exam: Exam) => {
    setCurrentExam({
      ...exam,
      date: formatDateForInput(exam.date),
      applicationDeadline: formatDateForInput(exam.applicationDeadline),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };
  
  const handleDeleteExam = async (examId: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExam(examId);
        setExams(exams.filter(exam => exam.id !== examId));
        toast({
          title: "Exam deleted",
          description: "The exam has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete the exam.",
          variant: "destructive",
        });
      }
    }
  };
  
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  const getExamRegistrationCount = (examId: string) => {
    return registrations.filter(reg => reg.examId === examId).length;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-exam-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => {
          resetExamForm();
          setIsDialogOpen(true);
        }}>
          Create New Exam
        </Button>
      </div>
      
      <Tabs defaultValue="exams">
        <TabsList className="mb-6">
          <TabsTrigger value="exams">Exams Management</TabsTrigger>
          <TabsTrigger value="registrations">Student Registrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exams">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {exams.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No exams available. Create your first exam!</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-exam-blue"
                  onClick={() => {
                    resetExamForm();
                    setIsDialogOpen(true);
                  }}
                >
                  Create an exam
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exams.map(exam => (
                      <tr key={exam.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{exam.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(exam.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(exam.applicationDeadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${exam.fee.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={exam.availableSeats > 10 ? "outline" : "secondary"}>
                            {exam.availableSeats}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getExamRegistrationCount(exam.id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditExam(exam)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteExam(exam.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="registrations">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {registrations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No registrations yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map(registration => {
                      const exam = exams.find(e => e.id === registration.examId);
                      return (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {registration.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {exam?.title || "Unknown Exam"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registration.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                registration.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : registration.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {registration.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(registration.createdAt).toLocaleDateString()}
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Exam" : "Create New Exam"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the exam details. Click save when you're done."
                : "Fill out the form below to create a new exam."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateOrUpdateExam}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  value={currentExam.title}
                  onChange={(e) => setCurrentExam({ ...currentExam, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentExam.description}
                  onChange={(e) => setCurrentExam({ ...currentExam, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Exam Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentExam.date}
                    onChange={(e) => setCurrentExam({ ...currentExam, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={currentExam.applicationDeadline}
                    onChange={(e) => setCurrentExam({ ...currentExam, applicationDeadline: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fee">Exam Fee ($)</Label>
                  <Input
                    id="fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentExam.fee}
                    onChange={(e) => setCurrentExam({ ...currentExam, fee: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="seats">Available Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    value={currentExam.availableSeats}
                    onChange={(e) => setCurrentExam({ ...currentExam, availableSeats: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={currentExam.location}
                  onChange={(e) => setCurrentExam({ ...currentExam, location: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create Exam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
