import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import testSeriesPdf from "@/assets/testSeries/TEST SERIES BROUCHER .pdf";

interface Section {
  id: string;
  title: string;
  description: string;
}

interface SectionContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_data: any;
}

const SectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section | null>(null);
  const [contents, setContents] = useState<SectionContent[]>([]);
  const [loading, setLoading] = useState(true);
  const pdfOpenedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sectionData, error: sectionError } = await supabase
          .from("sections")
          .select("*")
          .eq("id", id)
          .single();

        if (sectionError) throw sectionError;
        setSection(sectionData);

        // Redirect to Study Material Detail if it's Study Materials section
        if (sectionData?.title?.toLowerCase().includes("study material")) {
          navigate(`/study-material/${id}`, { replace: true });
          return;
        }

        const { data: contentData, error: contentError } = await supabase
          .from("section_content")
          .select("*")
          .eq("section_id", id)
          .eq("is_active", true)
          .order("display_order");

        if (contentError) throw contentError;
        setContents(contentData || []);
      } catch (error) {
        toast.error("Failed to load section details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Open PDF for Test Series section
  useEffect(() => {
    if (section && !loading && !pdfOpenedRef.current) {
      const isTestSeries = section.title?.toLowerCase().trim() === "test series";
      if (isTestSeries) {
        pdfOpenedRef.current = true;
        window.open(testSeriesPdf, "_blank", "noopener,noreferrer");
      }
    }
  }, [section, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Section Not Found</CardTitle>
            <CardDescription>The requested section could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6 group hover:bg-primary/10 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl border-2 border-primary/20">
          <h1 className="text-4xl font-bold text-primary mb-2">{section.title}</h1>
          <p className="text-lg text-foreground/70">{section.description}</p>
        </div>

        {contents.length === 0 ? (
          <Card className="shadow-card border-4 border-primary/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-primary">No Content Available</CardTitle>
              <CardDescription>
                Content for this section is being prepared. Please check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {contents.map((content) => (
              <Card key={content.id} className="shadow-card hover:shadow-card-hover transition-shadow border-4 border-primary/20 rounded-3xl">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {content.content_type === "link" ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent">
                        <LinkIcon className="h-6 w-6 text-accent-foreground" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
                        <FileText className="h-6 w-6 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-xl text-primary">{content.title}</CardTitle>
                      {content.description && (
                        <CardDescription className="mt-2">{content.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {content.content_data && (
                  <CardContent>
                    {content.content_type === "link" && content.content_data.url && (
                      <a
                        href={content.content_data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button className="bg-gradient-accent text-accent-foreground hover:opacity-90 rounded-full px-6 font-bold">
                          View Resource
                          <LinkIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {content.content_type === "text" && content.content_data.text && (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground whitespace-pre-wrap">{content.content_data.text}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionDetail;
