import { MovieItem } from '../types';
import { fetchMoviesApi } from './apiService';

export async function generateSitemapXmlApi(baseUrl = 'https://cinemawindow.com'): Promise<string> {
  const movies = await fetchMoviesApi();
  return generateSitemapXml(movies, baseUrl);
}

export function generateSitemapXml(movies: MovieItem[], baseUrl = 'https://cinemawindow.com'): string {
  const urls = movies.map(m => `
  <url>
    <loc>${baseUrl}/#movie-${m.id}</loc>
    <lastmod>${new Date(m.createdAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  ${urls}
</urlset>`.trim();
}

export function updatePageSeo(title: string, description: string) {
  document.title = `${title} | REDOS Cinema Window Admin`;
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);
}
