// InstallmentPlan entity - handles Pay in 4 installment plans
export class InstallmentPlan {
    static async list(orderBy = '-created_date', limit = 50) {
        const plans = JSON.parse(localStorage.getItem('installmentPlans') || '[]');

        // Sort plans
        const sorted = plans.sort((a: any, b: any) => {
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
        const plans = JSON.parse(localStorage.getItem('installmentPlans') || '[]');
        const newPlan = {
            id: Date.now().toString(),
            ...data,
            created_date: new Date().toISOString(),
            created_by: 'current-user@example.com'
        };

        plans.unshift(newPlan);
        localStorage.setItem('installmentPlans', JSON.stringify(plans));

        return newPlan;
    }

    static async update(id: string, data: any) {
        const plans = JSON.parse(localStorage.getItem('installmentPlans') || '[]');
        const index = plans.findIndex((plan: any) => plan.id === id);

        if (index !== -1) {
            plans[index] = { ...plans[index], ...data };
            localStorage.setItem('installmentPlans', JSON.stringify(plans));
            return plans[index];
        }

        throw new Error('Installment plan not found');
    }
}