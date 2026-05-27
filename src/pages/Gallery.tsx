import { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon, Play, X, Star } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string | null;
  description: string | null;
  media_url: string;
  thumbnail_url: string | null;
  instagram_url: string | null;
  display_order: number;
  is_featured: boolean;
}

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [featuredItem, setFeaturedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const allItems = (data as GalleryItem[]) || [];
      const featured = allItems.find(item => item.is_featured && item.type === 'image');
      const regularItems = allItems.filter(item => !item.is_featured || item.type !== 'image' || item.id !== featured?.id);
      
      setFeaturedItem(featured || null);
      setItems(regularItems);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };
const parseHost = (url: string): string | null => {
    try { return new URL(url).hostname; }
    catch { return null; }
  };
const getVideoEmbedUrl = (url: string): string | null => {
  const host = parseHost(url);
  if (!host) return null;

  if (host === 'drive.google.com') {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'youtu.be') {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1`;
  }

  if (host === 'terabox.com' || host === 'www.terabox.com' ||
      host === 'teraboxapp.com' || host === '1024terabox.com') {
    const shareMatch = url.match(/\/s\/([a-zA-Z0-9_-]+)/);
    if (shareMatch) return `https://www.terabox.com/sharing/embed?surl=${shareMatch[1]}`;
    return url;
  }

  return url;
};

const getVideoThumbnail = (url: string): string | null => {
  const host = parseHost(url);
  if (!host) return null;

  if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'youtu.be') {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
};
  return (
    <PageTransition>
      <Layout>
        <section className="py-16 sm:py-20 md:py-24 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4 animate-slide-up">
              <span className="px-3 sm:px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-xs sm:text-sm tracking-widest inline-block">
                MEMORIES
              </span>
              <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold">
                <span className="text-foreground">Our </span>
                <span className="text-primary glow-text">Gallery</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Explore our convoy moments and memorable journeys
              </p>
              <div className="neon-line max-w-xs mx-auto" />
            </div>

            {/* Picture of the Month */}
            {!loading && featuredItem && (
              <div className="mb-12 sm:mb-16 max-w-4xl mx-auto animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                    Picture of the Month
                  </h2>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div
                  className="relative group rounded-2xl overflow-hidden border-2 border-yellow-500/50 hover:border-yellow-500 transition-all duration-500 cursor-pointer shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:shadow-[0_0_50px_rgba(234,179,8,0.4)]"
                  onClick={() => setSelectedItem(featuredItem)}
                >
                  <div className="aspect-[21/9] sm:aspect-[21/9]">
                    <img
                      src={featuredItem.media_url}
                      alt={featuredItem.title || 'Picture of the Month'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  
                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-yellow-500/90 text-yellow-950 font-display text-xs font-bold flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-current" />
                    FEATURED
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                      {featuredItem.title || 'Picture of the Month'}
                    </h3>
                    {featuredItem.description && (
                      <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                        {featuredItem.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section Divider */}
            {!loading && featuredItem && items.length > 0 && (
              <div className="flex items-center gap-4 mb-10 max-w-6xl mx-auto">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-sm text-muted-foreground font-display tracking-wider">ALL MEDIA</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12 sm:py-16">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
                <span className="ml-3 text-sm sm:text-base text-muted-foreground">Loading gallery...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2">No Gallery Items Yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Check back soon for amazing convoy moments!</p>
              </div>
            )}

            {/* Gallery Grid */}
            {!loading && items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative aspect-video rounded-xl overflow-hidden glass-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:glow-border animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedItem(item)}
                    onMouseEnter={() => item.type === 'video' && setHoveredVideo(item.id)}
                    onMouseLeave={() => setHoveredVideo(null)}
                  >
                    {item.type === 'image' ? (
                      <>
                        <img
                          src={item.media_url}
                          alt={item.title || 'Gallery image'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <>
                        {hoveredVideo === item.id ? (
                          <iframe
                            src={getVideoEmbedUrl(item.media_url) || ''}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            frameBorder="0"
                          />
                        ) : (
                          <>
                            <img
                              src={item.thumbnail_url || getVideoThumbnail(item.media_url) || '/placeholder.svg'}
                              alt={item.title || 'Video thumbnail'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-primary-foreground fill-current" />
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Title overlay */}
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="font-display font-semibold text-foreground truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-background/80 text-foreground backdrop-blur-sm border border-primary/30">
                        {item.type === 'image' ? <ImageIcon className="w-3 h-3 inline" /> : <Play className="w-3 h-3 inline" />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lightbox Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
              <DialogContent className="max-w-4xl w-full p-0 border-primary/30 bg-background/95 backdrop-blur-xl">
                <DialogTitle className="sr-only">
                  {selectedItem?.title || (selectedItem?.type === 'image' ? 'Image' : 'Video')}
                </DialogTitle>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 border border-primary/30 flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {selectedItem && (
                  <div className="relative aspect-video w-full">
                    {selectedItem.type === 'image' ? (
                      <img
                        src={selectedItem.media_url}
                        alt={selectedItem.title || 'Gallery image'}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={getVideoEmbedUrl(selectedItem.media_url) || ''}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media; fullscreen"
                        frameBorder="0"
                      />
                    )}
                  </div>
                )}

                {selectedItem?.title && (
                  <div className="p-4 border-t border-border/30">
                    <h3 className="font-display font-bold text-lg">{selectedItem.title}</h3>
                    {selectedItem.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
                    )}
                    {selectedItem.instagram_url && (
                      <a 
                        href={selectedItem.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
                      >
                        View on Instagram →
                      </a>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </Layout>
    </PageTransition>
  );
};

export default Gallery;
