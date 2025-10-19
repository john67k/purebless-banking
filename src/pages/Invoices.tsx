import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import InvoiceEntity, { Invoice } from '../entities/Invoice';
import PaymentEntity, { Payment } from '../entities/Payment';
import { SendEmail } from '../integrations/Core';
import { Button } from "../components/ui/button";
import { Plus, FileText, DollarSign, Clock, CheckCircle } from "lucide-react";

import InvoiceForm from '../components/invoice/InvoiceForm';
import InvoiceList from '../components/invoice/InvoiceList';
import InvoicePreview from '../components/invoice/InvoicePreview';
import PaymentForm from '../components/payment/PaymentForm';

export default function Invoices() {
    const [invoices, setInvoices] = useState < Invoice[] > ([]);
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState < Invoice | null > (null);
    const [previewInvoice, setPreviewInvoice] = useState < Invoice | null > (null);
    const [paymentInvoice, setPaymentInvoice] = useState < Invoice | null > (null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        const data = await InvoiceEntity.list('-created_date');
        setInvoices(data);
    };

    const handleSave = async (invoiceData: Omit<Invoice, 'id' | 'created_date' | 'updated_date'>) => {
        setIsSaving(true);
        try {
            if (editingInvoice) {
                await InvoiceEntity.update(editingInvoice.id, invoiceData);
            } else {
                await InvoiceEntity.create(invoiceData);
            }
            setShowForm(false);
            setEditingInvoice(null);
            loadInvoices();
        } catch (error) {
            console.error('Error saving invoice:', error);
        }
        setIsSaving(false);
    };

    const handleSendEmail = async (invoiceData: Omit<Invoice, 'id' | 'created_date' | 'updated_date'>) => {
        setIsSaving(true);
        try {
            let savedInvoice: Invoice;
            if (editingInvoice) {
                const updated = await InvoiceEntity.update(editingInvoice.id, invoiceData);
                savedInvoice = updated!;
            } else {
                savedInvoice = await InvoiceEntity.create(invoiceData);
            }

            const formatDate = (dateString: string) => {
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const emailBody = `
Dear ${invoiceData.client_name},

Thank you for your business! Please find your invoice details below:

Invoice Number: ${invoiceData.invoice_number}
Invoice Date: ${formatDate(invoiceData.invoice_date)}
Due Date: ${formatDate(invoiceData.due_date)}

Amount Due: $${invoiceData.total_amount.toFixed(2)}

INVOICE ITEMS:
${invoiceData.items.map(item =>
                `- ${item.description}: ${item.quantity} x $${item.unit_price.toFixed(2)} = $${item.total.toFixed(2)}`
            ).join('\n')}

Subtotal: $${invoiceData.subtotal.toFixed(2)}
Tax (${invoiceData.tax_rate}%): $${invoiceData.tax_amount.toFixed(2)}
Total: $${invoiceData.total_amount.toFixed(2)}

PAYMENT INFORMATION:
Method: ${invoiceData.payment_method.replace(/_/g, ' ').toUpperCase()}
Details: ${invoiceData.payment_details}

${invoiceData.notes ? `\nNotes:\n${invoiceData.notes}` : ''}

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
Your Business
      `.trim();

            await SendEmail({
                to: invoiceData.client_email,
                subject: `Invoice ${invoiceData.invoice_number} - Amount Due: $${invoiceData.total_amount.toFixed(2)}`,
                body: emailBody
            });

            setShowForm(false);
            setEditingInvoice(null);
            loadInvoices();
            alert('Invoice saved and email sent successfully!');
        } catch (error) {
            console.error('Error sending invoice:', error);
            alert('Error sending invoice email');
        }
        setIsSaving(false);
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setShowForm(true);
    };

    const handleRecordPayment = async (paymentData: Omit<Payment, 'id' | 'created_date' | 'updated_date'>) => {
        try {
            await PaymentEntity.create(paymentData);
            await InvoiceEntity.update(paymentData.invoice_id, { status: 'paid' });

            const invoice = invoices.find(inv => inv.id === paymentData.invoice_id);
            if (invoice) {
                const formatDate = (dateString: string) => {
                    return new Date(dateString).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                };

                await SendEmail({
                    to: invoice.client_email,
                    subject: `Payment Received - Invoice ${invoice.invoice_number}`,
                    body: `Dear ${invoice.client_name},

We have received your payment of $${paymentData.amount.toFixed(2)} for Invoice ${invoice.invoice_number}.

Payment Details:
- Date: ${formatDate(paymentData.payment_date)}
- Amount: $${paymentData.amount.toFixed(2)}
- Method: ${paymentData.payment_method.replace(/_/g, ' ').toUpperCase()}
- Transaction ID: ${paymentData.transaction_id || 'N/A'}

Thank you for your business!

Best regards,
Your Business`
                });
            }

            setPaymentInvoice(null);
            loadInvoices();
            alert('Payment recorded and confirmation email sent!');
        } catch (error) {
            console.error('Error recording payment:', error);
        }
    };

    const stats = {
        total: invoices.length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        pending: invoices.filter(inv => inv.status === 'sent').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
        totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    };

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
                        <p className="text-gray-500 mt-1">Create and manage professional invoices</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingInvoice(null);
                            setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Invoice
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Invoices</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Paid</p>
                                <p className="text-3xl font-bold mt-1">{stats.paid}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-3xl font-bold mt-1">${stats.totalRevenue.toFixed(0)}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {showForm ? (
                        <InvoiceForm
                            invoice={editingInvoice}
                            onSave={handleSave}
                            onSendEmail={handleSendEmail}
                            isSaving={isSaving}
                        />
                    ) : (
                        <InvoiceList
                            invoices={invoices}
                            onView={setPreviewInvoice}
                            onEdit={handleEdit}
                            onRecordPayment={setPaymentInvoice}
                        />
                    )}
                </motion.div>

                {previewInvoice && (
                    <InvoicePreview
                        invoice={previewInvoice}
                        onClose={() => setPreviewInvoice(null)}
                    />
                )}

                {paymentInvoice && (
                    <PaymentForm
                        invoice={paymentInvoice}
                        onSave={handleRecordPayment}
                        onCancel={() => setPaymentInvoice(null)}
                    />
                )}
            </div>
        </div>
    );
}