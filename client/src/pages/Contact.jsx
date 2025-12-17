import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    Droplet,
    AlertCircle,
    CheckCircle
} from "lucide-react";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: ""
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const inquiryTypes = [
        "Blood Donation Inquiry",
        "Blood Request",
        "Partnership Opportunity",
        "Technical Support",
        "Feedback",
        "Other"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!formData.name) e.name = "Required";
        if (!formData.email) e.email = "Required";
        if (!formData.phone) e.phone = "Required";
        if (!formData.subject) e.subject = "Required";
        if (!formData.message) e.message = "Required";
        if (!formData.inquiryType) e.inquiryType = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            console.log("Contact Form:", formData);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: "",
                    inquiryType: ""
                });
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-white">

            {/* NAVBAR */}
            <nav className="bg-white shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Droplet className="h-8 w-8 text-red-600" fill="currentColor" />
                        <span className="text-2xl font-bold">LifeStream</span>
                    </div>

                    <div className="hidden md:flex gap-8">
                        <Link to="/" className="hover:text-red-600">Home</Link>
                        <Link to="/about" className="hover:text-red-600">About</Link>
                        <Link to="/contact" className="text-red-600 font-semibold">Contact</Link>
                    </div>

                    <div className="flex gap-3">
                        <Link to="/login" className="text-red-600 font-medium">Login</Link>
                        <Link to="/register" className="bg-red-600 text-white px-4 py-2 rounded">
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="py-20 bg-red-50 text-center">
                <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    We’re available 24/7 to help with blood donation or emergency requests.
                </p>
            </section>

            {/* FORM */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white p-8 rounded-xl shadow">

                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className="h-8 w-8 text-red-600" />
                            <h2 className="text-3xl font-bold">Send a Message</h2>
                        </div>

                        {submitted ? (
                            <div className="text-center bg-green-50 p-6 rounded">
                                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                <p className="text-green-700 font-semibold">Message sent successfully!</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <input
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                />

                                <input
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                />

                                <input
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                />

                                <select
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                >
                                    <option value="">Select Inquiry</option>
                                    {inquiryTypes.map((i) => (
                                        <option key={i}>{i}</option>
                                    ))}
                                </select>

                                <input
                                    name="subject"
                                    placeholder="Subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                />

                                <textarea
                                    name="message"
                                    rows="5"
                                    placeholder="Your message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                />

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-red-600 text-white py-3 rounded flex justify-center items-center gap-2"
                                >
                                    <Send className="h-5 w-5" /> Send Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-white py-8 text-center">
                <p className="text-gray-400">
                    © 2024 LifeStream. Saving lives, one donation at a time.
                </p>
            </footer>

        </div>
    );
}
