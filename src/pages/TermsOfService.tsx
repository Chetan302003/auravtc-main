import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col pt-20">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
                <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />

                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Aura VTC Terms of Service</h1>
                    <div className="flex flex-col sm:flex-row sm:gap-6 mb-8 text-primary font-semibold">
                        <p>Effective Date: 25/09/2025</p>
                        <p>Last Updated: 15/02/2026</p>
                    </div>

                    <div className="space-y-8 text-muted-foreground leading-relaxed">
                        <p>
                            Welcome to Aura VTC, a Virtual Trucking Company ("VTC") operating within TruckersMP and related trucking simulation platforms. Aura VTC connects virtual truckers who share a passion for exploration, convoy events, structured community activities, and professional representation.
                        </p>
                        <p>
                            By joining Aura VTC, using our Discord server, participating in events, or using our booking system and related services, you agree to the following Terms of Service ("ToS"). Please read these terms carefully.
                        </p>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                By applying to Aura VTC, joining our Discord server, participating in convoys, or using any Aura VTC-related services (including our event booking system), you agree to comply with and be bound by these Terms of Service.
                            </p>
                            <p>Violation of any terms may lead to warnings, suspension, or permanent removal from Aura VTC.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">2. Eligibility Requirements</h2>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Age Requirement</h3>
                            <p className="mb-4">You must be at least 14 years old to apply and participate.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Game Requirements</h3>
                            <p className="mb-2">Each applicant must have a minimum of 50 hours combined gameplay in:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Euro Truck Simulator 2 (ETS2)</li>
                                <li>American Truck Simulator (ATS)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Conduct Record</h3>
                            <p>Applicants must not have excessive active bans within TruckersMP. Aura VTC reserves the right to assess eligibility based on overall conduct history.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">3. User Conduct</h2>
                            <p className="mb-4">All members agree to follow Aura VTC’s Code of Conduct, including but not limited to:</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Respectful Communication</h3>
                            <p className="mb-2">Members must interact respectfully in:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-4">
                                <li>Discord channels</li>
                                <li>In-game chats</li>
                                <li>Community events</li>
                            </ul>
                            <p className="mb-6 font-semibold text-foreground">Discriminatory language, harassment, threats, hate speech, or abusive behavior is strictly prohibited.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">In-Game Behavior</h3>
                            <p className="mb-2">Members must:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-4">
                                <li>Follow all TruckersMP rules</li>
                                <li>Drive safely and responsibly</li>
                                <li>Avoid reckless driving, trolling, or intentional disruptions</li>
                            </ul>
                            <p className="mb-6 font-semibold text-foreground">Violations may result in disciplinary action or removal.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Representation of Aura VTC</h3>
                            <p>Members must use the official Aura VTC tag and paintjob during public convoys and official events to maintain a professional and unified appearance.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">4. Discord Server Rules</h2>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Required Membership</h3>
                            <p className="mb-2">All Aura VTC members must join the official Discord server to:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Receive updates</li>
                                <li>Access convoy announcements</li>
                                <li>Communicate with leadership</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Prohibited Content</h3>
                            <p className="mb-2">The following is strictly forbidden:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>NSFW content</li>
                                <li>Illegal content</li>
                                <li>Spam or mass mentions</li>
                                <li>Malicious links</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Voice Channel Conduct</h3>
                            <p className="mb-2">Members must:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Be respectful</li>
                                <li>Avoid excessive background noise</li>
                                <li>Not disrupt communication intentionally</li>
                            </ul>

                            <p className="mb-2 font-semibold text-foreground">Additional rules may be listed within the Discord server and are considered part of these Terms.</p>
                            <p>Aura VTC operates primarily through the Discord platform.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">5. Convoys and Events</h2>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Participation</h3>
                            <p className="mb-6">Aura VTC regularly hosts convoys and events. Participation is voluntary but encouraged.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Convoy Etiquette</h3>
                            <p className="mb-2">During convoys, members must:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Follow convoy leader instructions</li>
                                <li>Maintain safe following distance</li>
                                <li>Communicate issues promptly</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Booking System Compliance</h3>
                            <p className="mb-2">When using Aura VTC’s event booking system:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>All information submitted must be accurate</li>
                                <li>Fake or misleading bookings are prohibited</li>
                                <li>Abuse of the system may result in suspension</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">6. Gaming Accounts and Responsibility</h2>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Account Security</h3>
                            <p className="mb-2">Members are responsible for securing their:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-4">
                                <li>TruckersMP account</li>
                                <li>Steam account</li>
                                <li>Discord account</li>
                            </ul>
                            <p className="mb-6 font-semibold text-foreground">Aura VTC is not responsible for compromised accounts.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Ban Accountability</h3>
                            <p>Members are responsible for any bans received on TruckersMP or related platforms. Repeated bans may result in removal from Aura VTC.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">7. Privacy</h2>
                            <p className="mb-2">Aura VTC collects minimal information necessary for operation, including:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-4">
                                <li>Discord usernames and IDs</li>
                                <li>Gameplay statistics</li>
                                <li>Booking information</li>
                                <li>Event participation records</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">8. Modifications to Terms</h2>
                            <p className="mb-4">Aura VTC reserves the right to modify or update these Terms of Service at any time.</p>
                            <p className="mb-4">Significant changes will be announced via Discord or official communication channels.</p>
                            <p>Continued participation after updates constitutes acceptance of the revised Terms.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">9. Termination of Membership</h2>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Voluntary Termination</h3>
                            <p className="mb-6">Members may leave Aura VTC at any time by notifying HR or Leadership.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Involuntary Termination</h3>
                            <p className="mb-2">Aura VTC reserves the right to remove members who:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-4">
                                <li>Violate these Terms</li>
                                <li>Engage in misconduct</li>
                                <li>Fail to comply with TruckersMP rules</li>
                            </ul>
                            <p>Removed members may appeal through a formal review process if permitted by leadership.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">10. Disclaimer of Warranties</h2>
                            <p className="mb-4">Aura VTC provides a community-based service for entertainment purposes only.</p>
                            <p className="mb-2">We do not guarantee:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-4">
                                <li>Specific gameplay outcomes</li>
                                <li>Rewards</li>
                                <li>Continuous service availability</li>
                            </ul>
                            <p>All participation is voluntary.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">11. Limitation of Liability</h2>
                            <p className="mb-2">Aura VTC is not liable for:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-4">
                                <li>Gameplay-related losses</li>
                                <li>Discord-related disputes</li>
                                <li>Platform outages</li>
                                <li>Indirect or consequential damages</li>
                            </ul>
                            <p>All members assume responsibility for their actions within gaming platforms and community spaces.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">12. Contact Information</h2>
                            <p className="mb-6">For questions regarding these Terms, please contact Aura VTC Leadership through our official Discord server.</p>

                            <p className="mb-4">For any complaints, concerns, or queries regarding our services, users may contact the Management Team through our <Link to="/contact" className="text-primary hover:underline font-semibold">Contact Us</Link> page.</p>

                            <div className="bg-secondary/50 p-6 rounded-xl border border-border/50">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Reach Out To Us</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>
                                            <strong>Website:</strong> Message us using our <Link to="/contact" className="text-primary hover:underline">Contact Form</Link>.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>
                                            <strong>Discord:</strong> Reach out to us through our <a href="https://discord.com/invite/f4tmSvcABx" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Official Discord Server</a>.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>
                                            <strong>Email:</strong> Send an email to <a href="mailto:auratmp7@gmail.com" className="text-primary hover:underline">auratmp7@gmail.com</a>.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <div className="mt-12 pt-8 border-t border-border/50 text-center">
                            <p className="font-semibold text-foreground">
                                By participating in Aura VTC, you acknowledge that you have read, understood, and agreed to these Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsOfService;
