import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Upload, X, Save, Video, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { isValidVideoUrl } from '@/lib/videoUtils';
import VideoUploader from '@/components/VideoUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AddPropertyForm = ({ onSuccess, propertyToEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'villa',
    status: 'for_sale',
    is_featured: false,
    is_exclusive: false,
    video_url: '',
  });

  const resetForm = () => {
    setFormData({
        title: '', description: '', location: '', address: '', latitude: '', longitude: '', price: '',
    bedrooms: '', bathrooms: '', area: '', type: 'villa', status: 'for_sale', is_featured: false, is_exclusive: false, video_url: '',
    });
    setExistingImages([]);
    setImageFiles([]);
    setImagePreviews([]);
    setImagesToRemove([]);
  };

  useEffect(() => {
    if (propertyToEdit) {
      // Convertir les valeurs numériques en chaînes pour les champs de formulaire
      setFormData({
        title: propertyToEdit.title || '',
        description: propertyToEdit.description || '',
        location: propertyToEdit.location || '',
        address: propertyToEdit.address || '',
        latitude: propertyToEdit.latitude !== null ? String(propertyToEdit.latitude) : '',
        longitude: propertyToEdit.longitude !== null ? String(propertyToEdit.longitude) : '',
        price: propertyToEdit.price !== null ? String(propertyToEdit.price) : '',
        bedrooms: propertyToEdit.bedrooms !== null ? String(propertyToEdit.bedrooms) : '',
        bathrooms: propertyToEdit.bathrooms !== null ? String(propertyToEdit.bathrooms) : '',
        area: propertyToEdit.area !== null ? String(propertyToEdit.area) : '',
        type: propertyToEdit.type || 'villa',
        status: propertyToEdit.status || 'for_sale',
        is_featured: Boolean(propertyToEdit.is_featured),
        is_exclusive: Boolean(propertyToEdit.is_exclusive),
        video_url: propertyToEdit.video_url || '',
      });

      // Récupérer les images existantes
      const images = Array.isArray(propertyToEdit.property_images) 
        ? propertyToEdit.property_images 
        : [];
      setExistingImages(images);
      
      setImageFiles([]);
      setImagePreviews([]);
      setImagesToRemove([]);
    } else {
        resetForm();
    }
  }, [propertyToEdit]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };
  
  const removeNewImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingImage = (image) => {
    setExistingImages(prev => prev.filter(img => img.id !== image.id));
    setImagesToRemove(prev => [...prev, image]);
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Sanitize numeric fields: convert '' to null and strings to numbers
      const toIntOrNull = (v) => (v === '' || v === undefined || v === null ? null : parseInt(v, 10));
      const toFloatOrNull = (v) => (v === '' || v === undefined || v === null ? null : parseFloat(v));

      const sanitizedData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        latitude: toFloatOrNull(formData.latitude),
        longitude: toFloatOrNull(formData.longitude),
        price: toFloatOrNull(formData.price),
        bedrooms: toIntOrNull(formData.bedrooms),
        bathrooms: toIntOrNull(formData.bathrooms),
        area: toIntOrNull(formData.area),
        type: formData.type,
        status: formData.status,
        is_featured: !!formData.is_featured,
        is_exclusive: !!formData.is_exclusive,
        video_url: formData.video_url,
        agent_id: user.id,
      };

      if (sanitizedData.price === null || Number.isNaN(sanitizedData.price)) {
        toast({ title: "Prix invalide", description: "Veuillez renseigner un prix valide.", variant: "destructive" });
        setLoading(false);
        return;
      }

      let propertyId;
      if (propertyToEdit) {
        // UPDATE
        const { data, error } = await supabase
            .from('properties')
            .update(sanitizedData)
            .eq('id', propertyToEdit.id)
            .select()
            .single();
        if (error) throw error;
        propertyId = data.id;
        toast({ title: "Succès !", description: "La propriété a été mise à jour." });
      } else {
        // INSERT
        const { data, error } = await supabase
            .from('properties')
            .insert([sanitizedData])
            .select()
            .single();
        if (error) throw error;
        propertyId = data.id;
        toast({ title: "Succès !", description: "La propriété a été ajoutée." });
      }

      // Handle image removals
      if (imagesToRemove.length > 0) {
        const imageIdsToRemove = imagesToRemove.map(img => img.id);
        
        await supabase.from('property_images').delete().in('id', imageIdsToRemove);
        
        const pathsToRemove = imagesToRemove.map(img => {
            const url = new URL(img.image_url);
            return url.pathname.split('/property-images/')[1];
        }).filter(Boolean);

        if (pathsToRemove.length > 0) {
            await supabase.storage.from('property-images').remove(pathsToRemove);
        }
      }

      // Handle new image uploads
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map((file) => {
          const fileName = `${propertyId}/${Date.now()}_${file.name}`;
          return supabase.storage.from('property-images').upload(fileName, file);
        });
        const uploadResults = await Promise.all(uploadPromises);

        const imageRecords = [];
        for(const result of uploadResults) {
            if (result.error) throw result.error;
            const { data } = supabase.storage.from('property-images').getPublicUrl(result.data.path);
            imageRecords.push({
                property_id: propertyId,
                image_url: data.publicUrl,
                is_primary: false,
            });
        }
        
        if (imageRecords.length > 0) {
          const { error: imageError } = await supabase.from('property_images').insert(imageRecords);
          if (imageError) throw imageError;
        }
      }
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pr-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'annonce</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localisation (Ville, Pays)</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
          </div>
        </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse complète</Label>
        <Input id="address" name="address" value={formData.address} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Images</Label>
        <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
            <Input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden"/>
            <Label htmlFor="images" className="cursor-pointer text-primary hover:underline flex flex-col items-center justify-center space-y-2">
                <Upload className="w-8 h-8"/>
                <span>Cliquez pour choisir de nouvelles images</span>
            </Label>
        </div>
        {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-4">
                {existingImages.map((image) => (
                    <div key={image.id} className="relative group">
                        <img src={image.image_url} alt="Image existante" className="w-full h-24 object-cover rounded-md"/>
                        <button type="button" onClick={() => removeExistingImage(image)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3"/>
                        </button>
                    </div>
                ))}
                {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group">
                        <img src={src} alt={`Prévisualisation ${index + 1}`} className="w-full h-24 object-cover rounded-md"/>
                        <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3"/>
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Vidéo de la propriété</Label>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload direct</TabsTrigger>
            <TabsTrigger value="url">Lien externe</TabsTrigger>
          </TabsList>
          
          
          
          <TabsContent value="upload" className="mt-4">
            <VideoUploader
              currentVideoUrl={formData.video_url}
              onVideoUploaded={(videoData) => {
                if (videoData) {
                  setFormData(prev => ({ ...prev, video_url: videoData.url }));
                } else {
                  setFormData(prev => ({ ...prev, video_url: '' }));
                }
              }}
              disabled={loading}
            />
          </TabsContent>

          <TabsContent value="url" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">URL de la vidéo (YouTube, Vimeo, etc.)</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="video_url" 
                  name="video_url" 
                  value={formData.video_url} 
                  onChange={handleChange} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className={`pl-10 pr-10 ${formData.video_url && !isValidVideoUrl(formData.video_url) ? 'border-red-500' : formData.video_url && isValidVideoUrl(formData.video_url) ? 'border-green-500' : ''}`}
                />
                {formData.video_url && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidVideoUrl(formData.video_url) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {formData.video_url && !isValidVideoUrl(formData.video_url) && (
                <p className="text-sm text-red-500">
                  URL non valide. Formats supportés : YouTube, Vimeo, Dailymotion, liens directs (MP4, WebM, OGG)
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Exemples : https://youtube.com/watch?v=..., https://vimeo.com/123456789
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (F CFA)</Label>
          <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Chambres</Label>
          <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Salles de bain</Label>
          <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="area">Surface (m²)</Label>
          <Input id="area" name="area" type="number" value={formData.area} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label>Type de bien</Label>
          <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="apartment">Appartement</SelectItem>
              <SelectItem value="house">Maison</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="riad">Riad</SelectItem>
              <SelectItem value="chalet">Chalet</SelectItem>
              <SelectItem value="agricultural_land">Terrain Agricole</SelectItem>
              <SelectItem value="industrial_land">Terrain industriel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="for_sale">À vendre</SelectItem>
              <SelectItem value="for_rent">À louer</SelectItem>
              <SelectItem value="sold">Vendu</SelectItem>
              <SelectItem value="rented">Loué</SelectItem>
              <SelectItem value="coming_soon">Bientôt disponible</SelectItem>
              <SelectItem value="off_plan">En VEFA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox id="is_featured" name="is_featured" checked={formData.is_featured} onCheckedChange={(checked) => handleSelectChange('is_featured', checked)} />
        <Label htmlFor="is_featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Mettre en vedette sur la page d'accueil
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="is_exclusive" name="is_exclusive" checked={formData.is_exclusive} onCheckedChange={(checked) => handleSelectChange('is_exclusive', checked)} />
        <Label htmlFor="is_exclusive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Mandat exclusif (Propriété exclusive)
        </Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full hero-gradient text-primary-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (propertyToEdit ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />) }
        {propertyToEdit ? 'Enregistrer les modifications' : 'Ajouter la propriété'}
      </Button>
    </form>
    </div>
  );
};

export default AddPropertyForm;