export interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    client_name: string;
    client_email: string;
    client_address: string;
    invoice_date: string;
    due_date: string;
    items: InvoiceItem[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    notes?: string;
    payment_method: 'bank_transfer' | 'cash_app' | 'paypal' | 'zelle' | 'venmo' | 'check' | 'crypto';
    payment_details: string;
    created_date: string;
    updated_date: string;
}

class InvoiceEntity {
    private static readonly STORAGE_KEY = 'invoices';

    private static getFromStorage(): Invoice[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    private static saveToStorage(invoices: Invoice[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(invoices));
    }

    private static generateId(): string {
        return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private static checkDueDates(): void {
        const invoices = this.getFromStorage();
        const today = new Date();
        let hasChanges = false;

        const updatedInvoices = invoices.map(invoice => {
            if (invoice.status === 'sent' && new Date(invoice.due_date) < today) {
                hasChanges = true;
                return { ...invoice, status: 'overdue' as const, updated_date: new Date().toISOString() };
            }
            return invoice;
        });

        if (hasChanges) {
            this.saveToStorage(updatedInvoices);
        }
    }

    static async create(invoiceData: Omit<Invoice, 'id' | 'created_date' | 'updated_date'>): Promise<Invoice> {
        const invoices = this.getFromStorage();
        const now = new Date().toISOString();

        const newInvoice: Invoice = {
            ...invoiceData,
            id: this.generateId(),
            created_date: now,
            updated_date: now
        };

        invoices.push(newInvoice);
        this.saveToStorage(invoices);
        return newInvoice;
    }

    static async list(sortBy: string = '-created_date'): Promise<Invoice[]> {
        this.checkDueDates();
        let invoices = this.getFromStorage();

        // Sort logic
        const isDescending = sortBy.startsWith('-');
        const sortField = isDescending ? sortBy.substring(1) : sortBy;

        invoices.sort((a, b) => {
            let aVal = a[sortField as keyof Invoice];
            let bVal = b[sortField as keyof Invoice];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = (bVal as string).toLowerCase();
            }

            if (aVal < bVal) return isDescending ? 1 : -1;
            if (aVal > bVal) return isDescending ? -1 : 1;
            return 0;
        });

        return invoices;
    }

    static async findById(id: string): Promise<Invoice | null> {
        const invoices = this.getFromStorage();
        return invoices.find(invoice => invoice.id === id) || null;
    }

    static async update(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
        const invoices = this.getFromStorage();
        const index = invoices.findIndex(invoice => invoice.id === id);

        if (index === -1) return null;

        const updatedInvoice = {
            ...invoices[index],
            ...updates,
            updated_date: new Date().toISOString()
        };

        invoices[index] = updatedInvoice;
        this.saveToStorage(invoices);
        return updatedInvoice;
    }

    static async delete(id: string): Promise<boolean> {
        const invoices = this.getFromStorage();
        const filteredInvoices = invoices.filter(invoice => invoice.id !== id);

        if (filteredInvoices.length === invoices.length) return false;

        this.saveToStorage(filteredInvoices);
        return true;
    }

    static async getStats(): Promise<{
        total: number;
        draft: number;
        sent: number;
        paid: number;
        overdue: number;
        cancelled: number;
        totalRevenue: number;
        pendingAmount: number;
    }> {
        const invoices = await this.list();

        return {
            total: invoices.length,
            draft: invoices.filter(inv => inv.status === 'draft').length,
            sent: invoices.filter(inv => inv.status === 'sent').length,
            paid: invoices.filter(inv => inv.status === 'paid').length,
            overdue: invoices.filter(inv => inv.status === 'overdue').length,
            cancelled: invoices.filter(inv => inv.status === 'cancelled').length,
            totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
            pendingAmount: invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + inv.total_amount, 0)
        };
    }

    static async searchByClient(clientName: string): Promise<Invoice[]> {
        const invoices = await this.list();
        return invoices.filter(invoice =>
            invoice.client_name.toLowerCase().includes(clientName.toLowerCase())
        );
    }

    static async getByStatus(status: Invoice['status']): Promise<Invoice[]> {
        const invoices = await this.list();
        return invoices.filter(invoice => invoice.status === status);
    }

    static async markAsPaid(id: string, paymentDate?: string): Promise<Invoice | null> {
        return this.update(id, {
            status: 'paid',
            updated_date: paymentDate || new Date().toISOString()
        });
    }

    static generateInvoiceNumber(): string {
        const timestamp = Date.now();
        return `INV-${timestamp}`;
    }

    static calculateTotals(items: InvoiceItem[], taxRate: number = 0): {
        subtotal: number;
        tax_amount: number;
        total_amount: number;
    } {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax_amount = subtotal * (taxRate / 100);
        const total_amount = subtotal + tax_amount;

        return { subtotal, tax_amount, total_amount };
    }
}

export default InvoiceEntity;