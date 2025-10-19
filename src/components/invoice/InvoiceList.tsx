import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, Edit, DollarSign } from "lucide-react";
import { Invoice } from "../../entities/Invoice";

const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-600"
};

interface InvoiceListProps {
    invoices: Invoice[];
    onView: (invoice: Invoice) => void;
    onEdit: (invoice: Invoice) => void;
    onRecordPayment: (invoice: Invoice) => void;
}

export default function InvoiceList({ invoices, onView, onEdit, onRecordPayment }: InvoiceListProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                    <TableCell>{invoice.client_name}</TableCell>
                                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                    <TableCell className="font-semibold">${invoice.total_amount?.toFixed(2) || '0.00'}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[invoice.status]}>
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onView(invoice)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(invoice)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            {invoice.status !== 'paid' && (
                                                <Button variant="ghost" size="icon" onClick={() => onRecordPayment(invoice)}>
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}