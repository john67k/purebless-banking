import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send as SendIcon, User, DollarSign, AlertCircle, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Transaction } from "../entities/Transaction";
import { User as UserEntity } from "../entities/User";
import { FundingMethod } from "../entities/FundingMethod";

interface TransferForm {
    recipient: string;
    amount: string;
    description: string;
    fundingMethodId: string;
}

interface ValidationErrors {
    recipient?: string;
    amount?: string;
    description?: string;
    fundingMethod?: string;
    insufficient?: string;
}

export default function Send() {
    const [form, setForm] = useState < TransferForm > ({
        recipient: '',
        amount: '',
        description: '',
        fundingMethodId: ''
    });

    const [errors, setErrors] = useState < ValidationErrors > ({});
    const [isValidating, setIsValidating] = useState(false);
    const [recipientUser, setRecipientUser] = useState < any > (null);
    const [userBalance, setUserBalance] = useState(2500.75); // Mock current user balance
    const [fundingMethods, setFundingMethods] = useState < any[] > ([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transferStatus, setTransferStatus] = useState < 'idle' | 'processing' | 'success' | 'failed' > ('idle');

    // Load funding methods
    useEffect(() => {
        const loadFundingMethods = async () => {
            const methods = await FundingMethod.list();
            setFundingMethods(methods);
            if (methods.length > 0) {
                setForm(prev => ({ ...prev, fundingMethodId: methods[0].id }));
            }
        };
        loadFundingMethods();
    }, []);

    // Real-time recipient validation
    useEffect(() => {
        const validateRecipient = async () => {
            if (form.recipient.length < 3) {
                setRecipientUser(null);
                return;
            }

            setIsValidating(true);

            // Simulate API call delay
            setTimeout(async () => {
                const users = await UserEntity.list();
                const found = users.find(user =>
                    user.email?.toLowerCase().includes(form.recipient.toLowerCase()) ||
                    user.phone?.includes(form.recipient) ||
                    `${user.first_name} ${user.last_name}`.toLowerCase().includes(form.recipient.toLowerCase())
                );

                setRecipientUser(found || null);
                setIsValidating(false);
            }, 500);
        };

        validateRecipient();
    }, [form.recipient]);

    // Real-time form validation
    useEffect(() => {
        const newErrors: ValidationErrors = {};

        // Recipient validation
        if (form.recipient && !recipientUser && !isValidating) {
            newErrors.recipient = 'Recipient not found';
        }

        // Amount validation
        if (form.amount) {
            const amount = parseFloat(form.amount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.amount = 'Please enter a valid amount';
            } else if (amount > userBalance) {
                newErrors.insufficient = `Insufficient funds. Available: $${userBalance.toFixed(2)}`;
            } else if (amount > 10000) {
                newErrors.amount = 'Transfer limit is $10,000 per transaction';
            }
        }

        // Description validation
        if (form.description && form.description.length > 200) {
            newErrors.description = 'Description must be less than 200 characters';
        }

        setErrors(newErrors);
    }, [form, recipientUser, isValidating, userBalance]);

    const handleInputChange = (field: keyof TransferForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (Object.keys(errors).length > 0 || !recipientUser) {
            return;
        }

        setIsSubmitting(true);
        setTransferStatus('processing');

        try {
            // Create transaction
            await Transaction.create({
                type: 'transfer',
                amount: parseFloat(form.amount),
                description: form.description || 'Money transfer',
                recipient: recipientUser.email,
                recipient_name: `${recipientUser.first_name} ${recipientUser.last_name}`,
                funding_method_id: form.fundingMethodId,
                status: 'completed'
            });

            // Update user balance (in real app, this would be handled by backend)
            setUserBalance(prev => prev - parseFloat(form.amount));

            setTransferStatus('success');

            // Reset form after success
            setTimeout(() => {
                setForm({ recipient: '', amount: '', description: '', fundingMethodId: fundingMethods[0]?.id || '' });
                setRecipientUser(null);
                setTransferStatus('idle');
            }, 3000);

        } catch (error) {
            setTransferStatus('failed');
            setTimeout(() => setTransferStatus('idle'), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = recipientUser && form.amount && Object.keys(errors).length === 0;

    if (transferStatus === 'success') {
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        ${parseFloat(form.amount).toFixed(2)} sent to {recipientUser?.first_name} {recipientUser?.last_name}
                    </p>
                    <Button
                        onClick={() => setTransferStatus('idle')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Send Another Transfer
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Send Money</h1>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                        Balance: ${userBalance.toFixed(2)}
                    </Badge>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Recipient Field */}
                        <div className="space-y-2">
                            <Label htmlFor="recipient">Recipient</Label>
                            <div className="relative">
                                <Input
                                    id="recipient"
                                    type="text"
                                    placeholder="Enter email, phone, or name"
                                    value={form.recipient}
                                    onChange={(e) => handleInputChange('recipient', e.target.value)}
                                    className={errors.recipient ? 'border-red-300' : ''}
                                />
                                <div className="absolute right-3 top-3">
                                    {isValidating && <Clock className="h-4 w-4 text-gray-400 animate-spin" />}
                                    {recipientUser && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    {errors.recipient && <AlertCircle className="h-4 w-4 text-red-500" />}
                                </div>
                            </div>

                            {errors.recipient && (
                                <p className="text-sm text-red-600">{errors.recipient}</p>
                            )}

                            {recipientUser && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                                >
                                    <div className="bg-green-100 rounded-full p-2">
                                        <User className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-800">
                                            {recipientUser.first_name} {recipientUser.last_name}
                                        </p>
                                        <p className="text-sm text-green-600">{recipientUser.email}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

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
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    className={`pl-8 ${errors.amount || errors.insufficient ? 'border-red-300' : ''}`}
                                />
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                            {(errors.amount || errors.insufficient) && (
                                <p className="text-sm text-red-600">{errors.amount || errors.insufficient}</p>
                            )}
                        </div>

                        {/* Funding Method */}
                        <div className="space-y-2">
                            <Label htmlFor="fundingMethod">From</Label>
                            <select
                                id="fundingMethod"
                                aria-label="Select funding method"
                                value={form.fundingMethodId}
                                onChange={(e) => handleInputChange('fundingMethodId', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {fundingMethods.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.type === 'bank_account' ? '🏦' : '💳'} {method.nickname || `${method.type} ending in ${method.last_four}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                type="text"
                                placeholder="What's this for?"
                                value={form.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={errors.description ? 'border-red-300' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: isFormValid ? 1 : 0.6 }}
                        >
                            <Button
                                type="submit"
                                disabled={!isFormValid || isSubmitting || transferStatus === 'processing'}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                {transferStatus === 'processing' ? (
                                    <>
                                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                                        Processing Transfer...
                                    </>
                                ) : (
                                    <>
                                        <SendIcon className="h-4 w-4 mr-2" />
                                        Send ${form.amount || '0.00'}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </Card>

                {/* Quick Transfer Options */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Amounts</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[10, 25, 50, 100].map((amount) => (
                            <Button
                                key={amount}
                                variant="outline"
                                onClick={() => handleInputChange('amount', amount.toString())}
                                className="h-12"
                            >
                                ${amount}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}