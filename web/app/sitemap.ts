import { MetadataRoute } from 'next';
import { AppConfig } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = AppConfig.SITE_URL;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/policies/privacy`,
      lastModified: new Date(AppConfig.ADMIN.PRIVACY_DATE),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/terms`,
      lastModified: new Date(AppConfig.ADMIN.TERMS_DATE),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}

