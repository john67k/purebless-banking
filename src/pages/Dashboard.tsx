import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Transaction } from "@/entities/Transaction";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Send, Download, CreditCard, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, DollarSign, TrendingUp, PlusCircle, ShoppingCart, AlertCircle, Smartphone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
    const [user, setUser] = useState < any > (null);
    const [transactions, setTransactions] = useState < any[] > ([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const currentUser = await User.me();
        setUser(currentUser);
        const recentTransactions = await Transaction.list("-created_date", 5);
        setTransactions(recentTransactions);
        setIsLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const quickActions = [
        { name: "Add Money", icon: PlusCircle, path: "TopUp", color: "from-emerald-500 to-teal-600", highlight: true },
        { name: "Send Money", icon: Send, path: "Send", color: "from-indigo-500 to-purple-600" },
        { name: "Request", icon: Download, path: "Receive", color: "from-cyan-500 to-blue-600" },
        { name: "Cash Out", icon: CreditCard, path: "Cashout", color: "from-pink-500 to-rose-600" },
        { name: "Pay in 4", icon: Sparkles, path: "PayIn4", color: "from-purple-500 to-pink-600" },
        { name: "Get Loan", icon: DollarSign, path: "Loans", color: "from-green-500 to-emerald-600" },
        { name: "Apply Card", icon: CreditCard, path: "CardApplication", color: "from-blue-500 to-indigo-600" },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 md:px-8 md:py-10 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-gray-500">Manage your finances with ease</p>
            </motion.div>

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-white/80" />
                            <p className="text-white/80 text-sm font-medium">Available Balance</p>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            {formatCurrency(user?.wallet_balance || 0)}
                        </h2>
                        <div className="flex items-center gap-2 text-white/90">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">+12.5% this month</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {quickActions.map((action, index) => (
                        <Link key={action.name} to={createPageUrl(action.path)}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border ${action.highlight ? 'border-emerald-200 ring-2 ring-emerald-100' : 'border-gray-100'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}>
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">{action.name}</p>
                                {action.highlight && (
                                    <p className="text-xs text-emerald-600 mt-1">Popular</p>
                                )}
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <Link to={createPageUrl("Activity")} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        View All
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No transactions yet</p>
                            <p className="text-sm text-gray-400 mt-1">Start by sending or receiving money</p>
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === "send" ? "bg-red-50" :
                                                transaction.type === "receive" ? "bg-green-50" :
                                                    transaction.type === "cashout" ? "bg-blue-50" : "bg-purple-50"
                                            }`}>
                                            {transaction.type === "send" ? (
                                                <ArrowUpRight className="w-5 h-5 text-red-600" />
                                            ) : transaction.type === "receive" ? (
                                                <ArrowDownRight className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {transaction.recipient_name || "Unknown"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.created_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${transaction.type === "send" || transaction.type === "cashout" ? "text-gray-900" : "text-green-600"
                                            }`}>
                                            {transaction.type === "send" || transaction.type === "cashout" ? "-" : "+"}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                        {transaction.status === "completed" && (
                                            <div className="flex items-center justify-end gap-1 text-xs text-green-600 mt-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}