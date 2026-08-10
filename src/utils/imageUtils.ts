export function getCleanImageUrl(url: string | undefined, fallbackType: 'poster' | 'backdrop' = 'poster'): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallbackType === 'poster'
      ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
  }
  return url.trim();
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackUrl?: string) {
  const target = e.currentTarget;
  if (!target.dataset.failed) {
    target.dataset.failed = 'true';
    target.src = fallbackUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
  }
}
