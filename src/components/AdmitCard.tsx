import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredAuthData } from "@/lib/auth";
import { getExams, getRegistrations } from "@/lib/exams";
import { Exam, Registration, User } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function AdmitCard() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const admitCardRef = useRef<HTMLDivElement>(null);
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
        if (!registrationId) throw new Error("Registration ID is missing");

        const allRegistrations = await getRegistrations(user.id);
        const foundRegistration = allRegistrations.find(r => r.id === registrationId);
        if (!foundRegistration) throw new Error("Registration not found");
        if (foundRegistration.status !== "paid") throw new Error("Payment is required to access admit card");

        setRegistration(foundRegistration);

        const allExams = await getExams();
        const foundExam = allExams.find(e => e.id === foundRegistration.examId);
        if (!foundExam) throw new Error("Exam not found");

        setExam(foundExam);
      } catch (error) {
        console.error("Error fetching admit card data:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load admit card.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, registrationId, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  const handlePrint = () => {
    if (admitCardRef.current) {
      const printContents = admitCardRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = `
        <div style="padding: 20px;">
          <h1 style="text-align: center; margin-bottom: 20px;">Exam Admit Card</h1>
          ${printContents}
        </div>
      `;

      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const generateRandomSeatNumber = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(Math.random() * 100) + 1;
    return `${letter}-${number.toString().padStart(2, "0")}`;
  };

  const seatNumber = generateRandomSeatNumber();
  const examCenter = "Main Examination Hall, Building A";
  const reportingTime = "08:30 AM";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-exam-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admit card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Exam Admit Card</h1>
        <Button onClick={handlePrint}>Print Admit Card</Button>
      </div>

      <div ref={admitCardRef}>
        <Card className="border-2 border-gray-300">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-exam-blue">Exam Registration</CardTitle>
                <p className="text-gray-500 text-sm">Official Admit Card</p>
              </div>

              <div>
                <label htmlFor="imageUpload" className="flex items-center justify-center w-24 h-24 border-2 border-gray-300 bg-white cursor-pointer">
                  {photo ? (
                    <img src={photo} alt="Uploaded" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center">
                      Candidate<br />Photo
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Candidate Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">Name</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Registration ID</p>
                    <p className="font-medium">{registration?.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Seat Number</p>
                    <p className="font-medium text-exam-blue">{seatNumber}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Exam Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">Exam</p>
                    <p className="font-medium">{exam?.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="font-medium">{exam ? new Date(exam.date).toLocaleDateString() : ""}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Reporting Time</p>
                    <p className="font-medium">{reportingTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Exam Center</p>
                    <p className="font-medium">{examCenter}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-semibold text-lg mb-2">Important Instructions</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Please arrive 30 minutes before the reporting time.</li>
                <li>Bring this admit card and a valid photo ID proof.</li>
                <li>Mobile phones and electronic devices are not permitted in the examination hall.</li>
                <li>Candidates without admit card will not be allowed to take the exam.</li>
                <li>Follow all COVID-19 protocols as per local guidelines.</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col border-t bg-slate-50 text-center text-xs text-gray-500 py-2">
            <p>This is an electronically generated document. No signature is required.</p>
            <p>For any queries, please contact support@examcompass.com</p>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
