import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col pt-20">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
                <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />

                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Aura VTC Privacy Policy</h1>
                    <p className="text-primary font-semibold mb-8">Effective Date: 15/02/2026</p>
                    <p className="text-primary font-semibold mb-8">Last Updated  : 16/02/2026</p>
                    
                    <div className="space-y-8 text-muted-foreground leading-relaxed">
                        <p>
                            Aura VTC ("we," "our," or "us") respects your privacy and is committed to protecting any personal information we collect. This Privacy Policy explains what information we collect, how we use it, and how you can control your personal information in connection with your participation in Aura VTC and its associated services, including our Discord server and booking system.
                        </p>
                        <p>
                            By joining Aura VTC and engaging in our activities, you agree to the collection and use of information in accordance with this Privacy Policy.
                        </p>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">1. Information We Collect</h2>
                            <p className="mb-4">To manage and support Aura VTC community activities, we may collect the following types of information:</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Basic Account Information</h3>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Discord username and Discord User ID</li>
                                <li>In-game username</li>
                                <li>Virtual Trucking Company (VTC) name (if applicable)</li>
                                <li>Email address (if provided for event confirmations or booking notifications)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Gameplay Information</h3>
                            <p className="mb-2">To manage participation and validate experience, we may track:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Hours played in Euro Truck Simulator 2 (ETS2)</li>
                                <li>Hours played in American Truck Simulator (ATS)</li>
                                <li>Convoy participation</li>
                                <li>Event attendance</li>
                                <li>In-game performance and compliance with community rules</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Booking and Event Data</h3>
                            <p className="mb-2">When using the Aura VTC event booking system, we may store:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Slot number and slot label</li>
                                <li>VTC booking details</li>
                                <li>Member count</li>
                                <li>Event name</li>
                                <li>Approval or rejection status</li>
                                <li>Administrative notes related to bookings</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Communication Records</h3>
                            <p className="mb-2">We may retain communication records within our Discord server, including:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Text messages</li>
                                <li>Direct messages sent by our bot</li>
                                <li>Event-related announcements</li>
                                <li>Administrative communications</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Behavioral Data</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Attendance records</li>
                                <li>Activity within Aura VTC events</li>
                                <li>Reports of misconduct (if applicable)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">2. How We Use Your Information</h2>
                            <p className="mb-6">We use your information solely to operate and improve the Aura VTC experience. Specifically, we may use your information for:</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Community Management</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Verifying eligibility</li>
                                        <li>Approving applications</li>
                                        <li>Managing membership</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Event Coordination</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Organizing convoys and events</li>
                                        <li>Managing slot bookings</li>
                                        <li>Sending confirmations and updates</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Safety and Compliance</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Enforcing our Terms of Service</li>
                                        <li>Handling disciplinary actions</li>
                                        <li>Preventing abuse or misuse of the booking system</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Communication</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Sending announcements</li>
                                        <li>Sending booking confirmations via Discord or email</li>
                                        <li>Providing support</li>
                                    </ul>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Community Engagement</h3>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Recognizing achievements</li>
                                <li>Maintaining leaderboards</li>
                                <li>Highlighting event participation</li>
                            </ul>

                            <p className="font-semibold text-foreground">We do not sell or rent your personal data.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">3. Data Sharing and Disclosure</h2>
                            <p className="mb-4">Aura VTC does not sell, trade, or transfer your personal information to outside parties. We may share information only in the following limited circumstances:</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Service Providers</h3>
                            <p className="mb-2">We may use trusted third-party services necessary to operate Aura VTC, such as:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Discord (for communication and bot functionality)</li>
                                <li>Website hosting providers</li>
                                <li>Database providers</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Legal Requirements</h3>
                            <p>We may disclose information if required by law, court order, or governmental authority, or to protect the rights, safety, and integrity of Aura VTC and its community.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">4. Data Security</h2>
                            <p className="mb-4">We implement reasonable technical and administrative security measures to protect your personal information from unauthorized access, misuse, or alteration.</p>
                            <p>However, no online platform can guarantee absolute security.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">5. Data Retention</h2>
                            <p className="mb-2">We retain personal information only as long as necessary to:</p>
                            <ul className="list-disc pl-6 space-y-1 mb-6">
                                <li>Operate Aura VTC services</li>
                                <li>Manage bookings and events</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                            <p>Data may be anonymized or deleted when no longer required.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">6. Your Rights and Choices</h2>
                            <p className="mb-4">You have the following rights regarding your information:</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Access and Update</h3>
                            <p className="mb-4">You may request access to or correction of your information by contacting Aura VTC Leadership.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Opt-Out</h3>
                            <p className="mb-4">Participation in Aura VTC is voluntary. You may leave the community at any time.</p>

                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Data Deletion</h3>
                            <p>You may request deletion of your personal data. Upon verified request, we will remove your information from our records, except where retention is legally required.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">7. Third-Party Links and Integrations</h2>
                            <p className="mb-4">Aura VTC may integrate with third-party services related to trucking simulation platforms and community tools. These external platforms operate under their own privacy policies. Aura VTC is not responsible for their data practices.</p>
                            <p>We encourage you to review their privacy policies separately.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">8. Changes to This Privacy Policy</h2>
                            <p className="mb-4">Aura VTC may update this Privacy Policy from time to time to reflect changes in our practices or services.</p>
                            <p className="mb-4">Members will be notified of significant changes through Discord announcements or official communication channels.</p>
                            <p>Continued participation in Aura VTC after such updates constitutes acceptance of the revised Privacy Policy.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 mt-12 pb-2 border-b border-border/50">9. Contact Information</h2>
                            <p className="mb-6">If you have any questions, concerns, or data requests regarding this Privacy Policy, please contact Aura VTC Leadership through our official Discord server.</p>

                            <div className="bg-secondary/50 p-6 rounded-xl border border-border/50">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Reach Out To Us</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>
                                            <strong>Website:</strong> Contact the Management Team through our <Link to="/contact" className="text-primary hover:underline">Contact Us page</Link>.
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
                                By participating in Aura VTC, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
