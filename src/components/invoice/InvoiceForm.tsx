import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Plus, Trash2, Save, Send } from "lucide-react";
import { Invoice, InvoiceItem } from "../../entities/Invoice";

interface InvoiceFormProps {
    invoice?: Invoice | null;
    onSave: (invoiceData: Omit<Invoice, 'id' | 'created_date' | 'updated_date'>) => void;
    onSendEmail: (invoiceData: Omit<Invoice, 'id' | 'created_date' | 'updated_date'>) => void;
    isSaving: boolean;
}

export default function InvoiceForm({ invoice, onSave, onSendEmail, isSaving }: InvoiceFormProps) {
    const [formData, setFormData] = useState < Omit < Invoice, 'id' | 'created_date' | 'updated_date' >> (invoice || {
        invoice_number: `INV-${Date.now()}`,
        client_name: '',
        client_email: '',
        client_address: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: '',
        payment_method: 'bank_transfer',
        payment_details: '',
        status: 'draft'
    });

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const tax_amount = subtotal * (formData.tax_rate / 100);
        const total_amount = subtotal + tax_amount;
        return { subtotal, tax_amount, total_amount };
    };

    const handleSave = () => {
        const { subtotal, tax_amount, total_amount } = calculateTotals();
        onSave({ ...formData, subtotal, tax_amount, total_amount });
    };

    const handleSend = () => {
        const { subtotal, tax_amount, total_amount } = calculateTotals();
        onSendEmail({ ...formData, subtotal, tax_amount, total_amount, status: 'sent' });
    };

    const { subtotal, tax_amount, total_amount } = calculateTotals();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Invoice Number</Label>
                        <Input
                            value={formData.invoice_number}
                            onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Invoice Date</Label>
                        <Input
                            type="date"
                            value={formData.invoice_date}
                            onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => handleInputChange('due_date', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input
                        value={formData.client_name}
                        onChange={(e) => handleInputChange('client_name', e.target.value)}
                        placeholder="Client or Company Name"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Client Email</Label>
                    <Input
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => handleInputChange('client_email', e.target.value)}
                        placeholder="client@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Client Address</Label>
                    <Textarea
                        value={formData.client_address}
                        onChange={(e) => handleInputChange('client_address', e.target.value)}
                        placeholder="Street Address, City, State, ZIP"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Invoice Items</h3>
                        <Button variant="outline" size="sm" onClick={addItem}>
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                    </div>

                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Description</TableHead>
                                    <TableHead className="w-[15%]">Qty</TableHead>
                                    <TableHead className="w-[20%]">Price</TableHead>
                                    <TableHead className="w-[20%]">Total</TableHead>
                                    <TableHead className="w-[5%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                placeholder="Item description"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">${item.total.toFixed(2)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="w-full md:w-1/2 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Tax Rate (%):</span>
                            <Input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.tax_rate}
                                onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                                className="w-24"
                            />
                        </div>
                        <div className="flex justify-between">
                            <span>Tax Amount:</span>
                            <span className="font-medium">${tax_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>${total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={formData.payment_method} onValueChange={(v) => handleInputChange('payment_method', v)}>
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
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Payment Details</Label>
                        <Input
                            value={formData.payment_details}
                            onChange={(e) => handleInputChange('payment_details', e.target.value)}
                            placeholder="Account number, wallet address, etc."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Notes / Terms</Label>
                    <Textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Payment terms, additional notes..."
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" /> Save as Draft
                    </Button>
                    <Button onClick={handleSend} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4 mr-2" /> {isSaving ? 'Sending...' : 'Save & Send Email'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}