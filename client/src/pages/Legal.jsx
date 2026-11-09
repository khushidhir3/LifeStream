import React from "react";
import { Link } from "react-router-dom";
import { FileText, Shield } from "lucide-react";

const UPDATED = "6 November 2026";
const CONTACT_EMAIL = "help@lifestream.org";

function LegalLayout({ icon: Icon, title, children }) {
    return (
        <div className="bg-[#0a0a0f] text-white min-h-screen pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson-600/10 border border-crimson-600/20 mb-6">
                    <Icon className="h-4 w-4 text-crimson-500" />
                    <span className="text-crimson-400 text-sm font-medium">Legal</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-2">{title}</h1>
                <p className="text-white/40 text-sm mb-12">Last updated: {UPDATED}</p>
                <div className="space-y-10 text-white/70 leading-relaxed [&_h2]:text-xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p]:mb-3">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function TermsPage() {
    return (
        <LegalLayout icon={FileText} title="Terms of Service">
            <section>
                <h2>1. About LifeStream</h2>
                <p>LifeStream is a platform that connects voluntary blood donors with patients, families, hospitals and blood banks. LifeStream does not collect, test, store or transfuse blood, and is not a medical provider. All donations happen at licensed blood banks or hospitals, which are responsible for screening and medical decisions.</p>
            </section>
            <section>
                <h2>2. Eligibility</h2>
                <ul>
                    <li>You must be at least 18 years old to create an account.</li>
                    <li>To register as a donor you must be between 18 and 65 years old and weigh at least 45 kg, in line with National Blood Transfusion Council (NBTC) guidelines.</li>
                    <li>Final eligibility to donate is always decided by the blood bank's medical staff at the time of donation.</li>
                </ul>
            </section>
            <section>
                <h2>3. Your account</h2>
                <ul>
                    <li>You agree to provide accurate, current information, including your blood group and last donation date.</li>
                    <li>You are responsible for keeping your password secure and for activity under your account.</li>
                    <li>You can update your availability or delete your account at any time from Settings.</li>
                </ul>
            </section>
            <section>
                <h2>4. Blood requests</h2>
                <ul>
                    <li>Requests must be genuine and relate to a real patient need. False or misleading requests may lead to suspension and may be reported to authorities.</li>
                    <li>Blood must never be bought or sold. Any request offering or demanding payment for blood is prohibited (sale of blood is illegal in India).</li>
                    <li>LifeStream does not guarantee that a donor will respond or that a request will be fulfilled.</li>
                </ul>
            </section>
            <section>
                <h2>5. Acceptable use</h2>
                <ul>
                    <li>Do not use donor contact details for marketing, harassment or any purpose other than arranging a blood donation.</li>
                    <li>Do not scrape, copy or resell donor data, or attempt to access accounts or systems that are not yours.</li>
                    <li>API access is available only through keys issued by LifeStream and is subject to the limits on that key.</li>
                </ul>
            </section>
            <section>
                <h2>6. Liability</h2>
                <p>The platform is provided "as is". To the extent permitted by law, LifeStream is not liable for any loss arising from the use of the platform, from communications between users, or from any donation or transfusion. Nothing in these terms limits liability that cannot be limited by law.</p>
            </section>
            <section>
                <h2>7. Suspension and changes</h2>
                <p>We may suspend accounts that break these terms. We may update these terms; if the changes are significant we will notify you in the app or by email. Continuing to use LifeStream after changes means you accept them.</p>
            </section>
            <section>
                <h2>8. Governing law and contact</h2>
                <p>These terms are governed by the laws of India. Questions: <a className="text-crimson-400 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our <Link to="/privacy" className="text-crimson-400 underline">Privacy Policy</Link>.</p>
            </section>
        </LegalLayout>
    );
}

export function PrivacyPage() {
    return (
        <LegalLayout icon={Shield} title="Privacy Policy">
            <section>
                <h2>1. What we collect</h2>
                <ul>
                    <li><strong className="text-white">Account details:</strong> name, email, phone number and password (stored only as a secure hash).</li>
                    <li><strong className="text-white">Donor profile:</strong> blood group, date of birth, gender, weight, city, state, address, PIN code, last donation date, and optional medical conditions, medications and allergies.</li>
                    <li><strong className="text-white">Emergency contact:</strong> name, relation and phone, if you provide them.</li>
                    <li><strong className="text-white">Activity:</strong> donations you log, requests you create or respond to, and notifications.</li>
                </ul>
            </section>
            <section>
                <h2>2. How we use it</h2>
                <ul>
                    <li>To match you with nearby blood requests for compatible blood groups and notify you.</li>
                    <li>To calculate when you are next eligible to donate.</li>
                    <li>To let verified hospitals, blood banks and requesters find and contact available donors.</li>
                    <li>To send account emails such as password resets.</li>
                </ul>
                <p>We convert your city/address into approximate map coordinates using OpenStreetMap so we can show distances. We do not sell your personal data.</p>
            </section>
            <section>
                <h2>3. What others can see</h2>
                <ul>
                    <li>In public donor search: your first and last name, blood group, city, availability, verification status and donation count.</li>
                    <li>Your phone and email are hidden (masked) in search. They are shown only to signed-in users who choose to contact you, and you get a notification each time that happens.</li>
                    <li>Approved partner organisations using our API may see contact details only if LifeStream has explicitly allowed it for their key.</li>
                    <li>Your address, date of birth, medical details and emergency contact are never shown publicly.</li>
                </ul>
            </section>
            <section>
                <h2>4. Your choices and rights</h2>
                <ul>
                    <li>Turn your availability off at any time to stop appearing as available and stop receiving request alerts.</li>
                    <li>Edit your details or switch off email notifications in Settings.</li>
                    <li>Delete your account from Settings; this permanently removes your profile, donation history and notifications.</li>
                    <li>You may ask us for a copy of your data or to correct it, as provided under the Digital Personal Data Protection Act, 2023.</li>
                </ul>
            </section>
            <section>
                <h2>5. Security and retention</h2>
                <p>Passwords are hashed with bcrypt, sessions use signed tokens, and access to admin tools is restricted. We keep your data while your account is active and delete it when you delete your account, except where the law requires us to keep records.</p>
            </section>
            <section>
                <h2>6. Contact</h2>
                <p>For privacy questions or requests, email <a className="text-crimson-400 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our <Link to="/terms" className="text-crimson-400 underline">Terms of Service</Link>.</p>
            </section>
        </LegalLayout>
    );
}
