import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Mail } from "lucide-react";

interface Transaction {
    id: string;
    type: string;
    status: string;
    amount: number;
    fee?: number;
    method?: string;
    recipient_name?: string;
    created_date: string;
}

interface User {
    full_name?: string;
    email?: string;
}

interface ReceiptCardProps {
    transaction: Transaction | null;
    user: User | null;
    onEmail?: () => void;
}

export default function ReceiptCard({ transaction, user, onEmail }: ReceiptCardProps) {
    if (!transaction) return null;

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

    const PlainText = `Receipt
-------------------------
Transaction ID: ${transaction.id}
Type: ${transaction.type}
Status: ${transaction.status}
Amount: ${formatCurrency(transaction.amount)}
Fee: ${formatCurrency(transaction.fee || 0)}
Method: ${transaction.method || "-"}
To/From: ${transaction.recipient_name || "-"}
Date: ${new Date(transaction.created_date).toLocaleString()}
User: ${user?.full_name || ""} (${user?.email || ""})
`;

    const htmlBody = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:16px;color:#111">
    <h2 style="margin:0 0 8px 0">Payment Receipt</h2>
    <p style="color:#555;margin:0 0 16px 0">Thanks! Here are your details.</p>
    <div style="border:1px solid #eee;border-radius:10px;padding:16px">
      <p style="margin:6px 0"><strong>Transaction ID:</strong> ${transaction.id}</p>
      <p style="margin:6px 0"><strong>Type:</strong> ${transaction.type}</p>
      <p style="margin:6px 0"><strong>Status:</strong> ${transaction.status}</p>
      <p style="margin:6px 0"><strong>Amount:</strong> ${formatCurrency(transaction.amount)}</p>
      <p style="margin:6px 0"><strong>Fee:</strong> ${formatCurrency(transaction.fee || 0)}</p>
      <p style="margin:6px 0"><strong>Method:</strong> ${transaction.method || "-"}</p>
      <p style="margin:6px 0"><strong>To/From:</strong> ${transaction.recipient_name || "-"}</p>
      <p style="margin:6px 0"><strong>Date:</strong> ${new Date(transaction.created_date).toLocaleString()}</p>
    </div>
    <p style="color:#777;font-size:12px;margin-top:12px">This email contains both HTML and readable plain text for compatibility.</p>
    <pre style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;padding:12px;border-radius:8px;color:#555">${PlainText}</pre>
  </div>`;

    const printPage = () => window.print();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Receipt</h3>
                <Badge variant="outline" className="capitalize">
                    {transaction.status}
                </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500">Transaction ID</p>
                    <p className="font-medium">{transaction.id}</p>
                </div>
                <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium capitalize">{transaction.type}</p>
                </div>
                <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                </div>
                <div>
                    <p className="text-gray-500">Fee</p>
                    <p className="font-medium">{formatCurrency(transaction.fee || 0)}</p>
                </div>
                <div>
                    <p className="text-gray-500">Method</p>
                    <p className="font-medium">{transaction.method || "-"}</p>
                </div>
                <div>
                    <p className="text-gray-500">To/From</p>
                    <p className="font-medium">{transaction.recipient_name || "-"}</p>
                </div>
                <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">{new Date(transaction.created_date).toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-500">User</p>
                    <p className="font-medium">{user?.full_name} ({user?.email})</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
                <Button onClick={printPage} variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print / Save PDF
                </Button>
                <Button onClick={onEmail} variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email Receipt
                </Button>
                <a
                    href={`data:text/plain;charset=utf-8,${encodeURIComponent(PlainText)}`}
                    download={`receipt-${transaction.id}.txt`}
                >
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download TXT
                    </Button>
                </a>
            </div>
            {/* Hidden HTML template for email */}
            <textarea
                className="hidden"
                readOnly
                value={htmlBody}
                aria-label="Email template"
                tabIndex={-1}
            />
        </div>
    );
}