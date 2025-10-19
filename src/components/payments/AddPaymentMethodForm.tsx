import React, { useState } from "react";
import { FundingMethod } from "@/entities/FundingMethod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building2, X } from "lucide-react";
import { motion } from "framer-motion";

interface AddPaymentMethodFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function AddPaymentMethodForm({ onSuccess, onCancel }: AddPaymentMethodFormProps) {
    const [type, setType] = useState("card");
    const [formData, setFormData] = useState({
        name: "",
        lastFour: "",
        accountNumber: "",
        routingNumber: "",
        cardNumber: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name) {
            setError("Please enter a name for this payment method");
            return;
        }

        if (type === "card" && !formData.cardNumber) {
            setError("Please enter card number");
            return;
        }

        if (type === "bank" && (!formData.accountNumber || !formData.routingNumber)) {
            setError("Please enter account and routing numbers");
            return;
        }

        setIsSubmitting(true);

        try {
            // Extract last 4 digits
            const lastFour = type === "card"
                ? formData.cardNumber.slice(-4)
                : formData.accountNumber.slice(-4);

            await FundingMethod.create({
                type,
                name: formData.name,
                last_four: lastFour,
                is_verified: true
            });

            if (onSuccess) onSuccess();
        } catch (err) {
            setError("Failed to add payment method. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add Payment Method</h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close form"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <Label>Payment Type</Label>
                        <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-2 gap-3 mt-2">
                            <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${type === "card" ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="card" id="card" />
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Card</span>
                                    </div>
                                </div>
                            </label>
                            <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${type === "bank" ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="bank" id="bank" />
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium">Bank</span>
                                    </div>
                                </div>
                            </label>
                        </RadioGroup>
                    </div>

                    {/* Name */}
                    <div>
                        <Label htmlFor="name">
                            {type === "card" ? "Card Nickname" : "Bank Account Name"}
                        </Label>
                        <Input
                            id="name"
                            placeholder={type === "card" ? "e.g., My Visa Card" : "e.g., Chase Checking"}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-2"
                        />
                    </div>

                    {/* Card Fields */}
                    {type === "card" && (
                        <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\s/g, '') })}
                                maxLength={16}
                                className="mt-2"
                            />
                        </div>
                    )}

                    {/* Bank Fields */}
                    {type === "bank" && (
                        <>
                            <div>
                                <Label htmlFor="accountNumber">Account Number</Label>
                                <Input
                                    id="accountNumber"
                                    placeholder="123456789"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="routingNumber">Routing Number</Label>
                                <Input
                                    id="routingNumber"
                                    placeholder="021000021"
                                    value={formData.routingNumber}
                                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                                    maxLength={9}
                                    className="mt-2"
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                            {isSubmitting ? "Adding..." : "Add Method"}
                        </Button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}