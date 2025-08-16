
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { updateEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { LoaderCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

const profileFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  username: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }).optional(),
  businessDescription: z.string().optional(),
  displayPicture: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userData, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      username: '',
      businessName: '',
      address: '',
      businessDescription: '',
    },
    mode: 'onChange',
  });
  
  const imageRef = form.register("displayPicture");

  useEffect(() => {
    if (userData) {
      form.reset({
        email: userData.email || '',
        phone: user?.phoneNumber || userData.phone || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        businessName: userData.businessName || '',
        address: userData.address || '',
        businessDescription: userData.businessDescription || '',
      });
    }
  }, [userData, user, form]);

  async function uploadImageAndGetURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!user) return reject(new Error("User not authenticated"));

      const storageRef = ref(storage, `vendors/${user.uid}/displayPicture`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to update your profile.",
      });
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(null);
    
    try {
      const updates: any = {};
      let hasChanges = false;
      
      // --- 1. Collect textual changes ---
      if (data.email && data.email !== user.email) {
        await updateEmail(user, data.email);
        updates.email = data.email;
        hasChanges = true;
      }
      if (data.phone !== undefined && data.phone !== (user.phoneNumber || userData.phone)) {
        updates.phone = data.phone;
        hasChanges = true;
      }
      if (data.address !== undefined && data.address !== userData.address) {
        updates.address = data.address;
        hasChanges = true;
      }
      if (userData.isVendor && data.businessDescription !== undefined && data.businessDescription !== userData.businessDescription) {
        updates.businessDescription = data.businessDescription;
        hasChanges = true;
      }

      // --- 2. Handle Image Upload ---
      const hasImageToUpload = userData.isVendor && data.displayPicture && data.displayPicture.length > 0;
      if (hasImageToUpload) {
        const file = data.displayPicture[0];
        const imageUrl = await uploadImageAndGetURL(file);
        updates.imageUrl = imageUrl;
        hasChanges = true;
      }
      
      // --- 3. Perform Firestore Update if there are changes ---
      if (hasChanges) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, updates);
        toast({
            title: "Profile updated!",
            description: "Your information has been successfully saved.",
        });
      } else {
        toast({
            title: "No changes",
            description: "You haven't made any changes to your profile.",
        });
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not update your profile.",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }

  if (loading) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="font-headline text-lg text-primary/80">Loading Profile...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Profile</CardTitle>
          <CardDescription>
            Manage your account settings and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex gap-4">
                 <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              {userData?.isVendor ? (
                <>
                 <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="businessDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Tell us about your business..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="displayPicture"
                    render={({ field }) => {
                        return (
                        <FormItem>
                            <FormLabel>Display Picture</FormLabel>
                            <FormControl>
                            <Input type="file" accept="image/*" {...imageRef} disabled={isSubmitting} />
                            </FormControl>
                            <FormDescription>
                               This will be displayed on your vendor card on the homepage.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        );
                    }}
                />
                {uploadProgress !== null && (
                    <Progress value={uploadProgress} className="w-full" />
                )}
                </>
              ) : (
                 <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Changing your email will update your login credentials.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormDescription>
                      A verification might be required to change your phone number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main Street, Lagos, Nigeria" {...field} />
                    </FormControl>
                     <FormDescription>
                      Your delivery address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                    </>
                 ) : (
                    'Update Profile'
                 )}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
