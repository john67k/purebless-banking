import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowDownLeft,
    Building2,
    CreditCard,
    Zap,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    MapPin,
    Smartphone,
    Shield,
    TrendingDown,
    Calendar
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { FundingMethod } from "../entities/FundingMethod";
import { Transaction } from "../entities/Transaction";

interface CashoutForm {
    amount: string;
    method: 'bank_transfer' | 'instant_transfer' | 'atm_withdrawal' | 'mobile_payment';
    destination_id: string;
    note: string;
}

type CashoutMethod = {
    id: 'bank_transfer' | 'instant_transfer' | 'atm_withdrawal' | 'mobile_payment';
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    fee: number;
    duration: string;
    minAmount: number;
    maxAmount: number;
    color: string;
    available: boolean;
};

export default function Cashout() {
    const [form, setForm] = useState < CashoutForm > ({
        amount: '',
        method: 'bank_transfer',
        destination_id: '',
        note: ''
    });

    const [fundingMethods, setFundingMethods] = useState < any[] > ([]);
    const [userBalance, setUserBalance] = useState(2500.75);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cashoutStatus, setCashoutStatus] = useState < 'idle' | 'processing' | 'success' | 'failed' > ('idle');
    const [errors, setErrors] = useState < Record < string, string>> ({});
    const [selectedMethod, setSelectedMethod] = useState < CashoutMethod | null > (null);

    // Load funding methods
    useEffect(() => {
        const loadFundingMethods = async () => {
            const methods = await FundingMethod.list();
            setFundingMethods(methods);
            if (methods.length > 0 && !form.destination_id) {
                setForm(prev => ({ ...prev, destination_id: methods[0].id }));
            }
        };
        loadFundingMethods();
    }, [form.destination_id]);

    // Cashout methods configuration
    const cashoutMethods: CashoutMethod[] = [
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            description: 'Transfer to your linked bank account',
            icon: Building2,
            fee: 0,
            duration: '1-3 business days',
            minAmount: 1,
            maxAmount: 25000,
            color: 'from-blue-500 to-blue-600',
            available: true
        },
        {
            id: 'instant_transfer',
            name: 'Instant Transfer',
            description: 'Get money in minutes with instant transfer',
            icon: Zap,
            fee: 1.5,
            duration: 'Within 30 minutes',
            minAmount: 10,
            maxAmount: 5000,
            color: 'from-yellow-500 to-orange-500',
            available: true
        },
        {
            id: 'atm_withdrawal',
            name: 'ATM Withdrawal',
            description: 'Generate code for ATM withdrawal',
            icon: MapPin,
            fee: 2.50,
            duration: 'Immediate',
            minAmount: 20,
            maxAmount: 800,
            color: 'from-green-500 to-green-600',
            available: true
        },
        {
            id: 'mobile_payment',
            name: 'Mobile Payment',
            description: 'Send to mobile wallet or payment app',
            icon: Smartphone,
            fee: 0.75,
            duration: 'Immediate',
            minAmount: 5,
            maxAmount: 2000,
            color: 'from-purple-500 to-purple-600',
            available: true
        }
    ];

    // Real-time validation
    useEffect(() => {
        const newErrors: Record<string, string> = {};
        const method = cashoutMethods.find(m => m.id === form.method);

        if (form.amount) {
            const amount = parseFloat(form.amount);

            if (isNaN(amount) || amount <= 0) {
                newErrors.amount = 'Please enter a valid amount';
            } else if (amount > userBalance) {
                newErrors.amount = `Insufficient funds. Available: $${userBalance.toFixed(2)}`;
            } else if (method) {
                if (amount < method.minAmount) {
                    newErrors.amount = `Minimum amount for ${method.name} is $${method.minAmount}`;
                } else if (amount > method.maxAmount) {
                    newErrors.amount = `Maximum amount for ${method.name} is $${method.maxAmount}`;
                }
            }
        }

        if (form.method === 'bank_transfer' && !form.destination_id) {
            newErrors.destination_id = 'Please select a bank account';
        }

        setErrors(newErrors);
    }, [form.amount, form.method, form.destination_id, userBalance]);

    // Calculate total with fees
    const calculateTotal = (): { amount: number; fee: number; total: number } => {
        const amount = parseFloat(form.amount) || 0;
        const method = cashoutMethods.find(m => m.id === form.method);
        const fee = method ? (method.fee < 1 ? amount * (method.fee / 100) : method.fee) : 0;

        return {
            amount,
            fee: Math.round(fee * 100) / 100,
            total: amount + fee
        };
    };

    // Handle cashout submission
    const handleCashout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (Object.keys(errors).length > 0 || !form.amount) {
            return;
        }

        setIsSubmitting(true);
        setCashoutStatus('processing');

        try {
            const { amount, fee } = calculateTotal();
            const method = cashoutMethods.find(m => m.id === form.method);

            // Create withdrawal transaction
            await Transaction.create({
                type: 'withdrawal',
                amount: amount,
                description: `${method?.name} withdrawal${form.note ? ` - ${form.note}` : ''}`,
                funding_method_id: form.destination_id || undefined,
                fee: fee,
                status: form.method === 'instant_transfer' ? 'pending' : 'completed'
            });

            // Update balance
            setUserBalance(prev => prev - (amount + fee));
            setCashoutStatus('success');

            // Reset form after success
            setTimeout(() => {
                setForm({
                    amount: '',
                    method: 'bank_transfer',
                    destination_id: fundingMethods[0]?.id || '',
                    note: ''
                });
                setCashoutStatus('idle');
            }, 3000);

        } catch (error) {
            setCashoutStatus('failed');
            setTimeout(() => setCashoutStatus('idle'), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle method selection
    const handleMethodSelect = (methodId: CashoutMethod['id']) => {
        const method = cashoutMethods.find(m => m.id === methodId);
        setSelectedMethod(method || null);
        setForm(prev => ({ ...prev, method: methodId }));
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

    // Success state
    if (cashoutStatus === 'success') {
        const method = cashoutMethods.find(m => m.id === form.method);
        const { amount, fee } = calculateTotal();

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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cashout Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        ${amount.toFixed(2)} via {method?.name}
                    </p>
                    {fee > 0 && (
                        <p className="text-sm text-gray-500 mb-4">
                            Fee: ${fee.toFixed(2)}
                        </p>
                    )}
                    <p className="text-lg font-semibold text-green-600 mb-6">
                        New Balance: ${userBalance.toFixed(2)}
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-blue-800">
                            Expected arrival: {method?.duration}
                        </p>
                    </div>
                    <Button
                        onClick={() => setCashoutStatus('idle')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Make Another Cashout
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Cash Out</h1>
                        <p className="text-gray-600">Withdraw funds from your account</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                        Available: ${userBalance.toFixed(2)}
                    </Badge>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Cashout Methods */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Choose Method</h2>

                        <div className="space-y-4">
                            {cashoutMethods.map((method) => {
                                const Icon = method.icon;
                                const isSelected = form.method === method.id;

                                return (
                                    <motion.div
                                        key={method.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Card
                                            className={`p-6 cursor-pointer transition-all border-2 ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleMethodSelect(method.id)}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}>
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                                        <div className="flex items-center space-x-2">
                                                            {method.fee === 0 ? (
                                                                <Badge className="bg-green-100 text-green-800">FREE</Badge>
                                                            ) : (
                                                                <span className="text-sm text-gray-500">
                                                                    ${method.fee < 1 ? `${method.fee}%` : method.fee.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 text-sm mb-3">{method.description}</p>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center space-x-1 text-gray-500">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{method.duration}</span>
                                                        </div>
                                                        <span className="text-gray-500">
                                                            ${method.minAmount} - ${method.maxAmount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cashout Form */}
                    <Card className="p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Withdrawal Details</h2>

                        <form onSubmit={handleCashout} className="space-y-6">
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

                            {/* Quick Amount Buttons */}
                            <div>
                                <Label>Quick Amounts</Label>
                                <div className="grid grid-cols-4 gap-3 mt-2">
                                    {[50, 100, 250, 500].map((amount) => (
                                        <Button
                                            key={amount}
                                            type="button"
                                            variant="outline"
                                            onClick={() => setForm(prev => ({ ...prev, amount: amount.toString() }))}
                                            className="h-12"
                                            disabled={amount > userBalance}
                                        >
                                            ${amount}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Destination (for bank transfers) */}
                            {form.method === 'bank_transfer' && fundingMethods.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Transfer To</Label>
                                    <div className="space-y-3">
                                        {fundingMethods.filter(method => method.type === 'bank_account').map((method) => (
                                            <label
                                                key={method.id}
                                                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${form.destination_id === method.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="destination"
                                                    value={method.id}
                                                    checked={form.destination_id === method.id}
                                                    onChange={(e) => setForm(prev => ({ ...prev, destination_id: e.target.value }))}
                                                    className="text-blue-600"
                                                />
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className="p-2 rounded-lg bg-blue-100">
                                                        {getMethodIcon(method.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">
                                                            {method.nickname || `Bank Account ending in ${method.last_four}`}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Account ending in {method.last_four}
                                                        </p>
                                                    </div>
                                                    {method.is_verified && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.destination_id && (
                                        <p className="text-sm text-red-600">{errors.destination_id}</p>
                                    )}
                                </div>
                            )}

                            {/* ATM Code Display (for ATM withdrawal) */}
                            {form.method === 'atm_withdrawal' && form.amount && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <MapPin className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-green-800">ATM Withdrawal Code</span>
                                    </div>
                                    <p className="text-sm text-green-700 mb-2">
                                        After confirmation, you'll receive a 6-digit code to use at any partner ATM
                                    </p>
                                    <p className="text-xs text-green-600">
                                        Code expires in 24 hours • Available at 45,000+ ATMs nationwide
                                    </p>
                                </div>
                            )}

                            {/* Note Field */}
                            <div className="space-y-2">
                                <Label htmlFor="note">Note (Optional)</Label>
                                <Input
                                    id="note"
                                    placeholder="Add a note for this withdrawal"
                                    value={form.note}
                                    onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                                />
                            </div>

                            {/* Fee Summary */}
                            {form.amount && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-3">Transaction Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Withdrawal Amount</span>
                                            <span className="font-medium">${calculateTotal().amount.toFixed(2)}</span>
                                        </div>
                                        {calculateTotal().fee > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Processing Fee</span>
                                                <span className="font-medium">${calculateTotal().fee.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                            <span>Total Deducted</span>
                                            <span>${calculateTotal().total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={!form.amount || Object.keys(errors).length > 0 || isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                {cashoutStatus === 'processing' ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Processing Cashout...
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownLeft className="h-4 w-4 mr-2" />
                                        Withdraw ${form.amount || '0.00'}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Security Notice */}
                <Card className="mt-8 p-6">
                    <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-gray-900 mb-1">Security & Protection</h3>
                            <p className="text-sm text-gray-600">
                                All withdrawals are protected by bank-level security. Instant transfers may be subject to additional verification.
                                You'll receive email and SMS notifications for all cashout transactions.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}