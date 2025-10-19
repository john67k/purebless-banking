import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, CreditCard, Building2, DollarSign, CheckCircle, AlertCircle, Trash2, Edit3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import AddPaymentMethodForm from "../components/payments/AddPaymentMethodForm";
import { FundingMethod } from "../entities/FundingMethod";
import { Transaction } from "../entities/Transaction";

interface TopUpForm {
    amount: string;
    fundingMethodId: string;
}

export default function TopUp() {
    const [form, setForm] = useState < TopUpForm > ({
        amount: '',
        fundingMethodId: ''
    });

    const [fundingMethods, setFundingMethods] = useState < any[] > ([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [topUpStatus, setTopUpStatus] = useState < 'idle' | 'processing' | 'success' | 'failed' > ('idle');
    const [userBalance, setUserBalance] = useState(2500.75);
    const [errors, setErrors] = useState < { amount?: string } > ({});

    // Load funding methods
    useEffect(() => {
        loadFundingMethods();
    }, []);

    const loadFundingMethods = async () => {
        const methods = await FundingMethod.list();
        setFundingMethods(methods);
        if (methods.length > 0 && !form.fundingMethodId) {
            setForm(prev => ({ ...prev, fundingMethodId: methods[0].id }));
        }
    };

    // Validate amount in real-time
    useEffect(() => {
        const newErrors: { amount?: string } = {};

        if (form.amount) {
            const amount = parseFloat(form.amount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.amount = 'Please enter a valid amount';
            } else if (amount > 5000) {
                newErrors.amount = 'Maximum top-up amount is $5,000';
            } else if (amount < 1) {
                newErrors.amount = 'Minimum top-up amount is $1';
            }
        }

        setErrors(newErrors);
    }, [form.amount]);

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.amount || !form.fundingMethodId || Object.keys(errors).length > 0) {
            return;
        }

        setIsSubmitting(true);
        setTopUpStatus('processing');

        try {
            // Create transaction
            const selectedMethod = fundingMethods.find(m => m.id === form.fundingMethodId);

            await Transaction.create({
                type: 'deposit',
                amount: parseFloat(form.amount),
                description: `Top up from ${selectedMethod?.nickname || selectedMethod?.type}`,
                funding_method_id: form.fundingMethodId,
                status: 'completed'
            });

            // Update balance
            setUserBalance(prev => prev + parseFloat(form.amount));
            setTopUpStatus('success');

            // Reset form
            setTimeout(() => {
                setForm({ amount: '', fundingMethodId: fundingMethods[0]?.id || '' });
                setTopUpStatus('idle');
            }, 3000);

        } catch (error) {
            setTopUpStatus('failed');
            setTimeout(() => setTopUpStatus('idle'), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMethod = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this payment method?')) {
            await FundingMethod.delete(id);
            await loadFundingMethods();

            // Reset form if deleted method was selected
            if (form.fundingMethodId === id) {
                setForm(prev => ({ ...prev, fundingMethodId: fundingMethods[0]?.id || '' }));
            }
        }
    };

    const getMethodIcon = (type: string) => {
        switch (type) {
            case 'bank_account':
                return <Building2 className="h-5 w-5" />;
            case 'card':
            default:
                return <CreditCard className="h-5 w-5" />;
        }
    };

    const getMethodDisplay = (method: any) => {
        const typeDisplay = method.type === 'bank_account' ? 'Bank Account' : 'Card';
        return `${typeDisplay} ending in ${method.last_four}`;
    };

    if (topUpStatus === 'success') {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md mx-auto text-center"
                >
                    <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Funds Added!</h2>
                    <p className="text-gray-600 mb-4">
                        Successfully added ${parseFloat(form.amount).toFixed(2)} to your account
                    </p>
                    <p className="text-lg font-semibold text-green-600 mb-6">
                        New Balance: ${userBalance.toFixed(2)}
                    </p>
                    <Button
                        onClick={() => setTopUpStatus('idle')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Add More Funds
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                        Current Balance: ${userBalance.toFixed(2)}
                    </Badge>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Top Up Form */}
                    <Card className="p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Funds to Account</h2>

                        <form onSubmit={handleTopUp} className="space-y-6">
                            {/* Amount Field */}
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <div className="relative">
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                                        className={`pl-8 ${errors.amount ? 'border-red-300' : ''}`}
                                    />
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                                {errors.amount && (
                                    <p className="text-sm text-red-600">{errors.amount}</p>
                                )}
                            </div>

                            {/* Payment Method Selection */}
                            {fundingMethods.length > 0 && (
                                <div className="space-y-2">
                                    <Label>From Payment Method</Label>
                                    <div className="space-y-3">
                                        {fundingMethods.map((method) => (
                                            <label
                                                key={method.id}
                                                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${form.fundingMethodId === method.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="fundingMethod"
                                                    value={method.id}
                                                    checked={form.fundingMethodId === method.id}
                                                    onChange={(e) => setForm(prev => ({ ...prev, fundingMethodId: e.target.value }))}
                                                    className="text-blue-600"
                                                />
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className={`p-2 rounded-lg ${method.type === 'bank_account' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                        {getMethodIcon(method.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">
                                                            {method.nickname || getMethodDisplay(method)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {getMethodDisplay(method)}
                                                        </p>
                                                    </div>
                                                    {method.is_verified && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Amount Buttons */}
                            <div>
                                <Label>Quick Amounts</Label>
                                <div className="grid grid-cols-4 gap-3 mt-2">
                                    {[25, 50, 100, 200].map((amount) => (
                                        <Button
                                            key={amount}
                                            type="button"
                                            variant="outline"
                                            onClick={() => setForm(prev => ({ ...prev, amount: amount.toString() }))}
                                            className="h-12"
                                        >
                                            ${amount}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={!form.amount || !form.fundingMethodId || Object.keys(errors).length > 0 || isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                {topUpStatus === 'processing' ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Add ${form.amount || '0.00'} to Account
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>

                    {/* Payment Methods Management */}
                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Method
                            </Button>
                        </div>

                        {fundingMethods.length === 0 ? (
                            <div className="text-center py-8">
                                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">No payment methods added yet</p>
                                <Button
                                    onClick={() => setShowAddForm(true)}
                                    variant="outline"
                                >
                                    Add Your First Method
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fundingMethods.map((method) => (
                                    <motion.div
                                        key={method.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${method.type === 'bank_account' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                {getMethodIcon(method.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {method.nickname || getMethodDisplay(method)}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-sm text-gray-500">
                                                        {getMethodDisplay(method)}
                                                    </p>
                                                    {method.is_verified && (
                                                        <Badge variant="outline" className="text-green-600 border-green-200">
                                                            Verified
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteMethod(method.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Add Payment Method Modal */}
            {showAddForm && (
                <AddPaymentMethodForm
                    onSuccess={() => {
                        setShowAddForm(false);
                        loadFundingMethods();
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
}