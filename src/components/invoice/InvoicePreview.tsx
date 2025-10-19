import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { X, Download } from "lucide-react";
import { Invoice } from "../../entities/Invoice";

interface InvoicePreviewProps {
    invoice: Invoice | null;
    onClose: () => void;
}

export default function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
    if (!invoice) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardContent className="p-8">
                    <div className="flex justify-between mb-6">
                        <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold mb-2">From:</h3>
                            <p className="text-sm text-gray-600">Your Business Name</p>
                            <p className="text-sm text-gray-600">Your Address</p>
                            <p className="text-sm text-gray-600">City, State ZIP</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Bill To:</h3>
                            <p className="text-sm font-medium">{invoice.client_name}</p>
                            <p className="text-sm text-gray-600">{invoice.client_email}</p>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.client_address}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded">
                        <div>
                            <p className="text-xs text-gray-500">Invoice Number</p>
                            <p className="font-semibold">{invoice.invoice_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Invoice Date</p>
                            <p className="font-semibold">{formatDate(invoice.invoice_date)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="font-semibold">{formatDate(invoice.due_date)}</p>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead className="border-b-2">
                            <tr>
                                <th className="text-left py-2">Description</th>
                                <th className="text-right py-2">Qty</th>
                                <th className="text-right py-2">Price</th>
                                <th className="text-right py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-3">{item.description}</td>
                                    <td className="text-right">{item.quantity}</td>
                                    <td className="text-right">${item.unit_price?.toFixed(2)}</td>
                                    <td className="text-right font-medium">${item.total?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-8">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">${invoice.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax ({invoice.tax_rate}%):</span>
                                <span className="font-medium">${invoice.tax_amount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                                <span>Total:</span>
                                <span>${invoice.total_amount?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded mb-6">
                        <h3 className="font-semibold mb-2">Payment Information</h3>
                        <p className="text-sm"><strong>Method:</strong> {invoice.payment_method?.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm"><strong>Details:</strong> {invoice.payment_details}</p>
                    </div>

                    {invoice.notes && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}