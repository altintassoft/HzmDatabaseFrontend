export interface SocialMediaLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'whatsapp';
  url: string;
  title: string;
  description?: string;
  isActive: boolean;
  displayLocation: 'header' | 'footer' | 'sidebar' | 'contact' | 'about';
  icon: string;
  color: string;
  followers?: number;
  createdAt: string;
}

export interface SEOSettings {
  id: string;
  pageType: 'home' | 'about' | 'contact' | 'projects' | 'pricing' | 'dashboard';
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots: string;
  structuredData?: any;
  updatedAt: string;
}

export interface GoogleAnalytics {
  trackingId: string;
  isActive: boolean;
  events: {
    pageViews: boolean;
    clicks: boolean;
    formSubmissions: boolean;
    downloads: boolean;
  };
}

export interface GoogleSearchConsole {
  siteUrl: string;
  verificationCode: string;
  isVerified: boolean;
  submitSitemap: boolean;
  sitemapUrl?: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMediaLinks: SocialMediaLink[];
  seoSettings: SEOSettings[];
  googleAnalytics: GoogleAnalytics;
  googleSearchConsole: GoogleSearchConsole;
  facebookPixel?: {
    pixelId: string;
    isActive: boolean;
  };
}