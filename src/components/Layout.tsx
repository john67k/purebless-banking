import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    Home, Send, Download, History, Settings, Wallet, Bell, PlusCircle, 
    DollarSign, ShoppingCart, CreditCard, FileText, FileCheck, 
    ArrowUpRight, ArrowDownLeft, Coins, Receipt, 
    User, Shield, HelpCircle, LogOut
} from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();

    const navItems = [
        { name: "Home", path: createPageUrl("Dashboard"), icon: Home, color: "from-blue-500 to-blue-600" },
        { name: "Send", path: createPageUrl("Send"), icon: ArrowUpRight, color: "from-red-500 to-red-600" },
        { name: "Receive", path: createPageUrl("Receive"), icon: ArrowDownLeft, color: "from-green-500 to-green-600" },
        { name: "Top Up", path: createPageUrl("TopUp"), icon: Coins, color: "from-yellow-500 to-yellow-600" },
        { name: "Withdraw", path: createPageUrl("Cashout"), icon: CreditCard, color: "from-purple-500 to-purple-600" },
        { name: "Loans", path: createPageUrl("Loans"), icon: DollarSign, color: "from-indigo-500 to-indigo-600" },
        { name: "Invoices", path: createPageUrl("Invoices"), icon: Receipt, color: "from-orange-500 to-orange-600" },
        { name: "Checks", path: createPageUrl("Checks"), icon: FileCheck, color: "from-teal-500 to-teal-600" },
        { name: "Activity", path: createPageUrl("Activity"), icon: History, color: "from-gray-500 to-gray-600" },
        { name: "Settings", path: createPageUrl("Settings"), icon: Settings, color: "from-slate-500 to-slate-600" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
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

            {/* Mobile Bottom Nav - Professional Banking Design */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 z-50 shadow-2xl">
                {/* Quick Actions Row */}
                <div className="flex justify-center items-center px-4 py-3 border-b border-gray-100/50">
                    <div className="flex gap-3 w-full max-w-sm">
                        {[navItems[0], navItems[1], navItems[2], navItems[9]].map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex-1 flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-gradient-to-br ' + item.color + ' shadow-lg transform scale-105' 
                                            : 'bg-gray-50/80 hover:bg-gray-100/80'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg mb-1 ${
                                        isActive 
                                            ? 'bg-white/20' 
                                            : 'bg-white/60'
                                    }`}>
                                        <item.icon className={`h-5 w-5 ${
                                            isActive ? "text-white" : "text-gray-600"
                                        }`} />
                                    </div>
                                    <span className={`text-xs font-semibold ${
                                        isActive ? "text-white" : "text-gray-700"
                                    }`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Main Services Grid */}
                <div className="px-4 py-3">
                    <div className="grid grid-cols-6 gap-2">
                        {[
                            navItems[3], // Top Up
                            navItems[4], // Withdraw
                            navItems[5], // Loans
                            navItems[6], // Invoices
                            navItems[7], // Checks
                            navItems[8]  // Activity
                        ].map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-gradient-to-br ' + item.color + ' shadow-lg transform scale-105' 
                                            : 'bg-gray-50/60 hover:bg-gray-100/80 active:scale-95'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-lg mb-1 ${
                                        isActive 
                                            ? 'bg-white/20' 
                                            : 'bg-white/80'
                                    }`}>
                                        <item.icon className={`h-4 w-4 ${
                                            isActive ? "text-white" : "text-gray-600"
                                        }`} />
                                    </div>
                                    <span className={`text-xs font-medium leading-tight text-center ${
                                        isActive ? "text-white" : "text-gray-700"
                                    }`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Top header */}
                <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/60 px-4 md:px-8 py-3">
                    {/* Mobile Header - Professional Banking */}
                    <div className="md:hidden flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    PureBless
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">Banking & Finance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link 
                                to={createPageUrl("Notifications")} 
                                className="p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                            </Link>
                            <Link 
                                to={createPageUrl("Settings")} 
                                className="p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                                title="Account Settings"
                            >
                                <User className="w-5 h-5 text-gray-600" />
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-end gap-3">
                        <a href={createPageUrl("PayIn4")} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                            <CreditCard className="w-4 h-4" /> Pay in 4
                        </a>
                        <a href={createPageUrl("CardApplication")} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                            <CreditCard className="w-4 h-4" /> Apply for Card
                        </a>
                        <a href={createPageUrl("Checkout")} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                            <ShoppingCart className="w-4 h-4" /> Checkout
                        </a>
                        <a href={createPageUrl("Notifications")} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-2">
                            <Bell className="w-4 h-4" /> Notifications
                        </a>
                    </div>
                </div>
                <main className="flex-1 pb-40 md:pb-8">
                    <div className="px-4 md:px-8 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}