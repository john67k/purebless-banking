import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Calendar, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Transaction } from "../entities/Transaction";

interface FilterOptions {
    type: string;
    status: string;
    dateRange: string;
    amountMin: string;
    amountMax: string;
}

interface TransactionStats {
    totalIncome: number;
    totalExpenses: number;
    totalTransactions: number;
    avgTransactionAmount: number;
}

export default function Activity() {
    const [transactions, setTransactions] = useState < any[] > ([]);
    const [filteredTransactions, setFilteredTransactions] = useState < any[] > ([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState < FilterOptions > ({
        type: 'all',
        status: 'all',
        dateRange: 'all',
        amountMin: '',
        amountMax: ''
    });

    // Load transactions
    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            try {
                const data = await Transaction.list('-created_date', 100);
                setTransactions(data);
                setFilteredTransactions(data);
            } catch (error) {
                console.error('Failed to load transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let filtered = [...transactions];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(tx =>
                tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Type filter
        if (filters.type !== 'all') {
            filtered = filtered.filter(tx => tx.type === filters.type);
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(tx => tx.status === filters.status);
        }

        // Amount filters
        if (filters.amountMin) {
            filtered = filtered.filter(tx => tx.amount >= parseFloat(filters.amountMin));
        }
        if (filters.amountMax) {
            filtered = filtered.filter(tx => tx.amount <= parseFloat(filters.amountMax));
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            let cutoffDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    cutoffDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
            }

            filtered = filtered.filter(tx => new Date(tx.created_date) >= cutoffDate);
        }

        setFilteredTransactions(filtered);
    }, [searchQuery, filters, transactions]);

    // Calculate statistics
    const stats: TransactionStats = useMemo(() => {
        const income = filteredTransactions
            .filter(tx => ['deposit', 'transfer_in'].includes(tx.type))
            .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = filteredTransactions
            .filter(tx => ['transfer', 'payment', 'withdrawal'].includes(tx.type))
            .reduce((sum, tx) => sum + tx.amount, 0);

        return {
            totalIncome: income,
            totalExpenses: expenses,
            totalTransactions: filteredTransactions.length,
            avgTransactionAmount: filteredTransactions.length > 0
                ? filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0) / filteredTransactions.length
                : 0
        };
    }, [filteredTransactions]);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'transfer_in':
                return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
            case 'transfer':
            case 'payment':
            case 'withdrawal':
                return <ArrowUpRight className="h-4 w-4 text-red-600" />;
            default:
                return <DollarSign className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const exportTransactions = () => {
        const csvContent = [
            ['Date', 'Type', 'Description', 'Amount', 'Status'],
            ...filteredTransactions.map(tx => [
                formatDate(tx.created_date).date,
                tx.type,
                tx.description || '',
                tx.amount.toString(),
                tx.status
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Transaction History</h1>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportTransactions}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Income</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${stats.totalIncome.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ${stats.totalExpenses.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Net Change</p>
                                <p className={`text-2xl font-bold ${stats.totalIncome - stats.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${(stats.totalIncome - stats.totalExpenses).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg. Transaction</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${stats.avgTransactionAmount.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-full">
                                <Calendar className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full lg:w-auto"
                            >
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    className="p-2 border border-gray-300 rounded-lg"
                                    aria-label="Filter by transaction type"
                                >
                                    <option value="all">All Types</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="payment">Payment</option>
                                    <option value="withdrawal">Withdrawal</option>
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="p-2 border border-gray-300 rounded-lg"
                                    aria-label="Filter by transaction status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>

                                <select
                                    value={filters.dateRange}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                                    className="p-2 border border-gray-300 rounded-lg"
                                    aria-label="Filter by date range"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                </select>

                                <Input
                                    type="number"
                                    placeholder="Min Amount"
                                    value={filters.amountMin}
                                    onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                                    className="p-2"
                                />

                                <Input
                                    type="number"
                                    placeholder="Max Amount"
                                    value={filters.amountMax}
                                    onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                                    className="p-2"
                                />
                            </motion.div>
                        )}
                    </div>
                </Card>

                {/* Transaction List */}
                <Card>
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recent Transactions ({filteredTransactions.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No transactions found</p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction, index) => (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-gray-100 p-3 rounded-full">
                                                {getTransactionIcon(transaction.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`}
                                                </p>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <span>{formatDate(transaction.created_date).date}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(transaction.created_date).time}</span>
                                                    {transaction.recipient_name && (
                                                        <>
                                                            <span>•</span>
                                                            <span>To: {transaction.recipient_name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            {getStatusBadge(transaction.status)}
                                            <div className="text-right">
                                                <p className={`font-semibold ${['deposit', 'transfer_in'].includes(transaction.type)
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                    }`}>
                                                    {['deposit', 'transfer_in'].includes(transaction.type) ? '+' : '-'}${transaction.amount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}