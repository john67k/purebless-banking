import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Calculator,
    DollarSign,
    Calendar,
    TrendingUp,
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    Home,
    Car,
    Building,
    User
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Loan, LoanData } from "../entities/Loan";

interface LoanApplicationForm {
    loan_type: 'personal' | 'business' | 'auto' | 'home';
    amount_requested: string;
    purpose: string;
    employment_status: string;
    annual_income: string;
    term_months: string;
}

type LoanView = 'overview' | 'apply' | 'calculator';

export default function Loans() {
    const [currentView, setCurrentView] = useState < LoanView > ('overview');
    const [loans, setLoans] = useState < LoanData[] > ([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Application form state
    const [applicationForm, setApplicationForm] = useState < LoanApplicationForm > ({
        loan_type: 'personal',
        amount_requested: '',
        purpose: '',
        employment_status: '',
        annual_income: '',
        term_months: '36'
    });

    // Calculator state
    const [calculatorValues, setCalculatorValues] = useState({
        amount: '',
        rate: '8.5',
        term: '36'
    });

    const [errors, setErrors] = useState < Record < string, string>> ({});

    // Load user's loans
    useEffect(() => {
        const loadLoans = async () => {
            setLoading(true);
            try {
                const userLoans = await Loan.list();
                setLoans(userLoans);
            } catch (error) {
                console.error('Failed to load loans:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLoans();
    }, []);

    // Calculate monthly payment for calculator
    const calculateMonthlyPayment = (principal: number, rate: number, term: number): number => {
        if (rate === 0) return principal / term;

        const monthlyRate = rate / 100 / 12;
        const numPayments = term;

        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);
    };

    // Validate application form
    const validateApplication = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!applicationForm.amount_requested || parseFloat(applicationForm.amount_requested) <= 0) {
            newErrors.amount_requested = 'Please enter a valid loan amount';
        }

        if (!applicationForm.purpose.trim()) {
            newErrors.purpose = 'Please describe the loan purpose';
        }

        if (!applicationForm.employment_status.trim()) {
            newErrors.employment_status = 'Please specify your employment status';
        }

        if (!applicationForm.annual_income || parseFloat(applicationForm.annual_income) <= 0) {
            newErrors.annual_income = 'Please enter your annual income';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit loan application
    const submitApplication = async () => {
        if (!validateApplication()) return;

        setIsSubmitting(true);

        try {
            // Calculate estimated credit score
            const creditScore = await Loan.calculateCreditScore(
                parseFloat(applicationForm.annual_income),
                applicationForm.employment_status
            );

            // Determine interest rate based on credit score and loan type
            let interestRate = 8.5; // Base rate
            if (creditScore >= 750) interestRate = 6.5;
            else if (creditScore >= 700) interestRate = 7.5;
            else if (creditScore >= 650) interestRate = 8.5;
            else interestRate = 12.0;

            // Adjust rate by loan type
            switch (applicationForm.loan_type) {
                case 'home':
                    interestRate -= 2.0;
                    break;
                case 'auto':
                    interestRate -= 1.0;
                    break;
                case 'business':
                    interestRate += 1.5;
                    break;
            }

            // Create loan application
            await Loan.create({
                loan_type: applicationForm.loan_type,
                amount_requested: parseFloat(applicationForm.amount_requested),
                purpose: applicationForm.purpose,
                employment_status: applicationForm.employment_status,
                annual_income: parseFloat(applicationForm.annual_income),
                credit_score: creditScore,
                interest_rate: Math.max(3.0, interestRate), // Minimum 3% rate
                term_months: parseInt(applicationForm.term_months),
                status: 'pending'
            });

            // Reload loans
            const updatedLoans = await Loan.list();
            setLoans(updatedLoans);

            // Reset form and go back to overview
            setApplicationForm({
                loan_type: 'personal',
                amount_requested: '',
                purpose: '',
                employment_status: '',
                annual_income: '',
                term_months: '36'
            });
            setCurrentView('overview');

        } catch (error) {
            console.error('Failed to submit loan application:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLoanTypeIcon = (type: string) => {
        switch (type) {
            case 'home':
                return <Home className="h-5 w-5" />;
            case 'auto':
                return <Car className="h-5 w-5" />;
            case 'business':
                return <Building className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
            active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            paid_off: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle },
            defaulted: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle }
        };

        const variant = variants[status as keyof typeof variants] || variants.pending;
        const Icon = variant.icon;

        return (
            <Badge className={`${variant.bg} ${variant.text} flex items-center space-x-1`}>
                <Icon className="h-3 w-3" />
                <span>{status.replace('_', ' ').toUpperCase()}</span>
            </Badge>
        );
    };

    // Loan Calculator View
    if (currentView === 'calculator') {
        const amount = parseFloat(calculatorValues.amount) || 0;
        const rate = parseFloat(calculatorValues.rate) || 0;
        const term = parseInt(calculatorValues.term) || 0;
        const monthlyPayment = amount > 0 && term > 0 ? calculateMonthlyPayment(amount, rate, term) : 0;
        const totalInterest = (monthlyPayment * term) - amount;

        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Loan Calculator</h1>
                        <Button variant="outline" onClick={() => setCurrentView('overview')}>
                            Back to Loans
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Calculator Inputs */}
                        <Card className="p-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculate Your Payment</h2>

                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="calc-amount">Loan Amount</Label>
                                    <div className="relative">
                                        <Input
                                            id="calc-amount"
                                            type="number"
                                            placeholder="25000"
                                            value={calculatorValues.amount}
                                            onChange={(e) => setCalculatorValues(prev => ({ ...prev, amount: e.target.value }))}
                                            className="pl-8"
                                        />
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="calc-rate">Interest Rate (%)</Label>
                                    <Input
                                        id="calc-rate"
                                        type="number"
                                        step="0.1"
                                        value={calculatorValues.rate}
                                        onChange={(e) => setCalculatorValues(prev => ({ ...prev, rate: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="calc-term">Loan Term (months)</Label>
                                    <select
                                        id="calc-term"
                                        value={calculatorValues.term}
                                        onChange={(e) => setCalculatorValues(prev => ({ ...prev, term: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        aria-label="Select loan term"
                                    >
                                        <option value="12">12 months</option>
                                        <option value="24">24 months</option>
                                        <option value="36">36 months</option>
                                        <option value="48">48 months</option>
                                        <option value="60">60 months</option>
                                        <option value="72">72 months</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Results */}
                        <Card className="p-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Breakdown</h2>

                            <div className="space-y-6">
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-sm text-blue-600 mb-2">Monthly Payment</p>
                                        <p className="text-3xl font-bold text-blue-900">
                                            ${monthlyPayment.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Interest</p>
                                        <p className="text-xl font-semibold text-gray-900">
                                            ${totalInterest.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="text-xl font-semibold text-gray-900">
                                            ${(amount + totalInterest).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {amount > 0 && (
                                    <Button
                                        onClick={() => {
                                            setApplicationForm(prev => ({
                                                ...prev,
                                                amount_requested: calculatorValues.amount
                                            }));
                                            setCurrentView('apply');
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Apply for This Loan
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Loan Application View
    if (currentView === 'apply') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Apply for Loan</h1>
                        <Button variant="outline" onClick={() => setCurrentView('overview')}>
                            Cancel
                        </Button>
                    </div>

                    <Card className="p-8">
                        <div className="space-y-6">
                            {/* Loan Type */}
                            <div>
                                <Label>Loan Type</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {[
                                        { value: 'personal', label: 'Personal', icon: User },
                                        { value: 'business', label: 'Business', icon: Building },
                                        { value: 'auto', label: 'Auto', icon: Car },
                                        { value: 'home', label: 'Home', icon: Home }
                                    ].map(({ value, label, icon: Icon }) => (
                                        <label
                                            key={value}
                                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${applicationForm.loan_type === value
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="loan_type"
                                                value={value}
                                                checked={applicationForm.loan_type === value}
                                                onChange={(e) => setApplicationForm(prev => ({
                                                    ...prev,
                                                    loan_type: e.target.value as any
                                                }))}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center space-x-3">
                                                <Icon className="h-5 w-5 text-gray-600" />
                                                <span className="font-medium">{label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Amount and Term */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="amount">Loan Amount</Label>
                                    <div className="relative">
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="25000"
                                            value={applicationForm.amount_requested}
                                            onChange={(e) => setApplicationForm(prev => ({
                                                ...prev,
                                                amount_requested: e.target.value
                                            }))}
                                            className={`pl-8 ${errors.amount_requested ? 'border-red-300' : ''}`}
                                        />
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    </div>
                                    {errors.amount_requested && (
                                        <p className="text-sm text-red-600 mt-1">{errors.amount_requested}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="term">Loan Term</Label>
                                    <select
                                        id="term"
                                        value={applicationForm.term_months}
                                        onChange={(e) => setApplicationForm(prev => ({
                                            ...prev,
                                            term_months: e.target.value
                                        }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        aria-label="Select loan term"
                                    >
                                        <option value="12">12 months</option>
                                        <option value="24">24 months</option>
                                        <option value="36">36 months</option>
                                        <option value="48">48 months</option>
                                        <option value="60">60 months</option>
                                        <option value="72">72 months</option>
                                    </select>
                                </div>
                            </div>

                            {/* Purpose */}
                            <div>
                                <Label htmlFor="purpose">Loan Purpose</Label>
                                <Input
                                    id="purpose"
                                    placeholder="Describe what you'll use the loan for"
                                    value={applicationForm.purpose}
                                    onChange={(e) => setApplicationForm(prev => ({
                                        ...prev,
                                        purpose: e.target.value
                                    }))}
                                    className={errors.purpose ? 'border-red-300' : ''}
                                />
                                {errors.purpose && (
                                    <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
                                )}
                            </div>

                            {/* Employment and Income */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <option value="freelance">Freelancer</option>
                                        <option value="unemployed">Unemployed</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                    {errors.employment_status && (
                                        <p className="text-sm text-red-600 mt-1">{errors.employment_status}</p>
                                    )}
                                </div>

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
                            </div>

                            {/* Submit */}
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
                                    'Submit Loan Application'
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Main Overview
    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Loans</h1>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentView('calculator')}
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculator
                        </Button>
                        <Button
                            onClick={() => setCurrentView('apply')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Apply for Loan
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
                        />
                    </div>
                ) : loans.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No loans yet</h2>
                        <p className="text-gray-500 mb-6">Get started by applying for your first loan</p>
                        <div className="flex items-center justify-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentView('calculator')}
                            >
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculate Payment
                            </Button>
                            <Button
                                onClick={() => setCurrentView('apply')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Apply for Loan
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {loans.map((loan, index) => (
                            <motion.div
                                key={loan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-3 rounded-lg">
                                                {getLoanTypeIcon(loan.loan_type)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {loan.loan_type.charAt(0).toUpperCase() + loan.loan_type.slice(1)} Loan
                                                </h3>
                                                <p className="text-sm text-gray-500">{loan.purpose}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(loan.status)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Amount Requested</p>
                                            <p className="font-semibold">${loan.amount_requested?.toFixed(2)}</p>
                                        </div>
                                        {loan.amount_approved && (
                                            <div>
                                                <p className="text-sm text-gray-500">Amount Approved</p>
                                                <p className="font-semibold text-green-600">${loan.amount_approved.toFixed(2)}</p>
                                            </div>
                                        )}
                                        {loan.interest_rate && (
                                            <div>
                                                <p className="text-sm text-gray-500">Interest Rate</p>
                                                <p className="font-semibold">{loan.interest_rate.toFixed(2)}%</p>
                                            </div>
                                        )}
                                        {loan.monthly_payment && (
                                            <div>
                                                <p className="text-sm text-gray-500">Monthly Payment</p>
                                                <p className="font-semibold">${loan.monthly_payment.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {loan.status === 'active' && loan.balance_remaining && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-500">Remaining Balance</span>
                                                <span className="font-semibold">${loan.balance_remaining.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${((loan.amount_approved! - loan.balance_remaining) / loan.amount_approved!) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}