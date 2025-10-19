// Transaction entity - handles all financial transactions
export class Transaction {
    static async list(orderBy = '-created_date', limit = 50) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

        // Sort transactions
        const sorted = transactions.sort((a: any, b: any) => {
            if (orderBy.startsWith('-')) {
                const field = orderBy.substring(1);
                return new Date(b[field]).getTime() - new Date(a[field]).getTime();
            } else {
                return new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime();
            }
        });

        return sorted.slice(0, limit);
    }

    static async filter(criteria: any) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        return transactions.filter((tx: any) => {
            return Object.keys(criteria).every(key => tx[key] === criteria[key]);
        });
    }

    static async create(data: any) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const newTransaction = {
            id: Date.now().toString(),
            ...data,
            created_date: new Date().toISOString(),
            created_by: 'current-user@example.com'
        };

        transactions.unshift(newTransaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));

        return newTransaction;
    }

    static async update(id: string, data: any) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const index = transactions.findIndex((tx: any) => tx.id === id);

        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...data };
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return transactions[index];
        }

        throw new Error('Transaction not found');
    }

    static async findById(id: string) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        return transactions.find((tx: any) => tx.id === id);
    }
}