import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    Shield,
    Zap,
    Gift,
    CheckCircle,
    Clock,
    AlertTriangle,
    DollarSign,
    Star,
    ArrowRight,
    ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CardApplication } from "../entities/CardApplication";

interface ApplicationForm {
    card_type: 'basic' | 'premium' | 'business';
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    annual_income: string;
    employment_status: string;
    housing_status: string;
    monthly_rent_mortgage: string;
}

type CardApplicationView = 'cards' | 'apply' | 'status';

export default function CardApplicationPage() {
    const [currentView, setCurrentView] = useState < CardApplicationView > ('cards');
    const [selectedCardType, setSelectedCardType] = useState < 'basic' | 'premium' | 'business' > ('basic');
    const [applications, setApplications] = useState < any[] > ([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [applicationForm, setApplicationForm] = useState < ApplicationForm > ({
        card_type: 'basic',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        annual_income: '',
        employment_status: '',
        housing_status: '',
        monthly_rent_mortgage: ''
    });

    const [errors, setErrors] = useState < Record < string, string>> ({});

    // Load existing applications
    useEffect(() => {
        const loadApplications = async () => {
            setLoading(true);
            try {
                const userApplications = await CardApplication.list();
                setApplications(userApplications);
            } catch (error) {
                console.error('Failed to load applications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, []);

    const cardTypes = [
        {
            id: 'basic',
            name: 'PureBless Basic',
            description: 'Perfect for everyday spending',
            annualFee: 0,
            rewardsRate: '1%',
            creditLimit: '$1,000 - $5,000',
            features: [
                'No annual fee',
                '1% cash back on all purchases',
                'Fraud protection',
                'Mobile app access',
                'Online account management'
            ],
            color: 'from-blue-600 to-blue-800',
            icon: CreditCard,
            recommended: false
        },
        {
            id: 'premium',
            name: 'PureBless Premium',
            description: 'Enhanced rewards and benefits',
            annualFee: 95,
            rewardsRate: '2-3%',
            creditLimit: '$5,000 - $25,000',
            features: [
                '3% cash back on dining & travel',
                '2% cash back on gas & groceries',
                '1% cash back on all other purchases',
                'Purchase protection',
                'Extended warranty',
                'Concierge service'
            ],
            color: 'from-purple-600 to-purple-800',
            icon: Star,
            recommended: true
        },
        {
            id: 'business',
            name: 'PureBless Business',
            description: 'Designed for business expenses',
            annualFee: 0,
            rewardsRate: '2%',
            creditLimit: '$10,000 - $50,000',
            features: [
                'No annual fee first year',
                '2% cash back on business purchases',
                'Expense management tools',
                'Employee cards at no extra cost',
                'Detailed monthly reports',
                'Business-specific rewards'
            ],
            color: 'from-green-600 to-green-800',
            icon: Shield,
            recommended: false
        }
    ];

    // Validate application form
    const validateApplication = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!applicationForm.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!applicationForm.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!applicationForm.email || !applicationForm.email.includes('@')) newErrors.email = 'Valid email is required';
        if (!applicationForm.phone || applicationForm.phone.length < 10) newErrors.phone = 'Valid phone number is required';
        if (!applicationForm.annual_income || parseFloat(applicationForm.annual_income) <= 0) {
            newErrors.annual_income = 'Please enter your annual income';
        }
        if (!applicationForm.employment_status) newErrors.employment_status = 'Employment status is required';
        if (!applicationForm.housing_status) newErrors.housing_status = 'Housing status is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit application
    const submitApplication = async () => {
        if (!validateApplication()) return;

        setIsSubmitting(true);

        try {
            // Determine approval based on income and employment
            const income = parseFloat(applicationForm.annual_income);
            let status = 'pending';
            let creditLimit = 1000;

            if (income >= 75000 && applicationForm.employment_status === 'full-time') {
                status = 'approved';
                creditLimit = selectedCardType === 'business' ? 25000 :
                    selectedCardType === 'premium' ? 15000 : 5000;
            } else if (income >= 40000) {
                status = 'approved';
                creditLimit = selectedCardType === 'business' ? 15000 :
                    selectedCardType === 'premium' ? 10000 : 3000;
            } else if (income >= 25000) {
                status = 'pending';
                creditLimit = 2000;
            } else {
                status = 'rejected';
            }

            await CardApplication.create({
                card_type: selectedCardType,
                first_name: applicationForm.first_name,
                last_name: applicationForm.last_name,
                email: applicationForm.email,
                phone: applicationForm.phone,
                annual_income: parseFloat(applicationForm.annual_income),
                employment_status: applicationForm.employment_status,
                housing_status: applicationForm.housing_status,
                monthly_rent_mortgage: parseFloat(applicationForm.monthly_rent_mortgage || '0'),
                status,
                credit_limit: creditLimit
            });

            // Reload applications
            const updatedApplications = await CardApplication.list();
            setApplications(updatedApplications);

            // Reset form and show status
            setApplicationForm({
                card_type: 'basic',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                annual_income: '',
                employment_status: '',
                housing_status: '',
                monthly_rent_mortgage: ''
            });
            setCurrentView('status');

        } catch (error) {
            console.error('Failed to submit application:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle }
        };

        const variant = variants[status as keyof typeof variants] || variants.pending;
        const Icon = variant.icon;

        return (
            <Badge className={`${variant.bg} ${variant.text} flex items-center space-x-1`}>
                <Icon className="h-3 w-3" />
                <span>{status.toUpperCase()}</span>
            </Badge>
        );
    };

    // Application Status View
    if (currentView === 'status') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
                        <Button variant="outline" onClick={() => setCurrentView('cards')}>
                            Apply for Another Card
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : applications.length === 0 ? (
                        <Card className="p-12 text-center">
                            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h2>
                            <p className="text-gray-500 mb-6">Apply for your first credit card to get started</p>
                            <Button
                                onClick={() => setCurrentView('cards')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Browse Cards
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {applications.map((application, index) => {
                                const cardType = cardTypes.find(c => c.id === application.card_type);
                                return (
                                    <motion.div
                                        key={application.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-3 rounded-lg bg-gradient-to-r ${cardType?.color}`}>
                                                        <CreditCard className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {cardType?.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            Applied on {new Date(application.created_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(application.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Applicant</p>
                                                    <p className="font-medium">
                                                        {application.first_name} {application.last_name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Annual Income</p>
                                                    <p className="font-medium">
                                                        ${application.annual_income?.toLocaleString()}
                                                    </p>
                                                </div>
                                                {application.credit_limit && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">Credit Limit</p>
                                                        <p className="font-medium text-green-600">
                                                            ${application.credit_limit.toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {application.status === 'approved' && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="bg-green-50 p-4 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                            <div>
                                                                <p className="font-medium text-green-800">
                                                                    Congratulations! Your application has been approved.
                                                                </p>
                                                                <p className="text-sm text-green-600">
                                                                    Your card will arrive within 7-10 business days.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {application.status === 'rejected' && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="bg-red-50 p-4 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                                            <div>
                                                                <p className="font-medium text-red-800">
                                                                    Your application was not approved at this time.
                                                                </p>
                                                                <p className="text-sm text-red-600">
                                                                    You may reapply after 90 days or consider a different card type.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Application Form View
    if (currentView === 'apply') {
        const selectedCard = cardTypes.find(card => card.id === selectedCardType);

        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Apply for {selectedCard?.name}</h1>
                        <Button variant="outline" onClick={() => setCurrentView('cards')}>
                            Back to Cards
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Selected Card Preview */}
                        <Card className="p-6 h-fit">
                            <div className={`relative h-48 rounded-xl bg-gradient-to-r ${selectedCard?.color} p-6 text-white mb-6`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedCard?.name}</h3>
                                        <p className="text-sm opacity-90">{selectedCard?.description}</p>
                                    </div>
                                    <CreditCard className="h-8 w-8" />
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <p className="text-sm opacity-75">Credit Limit</p>
                                    <p className="text-lg font-bold">{selectedCard?.creditLimit}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Annual Fee</span>
                                    <span className="font-semibold">
                                        {selectedCard?.annualFee === 0 ? 'FREE' : `$${selectedCard?.annualFee}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rewards Rate</span>
                                    <span className="font-semibold">{selectedCard?.rewardsRate} cash back</span>
                                </div>
                            </div>
                        </Card>

                        {/* Application Form */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h2>

                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={applicationForm.first_name}
                                            onChange={(e) => setApplicationForm(prev => ({
                                                ...prev,
                                                first_name: e.target.value
                                            }))}
                                            className={errors.first_name ? 'border-red-300' : ''}
                                        />
                                        {errors.first_name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={applicationForm.last_name}
                                            onChange={(e) => setApplicationForm(prev => ({
                                                ...prev,
                                                last_name: e.target.value
                                            }))}
                                            className={errors.last_name ? 'border-red-300' : ''}
                                        />
                                        {errors.last_name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={applicationForm.email}
                                            onChange={(e) => setApplicationForm(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            className={errors.email ? 'border-red-300' : ''}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={applicationForm.phone}
                                            onChange={(e) => setApplicationForm(prev => ({
                                                ...prev,
                                                phone: e.target.value
                                            }))}
                                            className={errors.phone ? 'border-red-300' : ''}
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Financial Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="income">Annual Income</Label>
                                        <div className="relative">
                                            <Input
                                                id="income"
                                                type="number"
                                                placeholder="50000"
                                                value={applicationForm.annual_income}
                                                onChange={(e) => setApplicationForm(prev => ({
                                                    ...prev,
                                                    annual_income: e.target.value
                                                }))}
                                                className={`pl-8 ${errors.annual_income ? 'border-red-300' : ''}`}
                                            />
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        </div>
                                        {errors.annual_income && (
                                            <p className="text-sm text-red-600 mt-1">{errors.annual_income}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="employment">Employment Status</Label>
                                        <select
                                            id="employment"
                                            value={applicationForm.employment_status}
                                            onChange={(e) => setApplicationForm(prev => ({
                                                ...prev,
                                                employment_status: e.target.value
                                            }))}
                                            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.employment_status ? 'border-red-300' : ''
                                                }`}
                                            aria-label="Select employment status"
                                        >
                                            <option value="">Select employment status</option>
                                            <option value="full-time">Full-time Employee</option>
                                            <option value="part-time">Part-time Employee</option>
                                            <option value="self-employed">Self-employed</option>
                                            <option value="unemployed">Unemployed</option>
                                            <option value="retired">Retired</option>
                                            <option value="student">Student</option>
                                        </select>
                                        {errors.employment_status && (
                                            <p className="text-sm text-red-600 mt-1">{errors.employment_status}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="housing">Housing Status</Label>
                                        <select
                                            id="housing"
                                            value={applicationForm.housing_status}
                                            onChange={(e) => setApplicationForm(prev => ({
                                                ...prev,
                                                housing_status: e.target.value
                                            }))}
                                            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.housing_status ? 'border-red-300' : ''
                                                }`}
                                            aria-label="Select housing status"
                                        >
                                            <option value="">Select housing status</option>
                                            <option value="own">Own</option>
                                            <option value="rent">Rent</option>
                                            <option value="live-with-family">Live with family</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.housing_status && (
                                            <p className="text-sm text-red-600 mt-1">{errors.housing_status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="monthlyPayment">Monthly Housing Payment</Label>
                                        <div className="relative">
                                            <Input
                                                id="monthlyPayment"
                                                type="number"
                                                placeholder="1200"
                                                value={applicationForm.monthly_rent_mortgage}
                                                onChange={(e) => setApplicationForm(prev => ({
                                                    ...prev,
                                                    monthly_rent_mortgage: e.target.value
                                                }))}
                                                className="pl-8"
                                            />
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={submitApplication}
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Card Selection View (Default)
    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Cards</h1>
                        <p className="text-gray-600">Choose the perfect card for your needs</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentView('status')}
                    >
                        View Applications
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {cardTypes.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {card.recommended && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                        <Badge className="bg-yellow-500 text-white">
                                            <Star className="h-3 w-3 mr-1" />
                                            RECOMMENDED
                                        </Badge>
                                    </div>
                                )}

                                <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                                    {/* Card Visual */}
                                    <div className={`relative h-48 rounded-xl bg-gradient-to-r ${card.color} p-6 text-white mb-6`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold">{card.name}</h3>
                                                <p className="text-sm opacity-90">{card.description}</p>
                                            </div>
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <div className="absolute bottom-6 left-6">
                                            <p className="text-sm opacity-75">Up to</p>
                                            <p className="text-lg font-bold">{card.rewardsRate} Cash Back</p>
                                        </div>
                                    </div>

                                    {/* Card Details */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Annual Fee</span>
                                            <span className="font-semibold">
                                                {card.annualFee === 0 ? (
                                                    <Badge className="bg-green-100 text-green-800">FREE</Badge>
                                                ) : (
                                                    `$${card.annualFee}`
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Credit Limit</span>
                                            <span className="font-semibold">{card.creditLimit}</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                                        <ul className="space-y-2">
                                            {card.features.slice(0, 3).map((feature, idx) => (
                                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                            {card.features.length > 3 && (
                                                <li className="text-sm text-blue-600">
                                                    +{card.features.length - 3} more features
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Apply Button */}
                                    <Button
                                        onClick={() => {
                                            setSelectedCardType(card.id as any);
                                            setApplicationForm(prev => ({ ...prev, card_type: card.id as any }));
                                            setCurrentView('apply');
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Apply Now
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Information Section */}
                <Card className="mt-12 p-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Decision</h3>
                            <p className="text-gray-600">Get approved in seconds with our advanced decision engine</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fraud Protection</h3>
                            <p className="text-gray-600">Advanced security features to protect your account 24/7</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Gift className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rewards Program</h3>
                            <p className="text-gray-600">Earn cash back on every purchase with no limits</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}