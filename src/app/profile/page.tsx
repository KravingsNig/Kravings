
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState, ChangeEvent } from 'react';
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
import Image from 'next/image';

const profileFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  username: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }).optional(),
  businessDescription: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userData, loading } = useAuth();
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const [isSubmittingPicture, setIsSubmittingPicture] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const detailsForm = useForm<ProfileFormValues>({
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
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    // Cleanup the object URL on component unmount
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (userData) {
      detailsForm.reset({
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
  }, [userData, user, detailsForm]);

  async function onDetailsSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    setIsSubmittingDetails(true);
    
    try {
      const updates: any = {};
      
      if (data.email && data.email !== user.email) {
        await updateEmail(user, data.email);
        updates.email = data.email;
      }
      if (data.phone !== undefined && data.phone !== (user.phoneNumber || userData.phone)) {
        updates.phone = data.phone;
      }
      if (data.address !== undefined && data.address !== userData.address) {
        updates.address = data.address;
      }
      if (userData.isVendor && data.businessDescription !== undefined && data.businessDescription !== userData.businessDescription) {
        updates.businessDescription = data.businessDescription;
      }
      
      if (Object.keys(updates).length > 0) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, updates);
        toast({ title: "Profile updated!", description: "Your information has been successfully saved." });
      } else {
        toast({ title: "No changes", description: "You haven't made any changes to your profile." });
      }

    } catch (error: any) {
      toast({ variant: "destructive", title: "Uh oh!", description: error.message || "Could not update profile." });
    } finally {
      setIsSubmittingDetails(false);
    }
  }

  async function handlePictureUpload() {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    if (!selectedFile) {
        toast({ variant: "destructive", title: "No file selected", description: "Please select an image to upload." });
        return;
    }

    setIsSubmittingPicture(true);

    const storageRef = ref(storage, `vendors/${user.uid}/displayPicture`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {},
      (error) => {
        console.error("Upload failed:", error);
        toast({ variant: 'destructive', title: "Upload failed", description: error.message });
        setIsSubmittingPicture(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { imageUrl: downloadURL });
        toast({ title: "Picture updated!", description: "Your display picture has been changed." });
        setIsSubmittingPicture(false);
        setSelectedFile(null);
        setImagePreview(null);
      }
    );
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
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
      {userData?.isVendor && (
        <Card className="mb-8 shadow-lg">
           <CardHeader>
            <CardTitle className="font-headline text-2xl">Display Picture</CardTitle>
            <CardDescription>
              This image is shown on your vendor card on the homepage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <Image 
                src={imagePreview || userData.imageUrl || 'https://placehold.co/150x150'} 
                alt="Display Picture Preview" 
                width={150} 
                height={150} 
                className="rounded-lg object-cover aspect-square"
              />
              <div className="space-y-4 flex-1">
                <FormItem>
                  <FormLabel>Upload a new picture</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isSubmittingPicture} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <Button onClick={handlePictureUpload} disabled={isSubmittingPicture || !selectedFile}>
                   {isSubmittingPicture ? 'Uploading...' : 'Upload Picture'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Profile Details</CardTitle>
          <CardDescription>
            Manage your account settings and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...detailsForm}>
            <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-8">
              <div className="flex gap-4">
                 <FormField
                    control={detailsForm.control}
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
                    control={detailsForm.control}
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
                  control={detailsForm.control}
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
                    control={detailsForm.control}
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
                </>
              ) : (
                 <FormField
                    control={detailsForm.control}
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
                control={detailsForm.control}
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
                control={detailsForm.control}
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
                control={detailsForm.control}
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
              <Button type="submit" className="font-semibold" disabled={isSubmittingDetails}>
                {isSubmittingDetails ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Updating Details...
                    </>
                 ) : (
                    'Update Details'
                 )}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    