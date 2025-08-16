
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useState, DragEvent } from 'react';
import { Switch } from '@/components/ui/switch';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoaderCircle, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const addProductFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  details: z.string().min(10, { message: 'Details must be at least 10 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  image: z.string().min(1, 'Product image is required.'),
  availability: z.boolean().default(true),
});

type AddProductFormValues = z.infer<typeof addProductFormSchema>;

export default function AddProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: {
      name: '',
      details: '',
      price: 0,
      image: '',
      availability: true,
    },
    mode: 'onChange',
  });

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          toast({
              variant: 'destructive',
              title: 'File too large',
              description: 'Please upload an image smaller than 2MB.',
          });
          return;
      }
      if (!file.type.startsWith('image/')) {
           toast({
              variant: 'destructive',
              title: 'Invalid file type',
              description: 'Please upload an image file (jpg, png, gif).',
          });
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('image', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('image', '', { shouldValidate: true });
  };


  async function onSubmit(data: AddProductFormValues) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to add a product.',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await addDoc(collection(db, 'products'), {
        vendorId: user.uid,
        name: data.name,
        details: data.details,
        price: data.price,
        imageUrl: data.image,
        availability: data.availability,
        approved: false,
        createdAt: new Date(),
      });

      toast({
        title: 'Product Submitted!',
        description: `${data.name} has been submitted for approval.`,
      });
      router.push('/dashboard/vendor');

    } catch (error: any) {
      console.error("Submission failed:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not add the product.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add a New Product</CardTitle>
          <CardDescription>
            Fill out the details below to list a new item for sale. It will be reviewed by an admin before it's visible to customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jollof Rice" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A delicious pot of party jollof with all the fixings..." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" placeholder="2500" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                     <FormControl>
                        <div>
                        {imagePreview ? (
                            <div className="relative group">
                                <Image
                                    src={imagePreview}
                                    alt="Product preview"
                                    width={600}
                                    height={400}
                                    className="rounded-md object-cover aspect-video"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={removeImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md text-center cursor-pointer hover:border-primary transition-colors",
                                    isDragging ? "border-primary bg-primary/10" : "border-muted"
                                )}
                            >
                                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB</p>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available for Sale</FormLabel>
                      <FormDescription>
                        Set whether this product is currently available to customers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Submitting for Approval...
                  </>
                ) : (
                  'Submit for Approval'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
