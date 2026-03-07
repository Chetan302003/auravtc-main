import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, ExternalLink } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col pt-20">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
                <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <div className="bg-card border border-border/50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
                    <h1 className="text-4xl font-display font-bold text-foreground mb-6">Privacy Policy</h1>
                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                        Our full Privacy Policy documentation is hosted securely and publicly on our GitHub repository.
                        We take your privacy seriously. You can read everything about how we collect, handle, and store data by visiting the link below.
                    </p>
                    <a
                        href="https://github.com/Chetan302003/AURA-Privacy-Policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 gap-2"
                    >
                        Read Privacy Policy <ExternalLink className="w-5 h-5" />
                    </a>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
