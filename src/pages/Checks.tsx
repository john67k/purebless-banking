import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import CheckEntity, { Check } from '../entities/Check';
import InvoiceEntity, { Invoice } from '../entities/Invoice';
import { Button } from "../components/ui/button";
import { Plus, FileCheck, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

import CheckForm from '../components/check/CheckForm';
import CheckList from '../components/check/CheckList';
import CheckPreview from '../components/check/CheckPreview';

export default function Checks() {
    const [checks, setChecks] = useState < Check[] > ([]);
    const [invoices, setInvoices] = useState < Invoice[] > ([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCheck, setEditingCheck] = useState < Check | null > (null);
    const [previewCheck, setPreviewCheck] = useState < Check | null > (null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

    useEffect(() => {
        loadChecks();
        loadInvoices();
    }, []);

    const loadChecks = async () => {
        const data = await CheckEntity.list('-created_date');
        setChecks(data);
    };

    const loadInvoices = async () => {
        const data = await InvoiceEntity.list('-created_date');
        setInvoices(data.filter(inv => inv.status !== 'paid'));
    };

    const handleSave = async (checkData: Omit<Check, 'id' | 'created_date' | 'updated_date' | 'amount_in_words'>) => {
        try {
            if (editingCheck) {
                await CheckEntity.update(editingCheck.id, checkData);
            } else {
                await CheckEntity.create(checkData);
            }
            setShowForm(false);
            setEditingCheck(null);
            setSelectedInvoiceId('');
            loadChecks();
        } catch (error) {
            console.error('Error saving check:', error);
        }
    };

    const handleEdit = (check: Check) => {
        setEditingCheck(check);
        setShowForm(true);
    };

    const handlePreview = (checkData: any) => {
        setPreviewCheck(checkData);
    };

    const handlePrint = async (check: Check) => {
        setPreviewCheck(check);
        if (check.id && check.status === 'draft') {
            await CheckEntity.update(check.id, { status: 'printed' });
            loadChecks();
        }
    };

    const handlePrintFromPreview = () => {
        window.print();
    };

    const handleNewCheck = () => {
        setEditingCheck(null);
        setSelectedInvoiceId('');
        setShowForm(true);
    };

    const handleInvoiceSelect = (invoiceId: string) => {
        setSelectedInvoiceId(invoiceId);
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            setEditingCheck(null);
            setShowForm(true);
        }
    };

    const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

    const stats = {
        total: checks.length,
        draft: checks.filter(c => c.status === 'draft').length,
        printed: checks.filter(c => c.status === 'printed').length,
        cleared: checks.filter(c => c.status === 'cleared').length,
        totalAmount: checks.reduce((sum, c) => sum + (c.amount || 0), 0)
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
                        <h1 className="text-3xl font-bold text-gray-900">Check Management</h1>
                        <p className="text-gray-500 mt-1">Write and manage business checks</p>
                    </div>
                    <Button
                        onClick={handleNewCheck}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Write New Check
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
                                <p className="text-sm text-gray-500">Total Checks</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FileCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Draft</p>
                                <p className="text-3xl font-bold mt-1">{stats.draft}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <FileCheck className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Printed</p>
                                <p className="text-3xl font-bold mt-1">{stats.printed}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Printer className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-3xl font-bold mt-1">${stats.totalAmount.toFixed(0)}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FileCheck className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {!showForm && invoices.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-1">Write Check from Invoice</h3>
                                <p className="text-sm text-blue-700">Select an unpaid invoice to automatically fill check details</p>
                            </div>
                            <div className="w-full md:w-64">
                                <Select value={selectedInvoiceId} onValueChange={handleInvoiceSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an invoice..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {invoices.map(invoice => (
                                            <SelectItem key={invoice.id} value={invoice.id}>
                                                {invoice.invoice_number} - {invoice.client_name} (${invoice.total_amount?.toFixed(2)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {showForm ? (
                        <CheckForm
                            check={editingCheck}
                            invoice={selectedInvoice}
                            onSave={handleSave}
                            onPreview={handlePreview}
                        />
                    ) : (
                        <CheckList
                            checks={checks}
                            onView={setPreviewCheck}
                            onEdit={handleEdit}
                            onPrint={handlePrint}
                        />
                    )}
                </motion.div>

                {previewCheck && (
                    <CheckPreview
                        check={previewCheck}
                        onClose={() => setPreviewCheck(null)}
                        onPrint={handlePrintFromPreview}
                    />
                )}
            </div>
        </div>
    );
}