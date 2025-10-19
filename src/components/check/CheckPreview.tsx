import React from 'react';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { X, Printer } from "lucide-react";
import { Check } from "../../entities/Check";

interface CheckPreviewProps {
    check: Check | null;
    onClose: () => void;
    onPrint: () => void;
}

export default function CheckPreview({ check, onClose, onPrint }: CheckPreviewProps) {
    if (!check) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-5xl">
                <div className="flex justify-end gap-3 mb-4">
                    <Button variant="outline" onClick={onPrint} className="bg-white">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Check
                    </Button>
                    <Button variant="outline" onClick={onClose} className="bg-white">
                        <X className="w-4 h-4 mr-2" />
                        Close
                    </Button>
                </div>

                <Card className="bg-white p-0 overflow-hidden shadow-2xl">
                    <div className="relative" style={{
                        width: '100%',
                        aspectRatio: '2.5/1',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: '2px solid #495057',
                        fontFamily: 'Courier, monospace'
                    }}>
                        {/* Check Number - Top Right */}
                        <div className="absolute top-4 right-6 text-right">
                            <div className="text-2xl font-bold text-gray-700">{check.check_number}</div>
                        </div>

                        {/* Bank Info - Top Left */}
                        <div className="absolute top-4 left-6">
                            <div className="font-bold text-lg text-blue-900">{check.bank_name}</div>
                            <div className="text-xs text-gray-600">{check.bank_address}</div>
                            <div className="text-xs text-gray-600 mt-1">
                                <span className="font-semibold">Account:</span> {check.account_name}
                            </div>
                        </div>

                        {/* Date Line */}
                        <div className="absolute top-20 right-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Date:</span>
                                <div className="border-b-2 border-gray-600 px-4 py-1 text-sm font-medium">
                                    {formatDate(check.date)}
                                </div>
                            </div>
                        </div>

                        {/* Pay to the Order of */}
                        <div className="absolute top-32 left-6 right-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold whitespace-nowrap">PAY TO THE ORDER OF</span>
                                <div className="flex-1 border-b-2 border-gray-800 px-2 py-1">
                                    <span className="text-base font-medium">{check.payee_name}</span>
                                </div>
                                <div className="border-2 border-gray-800 px-3 py-1 bg-yellow-50 ml-2">
                                    <span className="font-bold text-lg">${check.amount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Amount in Words */}
                        <div className="absolute top-48 left-6 right-32">
                            <div className="border-b-2 border-gray-800 px-2 py-1 flex items-center">
                                <span className="text-sm italic">{check.amount_in_words}</span>
                                <span className="ml-auto text-sm font-bold">***</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">DOLLARS</div>
                        </div>

                        {/* Memo Line */}
                        <div className="absolute bottom-20 left-6 w-1/2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">MEMO:</span>
                                <div className="flex-1 border-b border-gray-600 px-2 py-0.5">
                                    <span className="text-sm">{check.memo}</span>
                                </div>
                            </div>
                        </div>

                        {/* Signature Line */}
                        <div className="absolute bottom-20 right-6 w-1/3">
                            <div className="border-b-2 border-gray-800 h-8 relative">
                                <div className="absolute bottom-0 right-0 text-4xl font-cursive text-gray-600 transform -translate-y-2">
                                    ✓
                                </div>
                            </div>
                            <div className="text-xs text-center text-gray-500 mt-0.5">AUTHORIZED SIGNATURE</div>
                        </div>

                        {/* MICR Line - Bottom */}
                        <div className="absolute bottom-2 left-6 right-6">
                            <div className="flex justify-between items-center text-lg font-mono tracking-widest text-gray-700">
                                <span>⑆{check.routing_number}⑆</span>
                                <span>{check.account_number}⑆</span>
                                <span>{check.check_number}</span>
                            </div>
                        </div>

                        {/* Security Features */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 text-8xl font-bold text-gray-400 rotate-12 pointer-events-none">
                            SAMPLE
                        </div>
                    </div>
                </Card>

                <div className="mt-4 bg-white rounded-lg p-4 shadow">
                    <h3 className="font-semibold mb-2">Payee Address:</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{check.payee_address}</p>
                    {check.notes && (
                        <>
                            <h3 className="font-semibold mt-4 mb-2">Internal Notes:</h3>
                            <p className="text-sm text-gray-600">{check.notes}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}