
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getExams } from "@/lib/exams";
import { Exam } from "@/types";
import { useNavigate } from "react-router-dom";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const fetchedExams = await getExams();
        setExams(fetchedExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExams();
  }, []);
  
  const filteredExams = exams.filter(
    exam => exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleExamClick = () => {
    navigate("/login");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-exam-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Exams</h1>
      
      <div className="mb-8">
        <div className="max-w-md">
          <Label htmlFor="search" className="mb-2">Search Exams</Label>
          <Input
            id="search"
            placeholder="Search by exam title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredExams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No exams found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => (
            <Card key={exam.id} className="exam-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{exam.title}</CardTitle>
                  <Badge variant={exam.availableSeats > 10 ? "outline" : "secondary"}>
                    {exam.availableSeats} seats
                  </Badge>
                </div>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Application Deadline:</span>
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
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExamClick} className="w-full">
                  Register for Exam
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">Don't see the exam you're looking for?</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
