import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://unilak-community.vercel.app';

  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/find-classes', changeFrequency: 'daily' as const, priority: 0.95 },
    { path: '/join-events', changeFrequency: 'weekly' as const, priority: 0.85 },
    { path: '/announcements', changeFrequency: 'hourly' as const, priority: 0.9 },
    { path: '/announcements/manage', changeFrequency: 'daily' as const, priority: 0.7 },
    { path: '/information', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/feedback', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/privacy', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/rules', changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
