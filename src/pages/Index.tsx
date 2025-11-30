import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import logo from "@/assets/logo.png";

interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
}

const Index = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    fetchSections();
    checkAdminStatus();
    // Get the current website URL
    if (typeof window !== "undefined") {
      setWebsiteUrl(window.location.origin);
    }
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12 space-y-6">
          <div className="mb-4">
            <h2 className="text-3xl md:text-8xl font-bold">
              <span className="text-primary">By</span>
              <span className="text-red">IITians</span>
            </h2>
          </div>
         
          <div className="inline-block px-6 py-2 bg-primary/10 rounded-full border-2 border-primary/20">
            <p className="text-lg font-semibold text-primary">
              For: IIT | NEET | CBSE | NTSE | Foundation | Class 8 to 12
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Always Build Concepts
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-medium">
            Access all your learning resources in one place. Select a category below to get started.
          </p>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" className="mt-4 border-2 border-accent hover:bg-accent hover:text-accent-foreground rounded-full px-6 py-2">
                <Settings className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {sections.map((section) => {
            // Comment out all cards except testSeries and Location & Centre
            const sectionTitle = section.title?.toLowerCase().trim();
            if (sectionTitle === "test series" || sectionTitle === "location & centre" || sectionTitle?.includes("location")) {
              return (
                <SectionCard
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  description={section.description}
                  icon={section.icon}
                />
              );
            }
            // Commented out other cards
            // return (
            //   <SectionCard
            //     key={section.id}
            //     id={section.id}
            //     title={section.title}
            //     description={section.description}
            //     icon={section.icon}
            //   />
            // );
            return null;
          })}
          {/* New Information Brochure Card */}
          <SectionCard
            id="information-brochure"
            title="Information Brochure"
            description="View our information brochure"
            icon="FileText"
          />
        </div>

        <footer className="text-center text-sm text-foreground/60 mt-16 pb-8 space-y-4">
          <div className="inline-block bg-red/10 px-6 py-3 rounded-2xl border-2 border-red/20">
            <p className="text-red font-bold text-base">Contact us: 8447412646</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Our Centres</p>
            <p className="text-accent font-medium">Vasant Kunj • Mehrauli • Okhala</p>
          </div>
          <p className="text-xs pt-4 border-t border-primary/10">
            CORPORATE OFFICE: 41A/1, Kalu Sarai, New Delhi-110016
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            {websiteUrl && (
              <div className="inline-block p-4 bg-white rounded-2xl border-4 border-primary/20 shadow-lg">
                <QRCodeSVG 
                  value={websiteUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            )}
            <p className="text-primary font-medium">Scan QR code to access this dashboard anytime</p>
            {websiteUrl && (
              <p className="text-xs text-foreground/60 break-all max-w-xs">
                {websiteUrl}
              </p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
