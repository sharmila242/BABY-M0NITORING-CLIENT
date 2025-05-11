
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Baby, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // This is where you would integrate with your authentication API
      // For now, we'll simulate a successful login with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      login();
      
      toast({
        title: "Welcome back!",
        description: "Login successful",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-babyblue via-babypink to-babymint">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-xl animate-fade-in">
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-r from-blue-400 to-pink-400 w-16 h-16 rounded-full flex items-center justify-center shadow-md mb-4 animate-scale-in">
            <Baby size={36} className="text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Baby Monitor
          </h2>
          <p className="mt-2 text-sm text-gray-600 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Sign in to monitor your baby's environment
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <FormLabel className="text-gray-700">Email address</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Email address" 
                          type="email" 
                          className="pl-10 bg-gray-50 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 rounded-xl" 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Password" 
                          type="password" 
                          className="pl-10 bg-gray-50 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 rounded-xl" 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="text-sm">
                <a href="#" className="font-medium text-pink-600 hover:text-pink-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-white bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all animate-fade-in"
              disabled={isLoading}
              style={{ animationDelay: "0.7s" }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <p>Demo: Use any email and password with at least 6 characters</p>
              <p className="mt-1 text-xs">This is a demo app. In a real application, connect to your own authentication system.</p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
