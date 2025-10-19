export interface Payment {
    id: string;
    invoice_id: string;
    payment_date: string;
    amount: number;
    payment_method: 'bank_transfer' | 'cash_app' | 'paypal' | 'zelle' | 'venmo' | 'check' | 'crypto' | 'other';
    transaction_id?: string;
    notes?: string;
    created_date: string;
    updated_date: string;
}

class PaymentEntity {
    private static readonly STORAGE_KEY = 'payments';

    private static getFromStorage(): Payment[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    private static saveToStorage(payments: Payment[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payments));
    }

    private static generateId(): string {
        return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static async create(paymentData: Omit<Payment, 'id' | 'created_date' | 'updated_date'>): Promise<Payment> {
        const payments = this.getFromStorage();
        const now = new Date().toISOString();

        const newPayment: Payment = {
            ...paymentData,
            id: this.generateId(),
            created_date: now,
            updated_date: now
        };

        payments.push(newPayment);
        this.saveToStorage(payments);
        return newPayment;
    }

    static async list(sortBy: string = '-created_date'): Promise<Payment[]> {
        let payments = this.getFromStorage();

        // Sort logic
        const isDescending = sortBy.startsWith('-');
        const sortField = isDescending ? sortBy.substring(1) : sortBy;

        payments.sort((a, b) => {
            let aVal = a[sortField as keyof Payment];
            let bVal = b[sortField as keyof Payment];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = (bVal as string).toLowerCase();
            }

            if (aVal < bVal) return isDescending ? 1 : -1;
            if (aVal > bVal) return isDescending ? -1 : 1;
            return 0;
        });

        return payments;
    }

    static async findById(id: string): Promise<Payment | null> {
        const payments = this.getFromStorage();
        return payments.find(payment => payment.id === id) || null;
    }

    static async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
        const payments = this.getFromStorage();
        return payments.filter(payment => payment.invoice_id === invoiceId);
    }

    static async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
        const payments = this.getFromStorage();
        const index = payments.findIndex(payment => payment.id === id);

        if (index === -1) return null;

        const updatedPayment = {
            ...payments[index],
            ...updates,
            updated_date: new Date().toISOString()
        };

        payments[index] = updatedPayment;
        this.saveToStorage(payments);
        return updatedPayment;
    }

    static async delete(id: string): Promise<boolean> {
        const payments = this.getFromStorage();
        const filteredPayments = payments.filter(payment => payment.id !== id);

        if (filteredPayments.length === payments.length) return false;

        this.saveToStorage(filteredPayments);
        return true;
    }

    static async getTotalByInvoice(invoiceId: string): Promise<number> {
        const payments = await this.findByInvoiceId(invoiceId);
        return payments.reduce((sum, payment) => sum + payment.amount, 0);
    }

    static async getStats(): Promise<{
        totalPayments: number;
        totalAmount: number;
        averagePayment: number;
        paymentsByMethod: Record<string, number>;
    }> {
        const payments = await this.list();
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

        const paymentsByMethod: Record<string, number> = {};
        payments.forEach(payment => {
            paymentsByMethod[payment.payment_method] =
                (paymentsByMethod[payment.payment_method] || 0) + payment.amount;
        });

        return {
            totalPayments: payments.length,
            totalAmount,
            averagePayment: payments.length > 0 ? totalAmount / payments.length : 0,
            paymentsByMethod
        };
    }

    static async getRecentPayments(limit: number = 10): Promise<Payment[]> {
        const payments = await this.list('-payment_date');
        return payments.slice(0, limit);
    }

    static async getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
        const payments = await this.list();
        return payments.filter(payment => {
            const paymentDate = new Date(payment.payment_date);
            return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
        });
    }

    static generateTransactionId(): string {
        return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
}

export default PaymentEntity;