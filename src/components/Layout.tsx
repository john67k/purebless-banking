import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Send, Download, History, Settings, Wallet, Bell, PlusCircle, DollarSign, ShoppingCart, CreditCard, FileText, FileCheck } from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();

    const navItems = [
        { name: "Dashboard", path: createPageUrl("Dashboard"), icon: Home },
        { name: "Send Money", path: createPageUrl("Send"), icon: Send },
        { name: "Deposit", path: createPageUrl("Receive"), icon: Download },
        { name: "Add Funds", path: createPageUrl("TopUp"), icon: PlusCircle },
        { name: "Withdraw", path: createPageUrl("Cashout"), icon: CreditCard },
        { name: "Loans", path: createPageUrl("Loans"), icon: DollarSign },
        { name: "Invoices", path: createPageUrl("Invoices"), icon: FileText },
        { name: "Checks", path: createPageUrl("Checks"), icon: FileCheck },
        { name: "Activity", path: createPageUrl("Activity"), icon: History },
        { name: "Settings", path: createPageUrl("Settings"), icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
            <style>{`
        :root {
          --primary: #6366f1;
          --primary-dark: #4f46e5;
          --secondary: #8b5cf6;
          --accent: #06b6d4;
        }
      `}</style>

            {/* Desktop Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-gray-200/50 pt-5 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Pure Bless
                                </h1>
                                <p className="text-xs text-gray-500">Financial Platform</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-50">
                <div className="flex justify-around items-center h-16 px-1">
                    {[
                        navItems[0], // Dashboard
                        navItems[1], // Send Money
                        navItems[6], // Invoices
                        navItems[7], // Checks
                        navItems[8]  // Activity
                    ].map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="flex flex-col items-center justify-center flex-1 py-2"
                            >
                                <item.icon className={`h-5 w-5 mb-1 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                                <span className={`text-xs font-medium ${isActive ? "text-indigo-600" : "text-gray-600"}`}>
                                    {item.name.split(' ')[0]}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Top header */}
                <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/60 px-4 md:px-8 py-3 flex items-center justify-end gap-3">
                    <a href={createPageUrl("PayIn4")} className="hidden md:inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                        <CreditCard className="w-4 h-4" /> Pay in 4
                    </a>
                    <a href={createPageUrl("CardApplication")} className="hidden md:inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                        <CreditCard className="w-4 h-4" /> Apply for Card
                    </a>
                    <a href={createPageUrl("Checkout")} className="hidden md:inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                        <ShoppingCart className="w-4 h-4" /> Checkout
                    </a>
                    <a href={createPageUrl("Notifications")} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                        <Bell className="w-4 h-4" /> Notifications
                    </a>
                </div>
                <main className="flex-1 pb-20 md:pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}