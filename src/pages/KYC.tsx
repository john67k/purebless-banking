import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    Upload,
    Camera,
    FileText,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    User,
    CreditCard,
    Home,
    Shield,
    Clock,
    X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface PersonalInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    phone: string;
    email: string;
}

interface AddressInfo {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface DocumentInfo {
    type: string;
    frontImage: File | null;
    backImage: File | null;
    selfieImage: File | null;
}

type KYCStep = 'intro' | 'personal' | 'address' | 'documents' | 'review' | 'verification' | 'complete';

export default function KYC() {
    const [currentStep, setCurrentStep] = useState < KYCStep > ('intro');
    const [personalInfo, setPersonalInfo] = useState < PersonalInfo > ({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        ssn: '',
        phone: '',
        email: ''
    });
    const [addressInfo, setAddressInfo] = useState < AddressInfo > ({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    });
    const [documentInfo, setDocumentInfo] = useState < DocumentInfo > ({
        type: 'drivers_license',
        frontImage: null,
        backImage: null,
        selfieImage: null
    });
    const [errors, setErrors] = useState < Record < string, string>> ({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRefs = {
        front: useRef < HTMLInputElement > (null),
        back: useRef < HTMLInputElement > (null),
        selfie: useRef < HTMLInputElement > (null)
    };

    const steps = [
        { id: 'intro', title: 'Welcome', icon: Shield },
        { id: 'personal', title: 'Personal Info', icon: User },
        { id: 'address', title: 'Address', icon: Home },
        { id: 'documents', title: 'Documents', icon: FileText },
        { id: 'review', title: 'Review', icon: CheckCircle }
    ];

    const validatePersonalInfo = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!personalInfo.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!personalInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!personalInfo.ssn || personalInfo.ssn.length !== 9) newErrors.ssn = 'Valid SSN is required';
        if (!personalInfo.phone || personalInfo.phone.length < 10) newErrors.phone = 'Valid phone number is required';
        if (!personalInfo.email || !personalInfo.email.includes('@')) newErrors.email = 'Valid email is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateAddressInfo = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!addressInfo.street.trim()) newErrors.street = 'Street address is required';
        if (!addressInfo.city.trim()) newErrors.city = 'City is required';
        if (!addressInfo.state.trim()) newErrors.state = 'State is required';
        if (!addressInfo.zipCode || addressInfo.zipCode.length < 5) newErrors.zipCode = 'Valid ZIP code is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateDocuments = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!documentInfo.frontImage) newErrors.frontImage = 'Front of document is required';
        if (documentInfo.type === 'drivers_license' && !documentInfo.backImage) newErrors.backImage = 'Back of document is required';
        if (!documentInfo.selfieImage) newErrors.selfieImage = 'Selfie is required for verification';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = (type: 'front' | 'back' | 'selfie', file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, [type]: 'File size must be less than 5MB' }));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, [type]: 'Only image files are allowed' }));
            return;
        }

        setDocumentInfo(prev => ({ ...prev, [`${type}Image`]: file }));
        setErrors(prev => ({ ...prev, [type]: '' }));
    };

    const nextStep = () => {
        let canProceed = true;

        switch (currentStep) {
            case 'personal':
                canProceed = validatePersonalInfo();
                break;
            case 'address':
                canProceed = validateAddressInfo();
                break;
            case 'documents':
                canProceed = validateDocuments();
                break;
        }

        if (canProceed) {
            const stepOrder: KYCStep[] = ['intro', 'personal', 'address', 'documents', 'review', 'verification', 'complete'];
            const currentIndex = stepOrder.indexOf(currentStep);
            if (currentIndex < stepOrder.length - 1) {
                setCurrentStep(stepOrder[currentIndex + 1]);
            }
        }
    };

    const prevStep = () => {
        const stepOrder: KYCStep[] = ['intro', 'personal', 'address', 'documents', 'review'];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    };

    const submitVerification = async () => {
        setIsSubmitting(true);
        setCurrentStep('verification');

        // Simulate verification process
        setTimeout(() => {
            setCurrentStep('complete');
            setIsSubmitting(false);
        }, 3000);
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

                return (
                    <React.Fragment key={step.id}>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                isActive ? 'bg-blue-500 border-blue-500 text-white' :
                                    'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                            {isCompleted ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-16 h-1 mx-2 transition-all ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    // Intro Step
    if (currentStep === 'intro') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-2xl mx-auto">
                    {renderStepIndicator()}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <Shield className="h-10 w-10 text-blue-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Identity Verification</h1>
                        <p className="text-lg text-gray-600 mb-8">
                            To comply with federal regulations and protect your account, we need to verify your identity.
                        </p>

                        <Card className="p-8 text-left">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">What you'll need:</h2>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <span>Personal information (name, date of birth, SSN)</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <Home className="h-5 w-5 text-blue-600" />
                                    <span>Current address information</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                    <span>Government-issued photo ID</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <Camera className="h-5 w-5 text-blue-600" />
                                    <span>Selfie for identity confirmation</span>
                                </li>
                            </ul>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">This process typically takes 2-3 minutes</p>
                                        <p className="text-sm text-yellow-700">Your information is encrypted and secure</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Button
                            onClick={() => setCurrentStep('personal')}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                        >
                            Start Verification
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Personal Information Step
    if (currentStep === 'personal') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-2xl mx-auto">
                    {renderStepIndicator()}

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Personal Information</h1>

                        <Card className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={personalInfo.firstName}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                        className={errors.firstName ? 'border-red-300' : ''}
                                    />
                                    {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={personalInfo.lastName}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                        className={errors.lastName ? 'border-red-300' : ''}
                                    />
                                    {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={personalInfo.dateOfBirth}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                        className={errors.dateOfBirth ? 'border-red-300' : ''}
                                    />
                                    {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="ssn">Social Security Number</Label>
                                    <Input
                                        id="ssn"
                                        placeholder="123456789"
                                        maxLength={9}
                                        value={personalInfo.ssn}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, ssn: e.target.value.replace(/\D/g, '') }))}
                                        className={errors.ssn ? 'border-red-300' : ''}
                                    />
                                    {errors.ssn && <p className="text-sm text-red-600 mt-1">{errors.ssn}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder="(555) 123-4567"
                                        value={personalInfo.phone}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                                        className={errors.phone ? 'border-red-300' : ''}
                                    />
                                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={personalInfo.email}
                                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                                        className={errors.email ? 'border-red-300' : ''}
                                    />
                                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button variant="outline" onClick={prevStep}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={nextStep}>
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Address Information Step
    if (currentStep === 'address') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-2xl mx-auto">
                    {renderStepIndicator()}

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Address Information</h1>

                        <Card className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        placeholder="123 Main Street"
                                        value={addressInfo.street}
                                        onChange={(e) => setAddressInfo(prev => ({ ...prev, street: e.target.value }))}
                                        className={errors.street ? 'border-red-300' : ''}
                                    />
                                    {errors.street && <p className="text-sm text-red-600 mt-1">{errors.street}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={addressInfo.city}
                                            onChange={(e) => setAddressInfo(prev => ({ ...prev, city: e.target.value }))}
                                            className={errors.city ? 'border-red-300' : ''}
                                        />
                                        {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            placeholder="CA"
                                            maxLength={2}
                                            value={addressInfo.state}
                                            onChange={(e) => setAddressInfo(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                                            className={errors.state ? 'border-red-300' : ''}
                                        />
                                        {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="zipCode">ZIP Code</Label>
                                        <Input
                                            id="zipCode"
                                            placeholder="12345"
                                            value={addressInfo.zipCode}
                                            onChange={(e) => setAddressInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                                            className={errors.zipCode ? 'border-red-300' : ''}
                                        />
                                        {errors.zipCode && <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="country">Country</Label>
                                        <select
                                            id="country"
                                            value={addressInfo.country}
                                            onChange={(e) => setAddressInfo(prev => ({ ...prev, country: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            aria-label="Select country"
                                        >
                                            <option value="US">United States</option>
                                            <option value="CA">Canada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button variant="outline" onClick={prevStep}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={nextStep}>
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Document Upload Step
    if (currentStep === 'documents') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-2xl mx-auto">
                    {renderStepIndicator()}

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Documents</h1>

                        <Card className="p-8">
                            <div className="space-y-6">
                                {/* Document Type Selection */}
                                <div>
                                    <Label>Document Type</Label>
                                    <select
                                        value={documentInfo.type}
                                        onChange={(e) => setDocumentInfo(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                                        aria-label="Select document type"
                                    >
                                        <option value="drivers_license">Driver's License</option>
                                        <option value="passport">Passport</option>
                                        <option value="state_id">State ID</option>
                                    </select>
                                </div>

                                {/* Front of Document */}
                                <div>
                                    <Label>Front of Document</Label>
                                    <div
                                        onClick={() => fileInputRefs.front.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${documentInfo.frontImage ? 'border-green-300 bg-green-50' :
                                                errors.frontImage ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                    >
                                        {documentInfo.frontImage ? (
                                            <div className="space-y-2">
                                                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                                                <p className="text-green-600 font-medium">{documentInfo.frontImage.name}</p>
                                                <p className="text-sm text-gray-500">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                                                <p className="text-gray-600">Click to upload front of document</p>
                                                <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRefs.front}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                                        className="hidden"
                                    />
                                    {errors.frontImage && <p className="text-sm text-red-600 mt-1">{errors.frontImage}</p>}
                                </div>

                                {/* Back of Document (if needed) */}
                                {documentInfo.type === 'drivers_license' && (
                                    <div>
                                        <Label>Back of Document</Label>
                                        <div
                                            onClick={() => fileInputRefs.back.current?.click()}
                                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${documentInfo.backImage ? 'border-green-300 bg-green-50' :
                                                    errors.backImage ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                                                }`}
                                        >
                                            {documentInfo.backImage ? (
                                                <div className="space-y-2">
                                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                                                    <p className="text-green-600 font-medium">{documentInfo.backImage.name}</p>
                                                    <p className="text-sm text-gray-500">Click to change</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                                                    <p className="text-gray-600">Click to upload back of document</p>
                                                    <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRefs.back}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                                            className="hidden"
                                        />
                                        {errors.backImage && <p className="text-sm text-red-600 mt-1">{errors.backImage}</p>}
                                    </div>
                                )}

                                {/* Selfie */}
                                <div>
                                    <Label>Selfie Photo</Label>
                                    <div
                                        onClick={() => fileInputRefs.selfie.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${documentInfo.selfieImage ? 'border-green-300 bg-green-50' :
                                                errors.selfieImage ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                    >
                                        {documentInfo.selfieImage ? (
                                            <div className="space-y-2">
                                                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                                                <p className="text-green-600 font-medium">{documentInfo.selfieImage.name}</p>
                                                <p className="text-sm text-gray-500">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                                                <p className="text-gray-600">Click to upload selfie</p>
                                                <p className="text-sm text-gray-400">Clear photo of your face</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRefs.selfie}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                                        className="hidden"
                                    />
                                    {errors.selfieImage && <p className="text-sm text-red-600 mt-1">{errors.selfieImage}</p>}
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <Button variant="outline" onClick={prevStep}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={nextStep}>
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Review Step
    if (currentStep === 'review') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-2xl mx-auto">
                    {renderStepIndicator()}

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Your Information</h1>

                        <div className="space-y-6">
                            {/* Personal Information */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium">{personalInfo.firstName} {personalInfo.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Date of Birth</p>
                                        <p className="font-medium">{personalInfo.dateOfBirth}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Phone</p>
                                        <p className="font-medium">{personalInfo.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium">{personalInfo.email}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Address Information */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                                <p className="text-sm font-medium">
                                    {addressInfo.street}<br />
                                    {addressInfo.city}, {addressInfo.state} {addressInfo.zipCode}<br />
                                    {addressInfo.country}
                                </p>
                            </Card>

                            {/* Documents */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Document Type</span>
                                        <Badge>{documentInfo.type.replace('_', ' ').toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Front Image</span>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    {documentInfo.backImage && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Back Image</span>
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Selfie</span>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                </div>
                            </Card>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={prevStep}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={submitVerification}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Submit Verification
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Verification Processing
    if (currentStep === 'verification') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Clock className="h-10 w-10 text-blue-600" />
                        </motion.div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Identity</h2>
                    <p className="text-gray-600">
                        Please wait while we process your information...
                    </p>
                </motion.div>
            </div>
        );
    }

    // Verification Complete
    if (currentStep === 'complete') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Complete!</h2>
                    <p className="text-gray-600 mb-6">
                        Your identity has been successfully verified. You now have full access to all account features.
                    </p>
                    <Button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Continue to Dashboard
                    </Button>
                </motion.div>
            </div>
        );
    }

    return null;
}