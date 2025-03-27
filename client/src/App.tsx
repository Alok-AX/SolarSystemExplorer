import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { WorkflowProvider } from "@/context/WorkflowContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Home from "@/pages/home";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Private route component to protect routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user && location !== '/login') {
      setLocation('/login');
    }
  }, [user, loading, location, setLocation]);

  if (loading) return null;
  
  return user ? <>{children}</> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      </Route>
      
      <Route path="/create">
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      </Route>
      
      <Route path="/edit/:id">
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      </Route>
      
      <Route path="/history">
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkflowProvider>
          <Router />
          <Toaster />
        </WorkflowProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
