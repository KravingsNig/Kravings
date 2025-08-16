
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
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const addProductFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  details: z.string().min(10, { message: 'Details must be at least 10 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  image: z.any().refine((files) => files?.length === 1, 'Product image is required.'),
  availability: z.boolean().default(true),
});

type AddProductFormValues = z.infer<typeof addProductFormSchema>;

export default function AddProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: {
      name: '',
      details: '',
      price: 0,
      image: undefined,
      availability: true,
    },
    mode: 'onChange',
  });

  async function onSubmit(data: AddProductFormValues) {
    setIsLoading(true);

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to add a product.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const imageFile = data.image[0];
      const storageRef = ref(storage, `products/${user.uid}/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on('state_changed',
        () => {}, // We no longer track progress, so this is empty.
        (error) => {
          console.error("Upload failed:", error);
          toast({
            variant: "destructive",
            title: "Image upload failed.",
            description: error.message,
          });
          setIsLoading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'products'), {
            vendorId: user.uid,
            name: data.name,
            details: data.details,
            price: data.price,
            imageUrl,
            availability: data.availability,
            approved: false, // Default to not approved
            createdAt: new Date(),
          });

          toast({
            title: 'Product Submitted!',
            description: `${data.name} has been submitted for approval.`,
          });
          router.push('/dashboard/vendor');
        }
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not add the product.',
      });
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
                      <Input placeholder="Jollof Rice" {...field} />
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
                      <Textarea placeholder="A delicious pot of party jollof with all the fixings..." {...field} />
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
                      <Input type="number" step="100" placeholder="2500" {...field} />
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
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.files)}
                      />
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
                {isLoading ? 'Submitting for Approval...' : 'Submit for Approval'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
