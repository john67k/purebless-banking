// ReviewCase entity - handles risk management and transaction reviews
export class ReviewCase {
    static async list(orderBy = '-created_date', limit = 100) {
        const cases = JSON.parse(localStorage.getItem('reviewCases') || '[]');

        // Sort cases
        const sorted = cases.sort((a: any, b: any) => {
            if (orderBy.startsWith('-')) {
                const field = orderBy.substring(1);
                return new Date(b[field]).getTime() - new Date(a[field]).getTime();
            } else {
                return new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime();
            }
        });

        return sorted.slice(0, limit);
    }

    static async create(data: any) {
        const cases = JSON.parse(localStorage.getItem('reviewCases') || '[]');
        const newCase = {
            id: Date.now().toString(),
            ...data,
            status: data.status || 'open',
            created_date: new Date().toISOString(),
            created_by: 'system'
        };

        cases.unshift(newCase);
        localStorage.setItem('reviewCases', JSON.stringify(cases));

        return newCase;
    }

    static async update(id: string, data: any) {
        const cases = JSON.parse(localStorage.getItem('reviewCases') || '[]');
        const index = cases.findIndex((case_: any) => case_.id === id);

        if (index !== -1) {
            cases[index] = { ...cases[index], ...data };
            localStorage.setItem('reviewCases', JSON.stringify(cases));
            return cases[index];
        }

        throw new Error('Review case not found');
    }
}