import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import SectionDetail from "./pages/SectionDetail";
import StudyMaterialDetail from "./pages/StudyMaterialDetail";
import CategoryDetail from "./pages/CategoryDetail";
import ClassDetail from "./pages/ClassDetail";
import SubjectDetail from "./pages/SubjectDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/study-material/:id" element={<StudyMaterialDetail />} />
          <Route path="/study-material/:id/class/:classNum" element={<ClassDetail />} />
          <Route path="/study-material/:id/class/:classNum/subject/:subject" element={<SubjectDetail />} />
          <Route path="/section/:id" element={<SectionDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
