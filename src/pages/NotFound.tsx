import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";

const NotFound = () => {
  return (
    <PageTransition>
    <Layout>
      <section className="min-h-screen flex items-center justify-center py-24">
        <div className="text-center space-y-8 animate-slide-up">
          <div className="space-y-4">
            <h1 className="font-display text-8xl md:text-9xl font-bold text-primary glow-text-strong">
              404
            </h1>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Route Not Found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Looks like this delivery got lost. The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="hero">
                <Home className="w-5 h-5" />
                Back to Home
              </Button>
            </Link>
            <Button variant="heroOutline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Button>
          </div>
        </div>
      </section>
    </Layout>
    </PageTransition>
  );
};

export default NotFound;
