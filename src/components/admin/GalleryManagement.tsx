import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Loader2,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Instagram,
  ExternalLink,
  Star,
} from 'lucide-react';

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

interface GalleryManagementProps {
  isAdmin : boolean;
  hasmediaRole: boolean;
}

const GalleryManagement = ({ isAdmin, hasmediaRole }: GalleryManagementProps) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  
  // Form states
  const [formType, setFormType] = useState<'image' | 'video'>('image');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formInstagramUrl, setFormInstagramUrl] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems((data as GalleryItem[]) || []);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormType('image');
    setFormTitle('');
    setFormDescription('');
    setFormMediaUrl('');
    setFormThumbnailUrl('');
    setFormInstagramUrl('');
    setEditingItem(null);
  };

  const handleAddItem = async () => {
    if (!formMediaUrl) {
      toast.error('Media URL is required');
      return;
    }

    setActionLoading('add');
    try {
      const newOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 0;
      
      const { error } = await supabase
        .from('gallery_items')
        .insert({
          type: formType,
          title: formTitle || null,
          description: formDescription || null,
          media_url: formMediaUrl,
          thumbnail_url: formThumbnailUrl || null,
          instagram_url: formInstagramUrl || null,
          display_order: newOrder,
        });

      if (error) throw error;

      // Trigger Instagram post if image type and has valid URL
      if (formType === 'image' && formMediaUrl) {
        try {
          const { data: instaData, error: instaError } = await supabase.functions.invoke('post-to-instagram', {
            body: {
              image_url: formMediaUrl,
              caption: formDescription || '',
              title: formTitle || undefined,
            },
          });
          
          if (instaError) {
            console.error('Instagram post failed:', instaError);
            toast.warning('Item added but Instagram post failed');
          } else if (instaData?.success && instaData?.instagram_url) {
            toast.success('Posted to Instagram!');
          }
        } catch (instaErr) {
          console.error('Instagram integration error:', instaErr);
        }
      }

      toast.success('Gallery item added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !formMediaUrl) {
      toast.error('Media URL is required');
      return;
    }

    setActionLoading(editingItem.id);
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({
          type: formType,
          title: formTitle || null,
          description: formDescription || null,
          media_url: formMediaUrl,
          thumbnail_url: formThumbnailUrl || null,
          instagram_url: formInstagramUrl || null,
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success('Gallery item updated');
      resetForm();
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Gallery item deleted');
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    setActionLoading(id);
    try {
      // If setting as featured, unset all other featured items first
      if (featured) {
        await supabase
          .from('gallery_items')
          .update({ is_featured: false })
          .eq('type', 'image');
      }

      const { error } = await supabase
        .from('gallery_items')
        .update({ is_featured: featured })
        .eq('id', id);

      if (error) throw error;

      toast.success(featured ? 'Set as Picture of the Month' : 'Removed from featured');
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoveItem = async (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(i => i.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) {
      return;
    }

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const currentOrder = items[index].display_order;
    const swapOrder = items[swapIndex].display_order;

    setActionLoading(id);
    try {
      // Swap display orders
      await supabase
        .from('gallery_items')
        .update({ display_order: swapOrder })
        .eq('id', items[index].id);

      await supabase
        .from('gallery_items')
        .update({ display_order: currentOrder })
        .eq('id', items[swapIndex].id);

      fetchItems();
    } catch (err: any) {
      toast.error('Failed to reorder items');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormTitle(item.title || '');
    setFormDescription(item.description || '');
    setFormMediaUrl(item.media_url);
    setFormThumbnailUrl(item.thumbnail_url || '');
    setFormInstagramUrl(item.instagram_url || '');
  };

  if (!isAdmin, hasmediarole) {
    return (
      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <p className="text-muted-foreground text-center">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30 flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Gallery Management
        </h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Gallery Item</DialogTitle>
              <DialogDescription>
                Add a new image or video to the gallery. Images use ImageBB links, videos use Google Drive or YouTube links.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formType} onValueChange={(v) => setFormType(v as 'image' | 'video')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  placeholder="e.g., Winter Convoy 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Media URL *</label>
                <Input
                  placeholder={formType === 'image' ? 'ImageBB direct link' : 'Google Drive, YouTube, or Terabox URL'}
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {formType === 'image' 
                    ? 'Use ImageBB direct link (e.g., https://i.ibb.co/...)'
                    : 'Supports Google Drive, YouTube, or Terabox links'}
                </p>
              </div>
              {formType === 'video' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thumbnail URL (Optional)</label>
                  <Input
                    placeholder="Custom thumbnail image URL"
                    value={formThumbnailUrl}
                    onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Brief description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram Post URL (Optional)
                </label>
                <Input
                  placeholder="https://instagram.com/p/..."
                  value={formInstagramUrl}
                  onChange={(e) => setFormInstagramUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Link to the Instagram post for cross-reference
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={actionLoading === 'add'}>
                {actionLoading === 'add' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No gallery items yet. Click "Add Item" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/30"
              >
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {item.type === 'image' ? (
                    <img
                      src={item.media_url}
                      alt={item.title || 'Gallery item'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {item.title || `${item.type === 'image' ? 'Image' : 'Video'} #${index + 1}`}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    {item.is_featured && item.type === 'image' && (
                      <Badge className="text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  {item.instagram_url && (
                    <a
                      href={item.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <Instagram className="w-3 h-3" />
                      Instagram
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Featured Toggle for Images */}
                {item.type === 'image' && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Featured</label>
                    <Switch
                      checked={item.is_featured}
                      onCheckedChange={(checked) => handleToggleFeatured(item.id, checked)}
                      disabled={!!actionLoading}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMoveItem(item.id, 'up')}
                    disabled={index === 0 || !!actionLoading}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMoveItem(item.id, 'down')}
                    disabled={index === items.length - 1 || !!actionLoading}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  
                  <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && resetForm()}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Gallery Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <Select value={formType} onValueChange={(v) => setFormType(v as 'image' | 'video')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Media URL *</label>
                          <Input
                            value={formMediaUrl}
                            onChange={(e) => setFormMediaUrl(e.target.value)}
                          />
                        </div>
                        {formType === 'video' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Thumbnail URL</label>
                            <Input
                              value={formThumbnailUrl}
                              onChange={(e) => setFormThumbnailUrl(e.target.value)}
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Instagram URL</label>
                          <Input
                            value={formInstagramUrl}
                            onChange={(e) => setFormInstagramUrl(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleUpdateItem} disabled={actionLoading === item.id}>
                          {actionLoading === item.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Gallery Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this item from the gallery.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryManagement;
