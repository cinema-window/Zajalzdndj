import { MovieItem } from '../types';

export function getMediaImage(m: MovieItem, type: 'poster' | 'backdrop' = 'poster'): string {
  if (!m) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
  if (type === 'poster') {
    return m.posterUrl || m.thumbnail || m.backdropUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
  }
  return m.backdropUrl || m.posterUrl || m.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
}

export function getStableReactKey(item: { id: string }, prefix: string = 'item'): string {
  return `${prefix}-${item.id}`;
}
