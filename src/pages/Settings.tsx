import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Shield,
    Bell,
    Eye,
    CreditCard,
    Smartphone,
    Mail,
    Lock,
    Key,
    Globe,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Download,
    Trash2,
    LogOut,
    ChevronRight,
    Edit3,
    Check,
    X,
    Settings as SettingsIcon,
    AlertCircle,
    HelpCircle,
    MessageSquare,
    DollarSign
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Settings() {
    const [activeSection, setActiveSection] = useState("account");
    const [isEditing, setIsEditing] = useState < Record < string, boolean>> ({});
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notifications, setNotifications] = useState({
        transactions: true,
        security: true,
        promotions: false,
        statements: true,
        paymentReminders: true
    });
    const [privacy, setPrivacy] = useState({
        profileVisibility: "private",
        transactionHistory: "private",
        contactSharing: false,
        analyticsOptOut: false
    });
    const [security, setSecurity] = useState({
        twoFactorEnabled: true,
        biometricLogin: true,
        loginAlerts: true,
        deviceTracking: true
    });

    const [userProfile, setUserProfile] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, New York, NY 10001",
        dateOfBirth: "1985-06-15"
    });

    const settingSections = [
        { id: "account", label: "Account", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy", icon: Eye },
        { id: "cards", label: "Cards & Payments", icon: CreditCard },
        { id: "preferences", label: "Preferences", icon: SettingsIcon },
        { id: "support", label: "Help & Support", icon: HelpCircle },
        { id: "about", label: "About", icon: AlertCircle }
    ];

    function handleEdit(field: string) {
        setIsEditing({ ...isEditing, [field]: true });
    }

    function handleSave(field: string) {
        setIsEditing({ ...isEditing, [field]: false });
        // In a real app, this would save to backend
        console.log(`Saved ${field}:`, userProfile[field as keyof typeof userProfile]);
    }

    function handleCancel(field: string) {
        setIsEditing({ ...isEditing, [field]: false });
        // Reset to original value
    }

    function handleInputChange(field: string, value: string) {
        setUserProfile({ ...userProfile, [field]: value });
    }

    function handleNotificationToggle(key: string) {
        setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] });
    }

    function handlePrivacyToggle(key: string) {
        setPrivacy({ ...privacy, [key]: !privacy[key as keyof typeof privacy] });
    }

    function handleSecurityToggle(key: string) {
        setSecurity({ ...security, [key]: !security[key as keyof typeof security] });
    }

    function renderAccountSection() {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Account Information</h2>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                </div>

                {Object.entries(userProfile).map(([key, value]) => (
                    <Card key={key} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <Label className="text-sm font-medium capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </Label>
                                {isEditing[key] ? (
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Input
                                            value={value}
                                            onChange={(e) => handleInputChange(key, e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button size="sm" onClick={() => handleSave(key)}>
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleCancel(key)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-gray-700">{value}</p>
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(key)}>
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                <Card className="p-6 border-red-200 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-100">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>
                        <Button variant="outline" className="w-full">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    function renderSecuritySection() {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Security & Access</h2>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                    <div className="space-y-4">
                        {Object.entries(security).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {key === 'twoFactorEnabled' && 'Add an extra layer of security to your account'}
                                        {key === 'biometricLogin' && 'Use fingerprint or face recognition to log in'}
                                        {key === 'loginAlerts' && 'Get notified when someone logs into your account'}
                                        {key === 'deviceTracking' && 'Keep track of devices that access your account'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleSecurityToggle(key)}
                                    aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Password & PIN</h3>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-between">
                            <span>Change Password</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Change PIN</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Manage Security Questions</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Current Session</p>
                                <p className="text-sm text-gray-600">Windows PC • Chrome • New York, NY</p>
                            </div>
                            <span className="text-green-600 text-sm font-medium">Active</span>
                        </div>
                        <Button variant="outline" className="w-full">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out All Devices
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    function renderNotificationsSection() {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Notification Preferences</h2>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                        {Object.entries(notifications).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {key === 'transactions' && 'Get notified about all transactions'}
                                        {key === 'security' && 'Important security alerts and updates'}
                                        {key === 'promotions' && 'Special offers and product updates'}
                                        {key === 'statements' && 'Monthly statements and summaries'}
                                        {key === 'paymentReminders' && 'Upcoming payment due dates'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleNotificationToggle(key)}
                                    aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications`}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Delivery Methods</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Smartphone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium">Push Notifications</p>
                                    <p className="text-sm text-gray-600">Mobile app notifications</p>
                                </div>
                            </div>
                            <span className="text-green-600 text-sm font-medium">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-gray-600">{userProfile.email}</p>
                                </div>
                            </div>
                            <span className="text-green-600 text-sm font-medium">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium">SMS Notifications</p>
                                    <p className="text-sm text-gray-600">{userProfile.phone}</p>
                                </div>
                            </div>
                            <span className="text-gray-600 text-sm font-medium">Disabled</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    function renderCardsSection() {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Cards & Payment Methods</h2>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Linked Cards</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <CreditCard className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="font-medium">PureBless Debit Card</p>
                                    <p className="text-sm text-gray-600">****1234 • Expires 12/27</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button size="sm" variant="outline">Manage</Button>
                                <Button size="sm" variant="outline">
                                    <Lock className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full">
                            + Add New Card
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Transaction Limits</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Daily ATM Withdrawal</span>
                            <span className="font-medium">$500</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Daily Purchase Limit</span>
                            <span className="font-medium">$2,500</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Online Transfer Limit</span>
                            <span className="font-medium">$5,000</span>
                        </div>
                        <Button variant="outline" className="w-full">
                            Request Limit Increase
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    function renderPreferencesSection() {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">App Preferences</h2>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            <div>
                                <p className="font-medium">Dark Mode</p>
                                <p className="text-sm text-gray-600">Switch to dark theme</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            aria-label="Toggle dark mode"
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Language & Region</h3>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-between">
                            <div className="flex items-center space-x-3">
                                <Globe className="w-5 h-5" />
                                <span>Language: English (US)</span>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <div className="flex items-center space-x-3">
                                <DollarSign className="w-5 h-5" />
                                <span>Currency: USD ($)</span>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Data & Storage</h3>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-between">
                            <span>Clear Cache</span>
                            <span className="text-sm text-gray-500">2.3 MB</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Download for Offline</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    function renderSupportSection() {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Help & Support</h2>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Get Help</h3>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-between">
                            <span>Contact Support</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Help Center</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Report a Problem</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Feature Request</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Community</h3>
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-between">
                            <span>User Forum</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                            <span>Follow Us on Social</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    function renderAboutSection() {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">About PureBless Banking</h2>

                <Card className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">PureBless Banking</h3>
                        <p className="text-gray-600">Version 2.1.0</p>
                    </div>

                    <div className="space-y-3 text-center">
                        <Button variant="outline" className="w-full">
                            Terms of Service
                        </Button>
                        <Button variant="outline" className="w-full">
                            Privacy Policy
                        </Button>
                        <Button variant="outline" className="w-full">
                            Licenses
                        </Button>
                        <Button variant="outline" className="w-full">
                            What's New
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        © 2025 PureBless Banking. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-500">
                        Made with ❤️ for secure banking
                    </p>
                </Card>
            </div>
        );
    }

    function renderActiveSection() {
        switch (activeSection) {
            case "account": return renderAccountSection();
            case "security": return renderSecuritySection();
            case "notifications": return renderNotificationsSection();
            case "privacy": return renderNotificationsSection(); // Using same toggle logic
            case "cards": return renderCardsSection();
            case "preferences": return renderPreferencesSection();
            case "support": return renderSupportSection();
            case "about": return renderAboutSection();
            default: return renderAccountSection();
        }
    }

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your account and app preferences</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Settings Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <Card className="p-4">
                            <nav className="space-y-1">
                                {settingSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <section.icon className="w-5 h-5" />
                                        <span className="font-medium">{section.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </Card>
                    </motion.div>

                    {/* Settings Content */}
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {renderActiveSection()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}