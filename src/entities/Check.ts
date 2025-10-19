export interface Check {
    id: string;
    check_number: string;
    date: string;
    payee_name: string;
    payee_address?: string;
    amount: number;
    amount_in_words: string;
    memo?: string;
    account_name: string;
    account_number: string;
    routing_number: string;
    bank_name: string;
    bank_address?: string;
    status: 'draft' | 'printed' | 'cleared' | 'voided';
    invoice_id?: string;
    notes?: string;
    created_date: string;
    updated_date: string;
}

class CheckEntity {
    private static readonly STORAGE_KEY = 'checks';

    private static getFromStorage(): Check[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    private static saveToStorage(checks: Check[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(checks));
    }

    private static generateId(): string {
        return `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static async create(checkData: Omit<Check, 'id' | 'created_date' | 'updated_date' | 'amount_in_words'>): Promise<Check> {
        const checks = this.getFromStorage();
        const now = new Date().toISOString();

        const newCheck: Check = {
            ...checkData,
            id: this.generateId(),
            amount_in_words: this.convertAmountToWords(checkData.amount),
            created_date: now,
            updated_date: now
        };

        checks.push(newCheck);
        this.saveToStorage(checks);
        return newCheck;
    }

    static async list(sortBy: string = '-created_date'): Promise<Check[]> {
        let checks = this.getFromStorage();

        // Sort logic
        const isDescending = sortBy.startsWith('-');
        const sortField = isDescending ? sortBy.substring(1) : sortBy;

        checks.sort((a, b) => {
            let aVal = a[sortField as keyof Check];
            let bVal = b[sortField as keyof Check];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = (bVal as string).toLowerCase();
            }

            if (aVal < bVal) return isDescending ? 1 : -1;
            if (aVal > bVal) return isDescending ? -1 : 1;
            return 0;
        });

        return checks;
    }

    static async findById(id: string): Promise<Check | null> {
        const checks = this.getFromStorage();
        return checks.find(check => check.id === id) || null;
    }

    static async findByInvoiceId(invoiceId: string): Promise<Check[]> {
        const checks = this.getFromStorage();
        return checks.filter(check => check.invoice_id === invoiceId);
    }

    static async update(id: string, updates: Partial<Check>): Promise<Check | null> {
        const checks = this.getFromStorage();
        const index = checks.findIndex(check => check.id === id);

        if (index === -1) return null;

        const updatedData = { ...updates };

        // Update amount_in_words if amount is being updated
        if (updates.amount !== undefined) {
            updatedData.amount_in_words = this.convertAmountToWords(updates.amount);
        }

        const updatedCheck = {
            ...checks[index],
            ...updatedData,
            updated_date: new Date().toISOString()
        };

        checks[index] = updatedCheck;
        this.saveToStorage(checks);
        return updatedCheck;
    }

    static async delete(id: string): Promise<boolean> {
        const checks = this.getFromStorage();
        const filteredChecks = checks.filter(check => check.id !== id);

        if (filteredChecks.length === checks.length) return false;

        this.saveToStorage(filteredChecks);
        return true;
    }

    static async markAsPrinted(id: string): Promise<Check | null> {
        return this.update(id, { status: 'printed' });
    }

    static async markAsCleared(id: string): Promise<Check | null> {
        return this.update(id, { status: 'cleared' });
    }

    static async markAsVoided(id: string): Promise<Check | null> {
        return this.update(id, { status: 'voided' });
    }

    static async getStats(): Promise<{
        total: number;
        draft: number;
        printed: number;
        cleared: number;
        voided: number;
        totalAmount: number;
        outstandingAmount: number;
    }> {
        const checks = await this.list();
        const outstandingChecks = checks.filter(check => ['printed'].includes(check.status));

        return {
            total: checks.length,
            draft: checks.filter(check => check.status === 'draft').length,
            printed: checks.filter(check => check.status === 'printed').length,
            cleared: checks.filter(check => check.status === 'cleared').length,
            voided: checks.filter(check => check.status === 'voided').length,
            totalAmount: checks.reduce((sum, check) => sum + check.amount, 0),
            outstandingAmount: outstandingChecks.reduce((sum, check) => sum + check.amount, 0)
        };
    }

    static async getByStatus(status: Check['status']): Promise<Check[]> {
        const checks = await this.list();
        return checks.filter(check => check.status === status);
    }

    static generateCheckNumber(): string {
        const timestamp = Date.now();
        return `CHK-${timestamp}`;
    }

    static convertAmountToWords(amount: number): string {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        if (amount === 0) return 'Zero Dollars';

        let dollars = Math.floor(amount);
        const cents = Math.round((amount - dollars) * 100);

        let result = '';

        if (dollars >= 1000000) {
            result += convertLessThanThousand(Math.floor(dollars / 1000000)) + ' Million ';
            dollars = dollars % 1000000;
        }
        if (dollars >= 1000) {
            result += convertLessThanThousand(Math.floor(dollars / 1000)) + ' Thousand ';
            dollars = dollars % 1000;
        }
        if (dollars > 0) {
            result += convertLessThanThousand(dollars);
        }

        result += ' Dollars';
        if (cents > 0) {
            result += ' and ' + cents + '/100';
        }

        return result.trim();
    }

    static async getChecksByDateRange(startDate: string, endDate: string): Promise<Check[]> {
        const checks = await this.list();
        return checks.filter(check => {
            const checkDate = new Date(check.date);
            return checkDate >= new Date(startDate) && checkDate <= new Date(endDate);
        });
    }

    static async getChecksByPayee(payeeName: string): Promise<Check[]> {
        const checks = await this.list();
        return checks.filter(check =>
            check.payee_name.toLowerCase().includes(payeeName.toLowerCase())
        );
    }
}

export default CheckEntity;