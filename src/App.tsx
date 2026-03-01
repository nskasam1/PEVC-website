import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import PitchUs from "./pages/PitchUs";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Apply from "./pages/Apply";
import AdminRecruiting from "./pages/AdminRecruiting";
import AdminContent from "./pages/AdminContent";
import Onboarding from "./pages/Onboarding";
import Portal from "./pages/Portal";
import MyProjects from "./pages/MyProjects";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProjectProvider>
            <div className="bg-background min-h-screen w-full">
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/team" element={<Team />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/pitch" element={<PitchUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="/admin/recruiting" element={<AdminRecruiting />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/portal" element={<Portal />} />
                <Route path="/my-projects" element={<MyProjects />} />
                <Route path="/my-projects/:id" element={<ProjectDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </ProjectProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
