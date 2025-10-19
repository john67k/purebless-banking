import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { FileText, Printer } from "lucide-react";
import { Check } from "../../entities/Check";
import { Invoice } from "../../entities/Invoice";
import CheckEntity from "../../entities/Check";

interface CheckFormProps {
    check?: Check | null;
    invoice?: Invoice | null;
    onSave: (checkData: Omit<Check, 'id' | 'created_date' | 'updated_date' | 'amount_in_words'>) => void;
    onPreview: (checkData: any) => void;
}

export default function CheckForm({ check, invoice, onSave, onPreview }: CheckFormProps) {
    const [formData, setFormData] = useState < Omit < Check, 'id' | 'created_date' | 'updated_date' >> ({
        check_number: `CHK-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        payee_name: invoice?.client_name || '',
        payee_address: invoice?.client_address || '',
        amount: invoice?.total_amount || 0,
        amount_in_words: '',
        memo: invoice ? `Invoice ${invoice.invoice_number}` : '',
        account_name: 'Your Business Name',
        account_number: '0000123456789',
        routing_number: '011000015',
        bank_name: 'Your Bank Name',
        bank_address: '123 Bank Street, City, ST 12345',
        status: 'draft',
        invoice_id: invoice?.id || undefined,
        notes: ''
    });

    useEffect(() => {
        if (check) {
            setFormData(check);
        }
    }, [check]);

    useEffect(() => {
        if (formData.amount > 0) {
            setFormData(prev => ({
                ...prev,
                amount_in_words: CheckEntity.convertAmountToWords(formData.amount)
            }));
        }
    }, [formData.amount]);

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Check Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Check Number</Label>
                            <Input
                                value={formData.check_number}
                                onChange={(e) => handleInputChange('check_number', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Bank Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Holder Name</Label>
                                <Input
                                    value={formData.account_name}
                                    onChange={(e) => handleInputChange('account_name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input
                                    value={formData.bank_name}
                                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input
                                    value={formData.account_number}
                                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Routing Number</Label>
                                <Input
                                    value={formData.routing_number}
                                    onChange={(e) => handleInputChange('routing_number', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Bank Address</Label>
                                <Input
                                    value={formData.bank_address}
                                    onChange={(e) => handleInputChange('bank_address', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Payee Information</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Pay to the Order of</Label>
                                <Input
                                    value={formData.payee_name}
                                    onChange={(e) => handleInputChange('payee_name', e.target.value)}
                                    required
                                    placeholder="Payee name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Payee Address</Label>
                                <Textarea
                                    value={formData.payee_address}
                                    onChange={(e) => handleInputChange('payee_address', e.target.value)}
                                    placeholder="Street, City, State, ZIP"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Amount</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Amount ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount in Words</Label>
                                <Input
                                    value={formData.amount_in_words}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Memo</Label>
                        <Input
                            value={formData.memo}
                            onChange={(e) => handleInputChange('memo', e.target.value)}
                            placeholder="Purpose of payment"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Notes (Internal)</Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Internal notes about this check"
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onPreview(formData)}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Preview Check
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Save Check
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}