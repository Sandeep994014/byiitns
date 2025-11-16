import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  title: string;
  description: string;
}

interface StudyMaterialContent {
  id: string;
  content_data: {
    category?: string;
    class?: string;
    subject?: string;
  };
}

const classes = ["8", "9", "10", "11", "12"];

const StudyMaterialDetail = () => {
  const { id } = useParams();
  const [section, setSection] = useState<Section | null>(null);
  const [contents, setContents] = useState<StudyMaterialContent[]>([]);
  const [loading, setLoading] = useState(true);

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

        const { data: contentData, error: contentError } = await supabase
          .from("section_content")
          .select("id, content_data")
          .eq("section_id", id)
          .eq("is_active", true);

        if (contentError) throw contentError;
        setContents(contentData || []);
      } catch (error) {
        toast.error("Failed to load study materials");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Get available classes that have content
  const getAvailableClasses = () => {
    const classSet = new Set<string>();
    contents.forEach((content) => {
      const classNum = content.content_data?.class;
      if (classNum && classes.includes(classNum)) {
        classSet.add(classNum);
      }
    });
    return Array.from(classSet).sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading study materials...</p>
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

  const availableClasses = getAvailableClasses();
  const hasContent = contents.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6 group hover:bg-primary/10 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">{section.title}</h1>
          </div>
          <p className="text-lg text-foreground/70">{section.description}</p>
        </div>

        {!hasContent ? (
          <Card className="shadow-card border-4 border-primary/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-primary">No Study Materials Available</CardTitle>
              <CardDescription>
                Study materials are being organized by class. Please check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">Select Your Class</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((classNum) => (
                <Link
                  key={classNum}
                  to={`/study-material/${id}/class/${classNum}`}
                  className="block group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] border-4 border-primary/20 hover:border-primary rounded-3xl overflow-hidden bg-gradient-to-br from-card to-primary/5">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <GraduationCap className="h-12 w-12 text-primary-foreground" />
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-primary-foreground bg-primary/20 px-4 py-2 rounded-full">
                          {classNum}
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-bold text-primary group-hover:text-red transition-colors">
                        Class {classNum}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                      <CardDescription className="text-base text-foreground/70 font-medium">
                        Access study materials for Class {classNum}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterialDetail;

