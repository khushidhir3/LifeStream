import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Droplet,
    AlertCircle,
    Eye,
    EyeOff
} from "lucide-react";

export default function DonorRegister() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        password: "",
        confirmPassword: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        bloodGroup: "",
        weight: "",
        lastDonationDate: "",
        medicalConditions: [],
        medications: "",
        allergies: "",
        emergencyName: "",
        emergencyRelation: "",
        emergencyPhone: "",
        termsAccepted: false,
        privacyAccepted: false
    });

    const [errors, setErrors] = useState({});

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const medicalConditionsList = ["None", "Diabetes", "Hypertension", "Asthma", "Heart Disease"];
    const indianStates = ["Punjab", "Delhi", "Uttar Pradesh", "Maharashtra", "Karnataka"];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const handleNext = () => setStep(step + 1);
    const handlePrevious = () => setStep(step - 1);

    const handleSubmit = () => {
        console.log("FORM DATA:", formData);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12">
            <div className="max-w-4xl mx-auto px-4">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <div className="flex justify-center items-center gap-2">
                        <Droplet className="h-10 w-10 text-red-600" fill="currentColor" />
                        <h1 className="text-4xl font-bold">Donor Registration</h1>
                    </div>
                    <p className="text-gray-600 mt-2">Join our community of life savers</p>
                </div>

                {/* FORM CARD */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <input name="firstName" placeholder="First Name"
                                       onChange={handleChange} className="input" />
                                <input name="lastName" placeholder="Last Name"
                                       onChange={handleChange} className="input" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <input name="email" placeholder="Email"
                                       onChange={handleChange} className="input" />
                                <input name="phone" placeholder="Phone"
                                       onChange={handleChange} className="input" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <input type="date" name="dateOfBirth"
                                       onChange={handleChange} className="input" />
                                <select name="gender" onChange={handleChange} className="input">
                                    <option value="">Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    onChange={handleChange}
                                    className="input"
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>

                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-sm text-red-600 mt-2"
                            >
                                {showPassword ? "Hide Password" : "Show Password"}
                            </button>
                        </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <h2 className="text-2xl font-bold mb-6">Address</h2>

                            <textarea name="address" placeholder="Address"
                                      onChange={handleChange} className="input" />

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <input name="city" placeholder="City"
                                       onChange={handleChange} className="input" />
                                <select name="state" onChange={handleChange} className="input">
                                    <option value="">State</option>
                                    {indianStates.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <>
                            <h2 className="text-2xl font-bold mb-6">Medical Info</h2>

                            <div className="grid grid-cols-4 gap-3">
                                {bloodGroups.map(bg => (
                                    <button key={bg}
                                            onClick={() => setFormData(p => ({ ...p, bloodGroup: bg }))}
                                            className={`py-2 rounded ${formData.bloodGroup === bg ? "bg-red-600 text-white" : "bg-gray-100"}`}>
                                        {bg}
                                    </button>
                                ))}
                            </div>

                            <input type="number" name="weight"
                                   placeholder="Weight (kg)"
                                   onChange={handleChange}
                                   className="input mt-4" />
                        </>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                        <>
                            <h2 className="text-2xl font-bold mb-6">Emergency Contact</h2>

                            <input name="emergencyName" placeholder="Contact Name"
                                   onChange={handleChange} className="input" />

                            <input name="emergencyPhone" placeholder="Contact Phone"
                                   onChange={handleChange} className="input mt-4" />

                            <div className="mt-4">
                                <label className="flex gap-2">
                                    <input type="checkbox" name="termsAccepted" onChange={handleChange} />
                                    I accept <Link to="/terms" className="text-red-600">Terms</Link>
                                </label>

                                <label className="flex gap-2 mt-2">
                                    <input type="checkbox" name="privacyAccepted" onChange={handleChange} />
                                    I accept <Link to="/privacy" className="text-red-600">Privacy Policy</Link>
                                </label>
                            </div>
                        </>
                    )}

                    {/* NAV BUTTONS */}
                    <div className="flex justify-between mt-8">
                        {step > 1 && (
                            <button onClick={handlePrevious} className="btn-outline">
                                Previous
                            </button>
                        )}

                        {step < 4 ? (
                            <button onClick={handleNext} className="btn-primary ml-auto">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="btn-success ml-auto">
                                Complete Registration
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-red-600 font-semibold">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}
