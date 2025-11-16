import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import logo from "@/assets/logo.png";

interface Section {
  id: string;
  title: string;
  description: string;
}

interface SectionContent {
  id: string;
  section_id: string;
  title: string;
  description: string;
  content_type: string;
  content_data: any;
  display_order: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [contents, setContents] = useState<SectionContent[]>([]);
  
  // Form states
  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [contentType, setContentType] = useState<"text" | "link">("text");
  const [contentText, setContentText] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [contentCategory, setContentCategory] = useState("");
  const [contentClass, setContentClass] = useState("");
  const [contentSubject, setContentSubject] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSectionContents();
      // Reset category, class and subject when section changes
      setContentCategory("");
      setContentClass("");
      setContentSubject("");
    }
  }, [selectedSection]);

  useEffect(() => {
    // Reset class when category changes (unless it's "Class 8 to 12")
    if (contentCategory !== "Class 8 to 12") {
      setContentClass("");
    }
  }, [contentCategory]);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchSections();
    } catch (error) {
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .order("display_order");
    
    if (!error && data) {
      setSections(data);
    }
  };

  const fetchSectionContents = async () => {
    const { data, error } = await supabase
      .from("section_content")
      .select("*")
      .eq("section_id", selectedSection)
      .order("display_order");
    
    if (!error && data) {
      setContents(data);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSection) {
      toast.error("Please select a section");
      return;
    }

    const selectedSectionData = sections.find(s => s.id === selectedSection);
    const isStudyMaterial = selectedSectionData?.title?.toLowerCase().includes("study material");

    // Build content data
    let contentData: any = {};
    
    if (isStudyMaterial) {
      if (!contentCategory) {
        toast.error("Please select a Category for Study Materials");
        return;
      }
      contentData.category = contentCategory;
      
      if (contentCategory === "Class 8 to 12") {
        if (!contentClass || !contentSubject) {
          toast.error("Please select both Class and Subject for Class 8 to 12");
          return;
        }
        contentData.class = contentClass;
        contentData.subject = contentSubject;
      } else {
        if (!contentSubject) {
          toast.error("Please select a Subject for Study Materials");
          return;
        }
        contentData.subject = contentSubject;
      }
    }

    if (contentType === "text") {
      contentData.text = contentText;
    } else {
      contentData.url = contentUrl;
    }

    const { error } = await supabase
      .from("section_content")
      .insert({
        section_id: selectedSection,
        title: contentTitle,
        description: contentDescription,
        content_type: contentType,
        content_data: contentData,
        display_order: contents.length + 1,
      });

    if (error) {
      toast.error("Failed to add content");
    } else {
      toast.success("Content added successfully");
      setContentTitle("");
      setContentDescription("");
      setContentText("");
      setContentUrl("");
      setContentCategory("");
      setContentClass("");
      setContentSubject("");
      fetchSectionContents();
    }
  };

  const handleDeleteContent = async (id: string) => {
    const { error } = await supabase
      .from("section_content")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete content");
    } else {
      toast.success("Content deleted successfully");
      fetchSectionContents();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <img src={logo} alt="ByIITians Logo" className="h-16 w-auto mb-4 mx-auto md:mx-0" />
            <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-foreground/70 mt-2">Manage your educational institute content</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="border-2 border-red hover:bg-red hover:text-red-foreground rounded-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Manage Content</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card className="border-4 border-primary/20 rounded-3xl shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Add New Content</CardTitle>
                <CardDescription>Add resources and information to your sections</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddContent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSection && sections.find(s => s.id === selectedSection)?.title?.toLowerCase().includes("study material") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={contentCategory} onValueChange={setContentCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IIT">IIT</SelectItem>
                            <SelectItem value="NEET">NEET</SelectItem>
                            <SelectItem value="CBSE">CBSE</SelectItem>
                            <SelectItem value="NTSE">NTSE</SelectItem>
                            <SelectItem value="Foundation">Foundation</SelectItem>
                            <SelectItem value="Class 8 to 12">Class 8 to 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {contentCategory === "Class 8 to 12" && (
                        <div className="space-y-2">
                          <Label htmlFor="class">Class *</Label>
                          <Select value={contentClass} onValueChange={setContentClass}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8">Class 8</SelectItem>
                              <SelectItem value="9">Class 9</SelectItem>
                              <SelectItem value="10">Class 10</SelectItem>
                              <SelectItem value="11">Class 11</SelectItem>
                              <SelectItem value="12">Class 12</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Select value={contentSubject} onValueChange={setContentSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Math">Math</SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Social Studies">Social Studies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={contentTitle}
                      onChange={(e) => setContentTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={contentDescription}
                      onChange={(e) => setContentDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-type">Content Type</Label>
                    <Select value={contentType} onValueChange={(value: "text" | "link") => setContentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {contentType === "text" ? (
                    <div className="space-y-2">
                      <Label htmlFor="content-text">Content</Label>
                      <Textarea
                        id="content-text"
                        value={contentText}
                        onChange={(e) => setContentText(e.target.value)}
                        rows={6}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="content-url">URL</Label>
                      <Input
                        id="content-url"
                        type="url"
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder="https://..."
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-gradient-accent text-accent-foreground hover:opacity-90 rounded-full font-bold text-lg py-6">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Content
                  </Button>
                </form>
              </CardContent>
            </Card>

            {selectedSection && (
              <Card className="border-4 border-primary/20 rounded-3xl shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Existing Content</CardTitle>
                  <CardDescription>
                    Manage content for {sections.find(s => s.id === selectedSection)?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No content added yet</p>
                    ) : (
                      contents.map((content) => (
                        <div
                          key={content.id}
                          className="flex items-start justify-between p-4 border-2 border-primary/20 rounded-2xl hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary">{content.title}</h4>
                            <p className="text-sm text-foreground/70 mt-1">{content.description}</p>
                            <span className="text-xs bg-accent/20 text-accent-foreground px-3 py-1 rounded-full mt-2 inline-block font-medium">
                              {content.content_type}
                            </span>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteContent(content.id)}
                            className="rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
