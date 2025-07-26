
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStoredAuthData } from "@/lib/auth";
import { getExams, getRegistrations, updateRegistrationStatus } from "@/lib/exams";
import { Exam, Registration, User } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Mock Stripe payment component (in real app, would integrate with Stripe.js)
const StripePaymentForm = ({ 
  amount, 
  onSuccess 
}: { 
  amount: number; 
  onSuccess: (paymentId: string) => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful payment
    const mockPaymentId = `py_${Math.random().toString(36).substring(2, 15)}`;
    onSuccess(mockPaymentId);
    setIsProcessing(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          id="card-number"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400"
          placeholder="4242 4242 4242 4242"
          defaultValue="4242 4242 4242 4242"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
            Expiration
          </label>
          <input
            type="text"
            id="expiration-date"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400"
            placeholder="MM / YY"
            defaultValue="12 / 25"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400"
            placeholder="123"
            defaultValue="123"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isProcessing}>
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Processing...
          </div>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

export default function PaymentPage() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);
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
        
        // Get all registrations and find the specific one
        const allRegistrations = await getRegistrations(user.id);
        const foundRegistration = allRegistrations.find(r => r.id === registrationId);
        
        if (!foundRegistration) {
          throw new Error("Registration not found");
        }
        
        if (foundRegistration.status === "paid") {
          setPaymentComplete(true);
        }
        
        setRegistration(foundRegistration);
        
        // Get the exam details
        const allExams = await getExams();
        const foundExam = allExams.find(e => e.id === foundRegistration.examId);
        
        if (!foundExam) {
          throw new Error("Exam not found");
        }
        
        setExam(foundExam);
      } catch (error) {
        console.error("Error fetching payment data:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load payment information.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, registrationId, toast]);
  
  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      if (!registration) return;
      
      // Update registration status to "paid"
      await updateRegistrationStatus(registration.id, "paid", paymentId);
      
      setPaymentComplete(true);
      
      toast({
        title: "Payment successful",
        description: "Your exam registration has been confirmed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  };
  
  const handleViewAdmitCard = () => {
    navigate(`/admit-card/{registrationId}`);
  };
  
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-exam-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Payment</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Exam Registration Payment</CardTitle>
          <CardDescription>
            Complete payment to confirm your registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exam && (
            <div className="mb-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-lg">{exam.title}</h3>
                <p className="text-gray-500 text-sm">{exam.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Exam Date:</span>
                  <span className="font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{exam.location}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-medium">Registration Fee:</span>
                  <span className="font-bold text-exam-blue">{exam.fee.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          {paymentComplete ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-medium text-lg text-green-600">Payment Complete!</h3>
              <p className="text-gray-500">
                Your registration has been confirmed. You can now access your admit card.
              </p>
            </div>
          ) : (
            <StripePaymentForm
              amount={exam?.fee || 0}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {paymentComplete ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
              <Button onClick={handleViewAdmitCard}>
                View Admit Card
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={handleBackToDashboard}>
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
