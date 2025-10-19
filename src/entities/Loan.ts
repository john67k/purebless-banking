export interface LoanData {
    id?: string;
    loan_type: 'personal' | 'business' | 'auto' | 'home';
    amount_requested: number;
    amount_approved?: number;
    interest_rate?: number;
    term_months?: number;
    monthly_payment?: number;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'paid_off' | 'defaulted';
    purpose: string;
    employment_status: string;
    annual_income: number;
    credit_score?: number;
    balance_remaining?: number;
    next_payment_date?: string;
    disbursement_date?: string;
    created_date?: string;
    created_by?: string;
}

// Loan entity - handles personal, business, auto, and home loans
export class Loan {
    static async list(orderBy = '-created_date', limit = 50): Promise<LoanData[]> {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');

        // Sort loans
        const sorted = loans.sort((a: LoanData, b: LoanData) => {
            if (orderBy.startsWith('-')) {
                const field = orderBy.substring(1) as keyof LoanData;
                const aValue = a[field] || '';
                const bValue = b[field] || '';
                if (field === 'created_date' || field === 'next_payment_date' || field === 'disbursement_date') {
                    return new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
                }
                return bValue > aValue ? 1 : -1;
            } else {
                const aValue = a[orderBy as keyof LoanData] || '';
                const bValue = b[orderBy as keyof LoanData] || '';
                if (orderBy === 'created_date' || orderBy === 'next_payment_date' || orderBy === 'disbursement_date') {
                    return new Date(aValue as string).getTime() - new Date(bValue as string).getTime();
                }
                return aValue > bValue ? 1 : -1;
            }
        });

        return sorted.slice(0, limit);
    }

    static async create(data: Partial<LoanData>): Promise<LoanData> {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');

        // Calculate monthly payment if approved
        let monthly_payment;
        if (data.amount_approved && data.interest_rate && data.term_months) {
            const principal = data.amount_approved;
            const monthlyRate = data.interest_rate / 100 / 12;
            const numPayments = data.term_months;

            if (monthlyRate > 0) {
                monthly_payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
            } else {
                monthly_payment = principal / numPayments;
            }
        }

        const newLoan: LoanData = {
            id: Date.now().toString(),
            loan_type: data.loan_type || 'personal',
            amount_requested: data.amount_requested || 0,
            amount_approved: data.amount_approved,
            interest_rate: data.interest_rate,
            term_months: data.term_months,
            monthly_payment: monthly_payment,
            status: data.status || 'pending',
            purpose: data.purpose || '',
            employment_status: data.employment_status || '',
            annual_income: data.annual_income || 0,
            credit_score: data.credit_score,
            balance_remaining: data.amount_approved || data.amount_requested || 0,
            next_payment_date: data.next_payment_date,
            disbursement_date: data.disbursement_date,
            created_date: new Date().toISOString(),
            created_by: 'current-user@example.com'
        };

        loans.unshift(newLoan);
        localStorage.setItem('loans', JSON.stringify(loans));

        return newLoan;
    }

    static async update(id: string, data: Partial<LoanData>): Promise<LoanData> {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');
        const index = loans.findIndex((loan: LoanData) => loan.id === id);

        if (index !== -1) {
            // Recalculate monthly payment if relevant fields are updated
            if (data.amount_approved || data.interest_rate || data.term_months) {
                const updatedLoan = { ...loans[index], ...data };
                if (updatedLoan.amount_approved && updatedLoan.interest_rate && updatedLoan.term_months) {
                    const principal = updatedLoan.amount_approved;
                    const monthlyRate = updatedLoan.interest_rate / 100 / 12;
                    const numPayments = updatedLoan.term_months;

                    if (monthlyRate > 0) {
                        data.monthly_payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                            (Math.pow(1 + monthlyRate, numPayments) - 1);
                    } else {
                        data.monthly_payment = principal / numPayments;
                    }
                }
            }

            loans[index] = { ...loans[index], ...data };
            localStorage.setItem('loans', JSON.stringify(loans));
            return loans[index];
        }

        throw new Error('Loan not found');
    }

    static async findById(id: string): Promise<LoanData | null> {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');
        return loans.find((loan: LoanData) => loan.id === id) || null;
    }

    static async delete(id: string): Promise<boolean> {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');
        const index = loans.findIndex((loan: LoanData) => loan.id === id);

        if (index !== -1) {
            loans.splice(index, 1);
            localStorage.setItem('loans', JSON.stringify(loans));
            return true;
        }

        return false;
    }

    static async getByStatus(status: LoanData['status']): Promise<LoanData[]> {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');
        return loans.filter((loan: LoanData) => loan.status === status);
    }

    static async getByUser(userEmail: string): Promise<LoanData[]> {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');
        return loans.filter((loan: LoanData) => loan.created_by === userEmail);
    }

    static async calculateCreditScore(annualIncome: number, employmentStatus: string): Promise<number> {
        // Simple credit score calculation based on income and employment
        let baseScore = 500;

        // Income factor
        if (annualIncome >= 100000) baseScore += 150;
        else if (annualIncome >= 75000) baseScore += 100;
        else if (annualIncome >= 50000) baseScore += 75;
        else if (annualIncome >= 30000) baseScore += 50;

        // Employment factor
        if (employmentStatus.toLowerCase().includes('full-time')) baseScore += 50;
        else if (employmentStatus.toLowerCase().includes('part-time')) baseScore += 25;
        else if (employmentStatus.toLowerCase().includes('self-employed')) baseScore += 30;

        // Random factor for realistic variance
        const variance = Math.floor(Math.random() * 100) - 50;

        return Math.min(850, Math.max(300, baseScore + variance));
    }
}