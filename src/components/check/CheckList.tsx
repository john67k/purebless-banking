import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, Edit, Printer } from "lucide-react";
import { Check } from "../../entities/Check";

const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    printed: "bg-blue-100 text-blue-800",
    cleared: "bg-green-100 text-green-800",
    voided: "bg-red-100 text-red-800"
};

interface CheckListProps {
    checks: Check[];
    onView: (check: Check) => void;
    onEdit: (check: Check) => void;
    onPrint: (check: Check) => void;
}

export default function CheckList({ checks, onView, onEdit, onPrint }: CheckListProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Checks</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Check #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Payee</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Memo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {checks.map((check) => (
                                <TableRow key={check.id}>
                                    <TableCell className="font-medium">{check.check_number}</TableCell>
                                    <TableCell>{formatDate(check.date)}</TableCell>
                                    <TableCell>{check.payee_name}</TableCell>
                                    <TableCell className="font-semibold">${check.amount?.toFixed(2)}</TableCell>
                                    <TableCell className="text-sm text-gray-600">{check.memo}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[check.status]}>
                                            {check.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onView(check)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(check)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onPrint(check)}>
                                                <Printer className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}