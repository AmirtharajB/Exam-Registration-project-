
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  
  const features = [
    {
      title: "Easy Registration",
      description: "Register for exams with just a few clicks. Our streamlined process makes it easy to sign up for any available exam.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-exam-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Secure Payments",
      description: "Pay for your exam registrations securely using our integrated payment system with multiple payment options.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-exam-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      title: "Digital Admit Cards",
      description: "Download your admit card instantly after payment. No need to wait for physical copies to be mailed.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-exam-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 py-16 md:py-24">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Exam Register<span className="text-exam-blue">Here</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-600">
            Simplify your exam registration process. Register, pay, and get your admit card - all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg"
              onClick={() => navigate("/register")}
            >
              Register Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">why Use this site</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Available Exams Preview */}
      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Upcoming Exams</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Browse through our upcoming exams and register for the ones you're interested in. New exams are added regularly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Computer Science Fundamentals",
                date: "June 15, 2025",
                fee: "$50.00",
              },
              {
                title: "Advanced Mathematics",
                date: "June 20, 2025",
                fee: "$60.00",
              },
              {
                title: "English Literature",
                date: "June 25, 2025",
                fee: "$45.00",
              },
            ].map((exam, index) => (
              <Card key={index} className="exam-card">
                <CardHeader>
                  <CardTitle className="text-xl">{exam.title}</CardTitle>
                  <CardDescription>Registration open</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{exam.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fee:</span>
                    <span className="font-medium">{exam.fee}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button onClick={() => navigate("/exams")}>View All Exams</Button>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-exam-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Register now and simplify your exam registration process. It only takes a minute!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg bg-white text-exam-blue hover:bg-gray-100"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg border-white text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Exam Registration Connect</h3>
              <p className="text-gray-400">
                Simplifying exam registration for students and administrators.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/exams" className="hover:text-white transition-colors">Available Exams</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Register</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: balu.amirtharaj@gmail.com<br />
                Phone: +7305265102
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Exam Registration Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
