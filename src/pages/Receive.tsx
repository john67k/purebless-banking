import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    QrCode,
    Link,
    Share2,
    Copy,
    Check,
    DollarSign,
    Smartphone,
    Mail,
    MessageSquare,
    CreditCard,
    Building,
    User,
    ArrowRight,
    Download
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Receive() {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMethod, setSelectedMethod] = useState < string | null > (null);
    const [showQR, setShowQR] = useState(false);
    const [copiedItems, setCopiedItems] = useState < Record < string, boolean>> ({});
    const [generatedLink, setGeneratedLink] = useState("");

    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        accountNumber: "****1234",
        routingNumber: "021000021"
    };

    const receiveOptions = [
        {
            id: "qr-code",
            title: "QR Code",
            description: "Generate a QR code for instant payments",
            icon: QrCode,
            color: "bg-blue-500",
            action: () => setShowQR(true)
        },
        {
            id: "payment-link",
            title: "Payment Link",
            description: "Create a shareable payment link",
            icon: Link,
            color: "bg-green-500",
            action: generatePaymentLink
        },
        {
            id: "share-details",
            title: "Share Account Details",
            description: "Share your banking information",
            icon: Share2,
            color: "bg-purple-500",
            action: () => setSelectedMethod("share-details")
        },
        {
            id: "request-money",
            title: "Request Money",
            description: "Send a payment request to someone",
            icon: DollarSign,
            color: "bg-orange-500",
            action: () => setSelectedMethod("request-money")
        }
    ];

    const shareChannels = [
        { id: "sms", label: "SMS", icon: MessageSquare, color: "bg-green-500" },
        { id: "email", label: "Email", icon: Mail, color: "bg-blue-500" },
        { id: "whatsapp", label: "WhatsApp", icon: Smartphone, color: "bg-green-600" }
    ];

    function generatePaymentLink() {
        const link = `https://purebless.app/pay/${user.accountNumber}?amount=${amount}&desc=${encodeURIComponent(description)}`;
        setGeneratedLink(link);
        setSelectedMethod("payment-link");
    }

    function copyToClipboard(text: string, key: string) {
        navigator.clipboard.writeText(text);
        setCopiedItems({ ...copiedItems, [key]: true });
        setTimeout(() => {
            setCopiedItems({ ...copiedItems, [key]: false });
        }, 2000);
    }

    function handleShareDetails(channel: string) {
        const details = `
Send money to ${user.name}
Account: ${user.accountNumber}
Routing: ${user.routingNumber}
Bank: PureBless Banking
        `.trim();

        if (channel === 'sms') {
            window.open(`sms:?body=${encodeURIComponent(details)}`);
        } else if (channel === 'email') {
            window.open(`mailto:?subject=Payment Details&body=${encodeURIComponent(details)}`);
        } else if (channel === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(details)}`);
        }
    }

    function handleRequestMoney() {
        if (!amount) return;

        const request = `
Payment Request from ${user.name}
Amount: $${amount}
${description ? `For: ${description}` : ''}
Pay here: ${generatedLink || `https://purebless.app/pay/${user.accountNumber}`}
        `.trim();

        // In a real app, this would send through the selected channel
        console.log("Payment request:", request);
        alert("Payment request sent successfully!");
    }

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Receive Money</h1>
                    <p className="text-gray-600">Choose how you'd like to receive payments</p>
                </motion.div>

                {/* Amount and Description Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Payment Details (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="What's this for?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Receive Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                    {receiveOptions.map((option, index) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <Card
                                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
                                onClick={option.action}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-lg ${option.color}`}>
                                        <option.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                                        <div className="flex items-center text-blue-600 text-sm font-medium">
                                            <span>Get started</span>
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* QR Code Modal */}
                {showQR && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowQR(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-4">Your Payment QR Code</h3>
                                <div className="bg-gray-100 p-8 rounded-xl mb-6">
                                    <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                                        <QrCode className="w-24 h-24 text-gray-400" />
                                    </div>
                                </div>
                                {amount && (
                                    <p className="text-lg font-semibold mb-2">${amount}</p>
                                )}
                                {description && (
                                    <p className="text-gray-600 mb-4">{description}</p>
                                )}
                                <div className="flex space-x-3">
                                    <Button variant="outline" className="flex-1">
                                        <Download className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button className="flex-1">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Payment Link Result */}
                {selectedMethod === "payment-link" && generatedLink && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                    >
                        <h3 className="text-xl font-semibold mb-4">Your Payment Link</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 break-all mr-2">{generatedLink}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(generatedLink, "link")}
                                >
                                    {copiedItems.link ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {shareChannels.map((channel) => (
                                <Button
                                    key={channel.id}
                                    variant="outline"
                                    className="flex flex-col items-center py-3 h-auto"
                                    onClick={() => handleShareDetails(channel.id)}
                                >
                                    <channel.icon className="w-5 h-5 mb-1" />
                                    <span className="text-xs">{channel.label}</span>
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Share Account Details */}
                {selectedMethod === "share-details" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                    >
                        <h3 className="text-xl font-semibold mb-4">Account Details</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium">Account Holder</p>
                                        <p className="text-sm text-gray-600">{user.name}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(user.name, "name")}
                                >
                                    {copiedItems.name ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium">Account Number</p>
                                        <p className="text-sm text-gray-600">{user.accountNumber}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(user.accountNumber, "account")}
                                >
                                    {copiedItems.account ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Building className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium">Routing Number</p>
                                        <p className="text-sm text-gray-600">{user.routingNumber}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(user.routingNumber, "routing")}
                                >
                                    {copiedItems.routing ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {shareChannels.map((channel) => (
                                <Button
                                    key={channel.id}
                                    variant="outline"
                                    className="flex flex-col items-center py-3 h-auto"
                                    onClick={() => handleShareDetails(channel.id)}
                                >
                                    <channel.icon className="w-5 h-5 mb-1" />
                                    <span className="text-xs">{channel.label}</span>
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Request Money */}
                {selectedMethod === "request-money" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                    >
                        <h3 className="text-xl font-semibold mb-4">Request Payment</h3>
                        <p className="text-gray-600 mb-4">
                            Send a payment request with your details. The recipient will receive a message with your payment information.
                        </p>
                        {amount && (
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <h4 className="font-medium text-blue-900 mb-2">Request Summary</h4>
                                <p className="text-blue-800">Amount: ${amount}</p>
                                {description && <p className="text-blue-800">For: {description}</p>}
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                            {shareChannels.map((channel) => (
                                <Button
                                    key={channel.id}
                                    className="flex flex-col items-center py-3 h-auto"
                                    onClick={handleRequestMoney}
                                    disabled={!amount}
                                >
                                    <channel.icon className="w-5 h-5 mb-1" />
                                    <span className="text-xs">{channel.label}</span>
                                </Button>
                            ))}
                        </div>
                        {!amount && (
                            <p className="text-sm text-gray-500 text-center mt-3">
                                Please enter an amount to send a payment request
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Quick Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Quick Tips</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li>• QR codes work instantly with any camera or banking app</li>
                        <li>• Payment links expire after 30 days for security</li>
                        <li>• Account details can be used for wire transfers and ACH payments</li>
                        <li>• Payment requests include your contact information automatically</li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}