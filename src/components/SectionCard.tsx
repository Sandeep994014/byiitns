import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import testSeriesPdf from "@/assets/testSeries/TEST SERIES BROUCHER .pdf";
import informationBrochurePdf from "@/assets/testSeries/INFORMATION  BROCHURE.pdf";

interface SectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const SectionCard = ({ id, title, description, icon }: SectionCardProps) => {
  const Icon = (Icons[icon as keyof typeof Icons] || Icons.FileText) as LucideIcon;
  
  const isTestSeries = title?.toLowerCase().trim() === "test series";
  const isInformationBrochure = title?.toLowerCase().trim() === "information brochure";
  const isLocationCentre = title?.toLowerCase().trim() === "location & centre" || title?.toLowerCase().includes("location");

  const handleClick = (e: React.MouseEvent) => {
    if (isTestSeries) {
      e.preventDefault();
      window.open(testSeriesPdf, "_blank", "noopener,noreferrer");
    }
    if (isInformationBrochure) {
      e.preventDefault();
      window.open(informationBrochurePdf, "_blank", "noopener,noreferrer");
    }
    if (isLocationCentre) {
      e.preventDefault();
      const address = "41A/1, Kalu Sarai, New Delhi-110016";
      const encodedAddress = encodeURIComponent(address);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
      window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    }
  };

  const cardContent = (
    <Card className="h-full transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] border-4 border-primary/20 hover:border-primary rounded-3xl overflow-hidden bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <Icon className="h-10 w-10 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary group-hover:text-red transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-6">
        <CardDescription className="text-base text-foreground/70 font-medium">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );

  if (isTestSeries || isInformationBrochure || isLocationCentre) {
    return (
      <div onClick={handleClick} className="block group cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={`/section/${id}`} className="block group">
      {cardContent}
    </Link>
  );
};
