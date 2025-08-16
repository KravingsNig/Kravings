
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Users, Handshake } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-headline text-primary md:text-5xl">About Kravings</h1>
        <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
          Discover local vendors and satisfy your deepest food cravings, all in one place. We're passionate about connecting food lovers with talented local cooks and vendors.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4 font-headline">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              To make it incredibly easy to find and enjoy authentic, locally-made food. We aim to empower small food businesses by providing them with a platform to reach a wider audience.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4 font-headline">For Our Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Explore a diverse marketplace of culinary delights right in your neighborhood. From traditional meals to innovative snacks, find your next favorite dish on Kravings.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                <Handshake className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4 font-headline">For Our Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Join a vibrant community and grow your business. We provide the tools you need to manage your products, connect with customers, and handle your earnings effortlessly.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
