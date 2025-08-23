
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
import { db } from '@/lib/firebase';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import Loading from '@/app/loading';
import { Separator } from '@/components/ui/separator';

const profileFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  username: z.string().optional(),
  businessName: z.string().min(2, { message: 'Business name must be at least 2 characters.' }).optional(),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }).optional(),
  businessDescription: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userData, loading, setUserData } = useAuth();
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  
  const [isSubmittingBackground, setIsSubmittingBackground] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [backgroundDataUrl, setBackgroundDataUrl] = useState<string | null>(null);
  
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileDataUrl, setProfileDataUrl] = useState<string | null>(null);

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
  
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setPreview: (url: string) => void,
    setDataUrl: (url: string) => void
  ) => {
    const file = event.target.files?.[0];
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
        setPreview(dataUrl);
        setDataUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

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
      if (userData.isVendor) {
        if (data.businessName && data.businessName !== userData.businessName) {
            updates.businessName = data.businessName;
        }
        if (data.businessDescription !== undefined && data.businessDescription !== userData.businessDescription) {
            updates.businessDescription = data.businessDescription;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, updates);

        setUserData((prev: any) => ({ ...prev, ...updates }));
        
        toast({ title: "Profile updated!", description: "Your information has been successfully saved." });
      } else {
        toast({ title: "No changes", description: "You haven't made any changes to your profile details." });
      }

    } catch (error: any) {
      console.error("Profile update error: ", error);
      toast({ variant: "destructive", title: "Uh oh!", description: error.message || "Could not update profile." });
    } finally {
      setIsSubmittingDetails(false);
    }
  }

  async function handleImageUpload(
    field: 'imageUrl' | 'profileImageUrl',
    dataUrl: string | null,
    setIsSubmitting: (isSubmitting: boolean) => void,
    setPreview: (url: string | null) => void,
    setDataUrl: (url: string | null) => void,
    toastTitle: string
  ) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    if (!dataUrl) {
        toast({ variant: "destructive", title: "No file selected", description: "Please select an image to upload." });
        return;
    }

    setIsSubmitting(true);

    try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { [field]: dataUrl });
        setUserData((prev: any) => ({ ...prev, [field]: dataUrl }));
        toast({ title: toastTitle, description: "Your image has been changed." });
        setDataUrl(null);
        setPreview(null);
    } catch (error: any) {
        console.error("Upload failed:", error);
        toast({ variant: 'destructive', title: "Upload failed", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  }


  if (loading || !userData) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
      {userData?.isVendor && (
        <Card className="mb-8 shadow-lg">
           <CardHeader>
            <CardTitle className="font-headline text-2xl">Store Images</CardTitle>
            <CardDescription>
              Manage the images that represent your store on the homepage.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {/* Background Image Section */}
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <Image 
                src={backgroundPreview || userData.imageUrl || 'https://placehold.co/600x400'} 
                alt="Background Image Preview" 
                width={200} 
                height={112} 
                className="rounded-lg object-cover aspect-video"
                data-ai-hint="store background"
              />
              <div className="space-y-4 flex-1">
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="background-picture">Upload a new background image</Label>
                  <Input id="background-picture" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBackgroundPreview, setBackgroundDataUrl)} disabled={isSubmittingBackground} />
                </div>
                <Button onClick={() => handleImageUpload('imageUrl', backgroundDataUrl, setIsSubmittingBackground, setBackgroundPreview, setBackgroundDataUrl, 'Background Image Updated!')} disabled={isSubmittingBackground || !backgroundDataUrl}>
                   {isSubmittingBackground ? 'Uploading...' : 'Upload Background'}
                </Button>
              </div>
            </div>
            
            <Separator className="my-8" />

            {/* Profile Image Section */}
             <div className="flex flex-col sm:flex-row gap-8 items-center">
              <Image 
                src={profilePreview || userData.profileImageUrl || 'https://placehold.co/150x150'} 
                alt="Profile Picture Preview" 
                width={112} 
                height={112} 
                className="rounded-full object-cover aspect-square"
                data-ai-hint="profile picture"
              />
              <div className="space-y-4 flex-1">
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="profile-picture">Upload a new profile picture</Label>
                  <Input id="profile-picture" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setProfilePreview, setProfileDataUrl)} disabled={isSubmittingProfile} />
                </div>
                <Button onClick={() => handleImageUpload('profileImageUrl', profileDataUrl, setIsSubmittingProfile, setProfilePreview, setProfileDataUrl, 'Profile Picture Updated!')} disabled={isSubmittingProfile || !profileDataUrl}>
                   {isSubmittingProfile ? 'Uploading...' : 'Upload Profile Picture'}
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
                        <Input {...field} />
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
