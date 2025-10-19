import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DollarSign } from "lucide-react";
import { Invoice } from "../../entities/Invoice";
import { Payment } from "../../entities/Payment";

interface PaymentFormProps {
    invoice: Invoice;
    onSave: (payment: Omit<Payment, 'id' | 'created_date' | 'updated_date'>) => void;
    onCancel: () => void;
}

export default function PaymentForm({ invoice, onSave, onCancel }: PaymentFormProps) {
    const [payment, setPayment] = useState < Omit < Payment, 'id' | 'created_date' | 'updated_date' >> ({
        invoice_id: invoice.id,
        payment_date: new Date().toISOString().split('T')[0],
        amount: invoice.total_amount,
        payment_method: invoice.payment_method || 'bank_transfer',
        transaction_id: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(payment);
    };

    const handleInputChange = (field: keyof typeof payment, value: any) => {
        setPayment(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Record Payment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Invoice Number</Label>
                            <Input value={invoice.invoice_number} disabled />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Date</Label>
                            <Input
                                type="date"
                                value={payment.payment_date}
                                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={payment.amount}
                                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={payment.payment_method} onValueChange={(v) => handleInputChange('payment_method', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="cash_app">Cash App</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="zelle">Zelle</SelectItem>
                                    <SelectItem value="venmo">Venmo</SelectItem>
                                    <SelectItem value="check">Check</SelectItem>
                                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Transaction ID</Label>
                            <Input
                                value={payment.transaction_id}
                                onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                                placeholder="Reference number"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={payment.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Additional payment details..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                Record Payment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}