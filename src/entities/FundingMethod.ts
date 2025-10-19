// FundingMethod entity - handles payment methods (cards and bank accounts)
export class FundingMethod {
    static async list() {
        const methods = JSON.parse(localStorage.getItem('fundingMethods') || '[]');

        // Default payment methods if none exist
        if (methods.length === 0) {
            const defaultMethods = [
                {
                    id: '1',
                    type: 'card',
                    name: 'Chase Visa',
                    last_four: '4242',
                    is_verified: true,
                    created_date: new Date().toISOString()
                },
                {
                    id: '2',
                    type: 'bank',
                    name: 'Wells Fargo Checking',
                    last_four: '8901',
                    is_verified: true,
                    created_date: new Date().toISOString()
                }
            ];
            localStorage.setItem('fundingMethods', JSON.stringify(defaultMethods));
            return defaultMethods;
        }

        return methods;
    }

    static async create(data: any) {
        const methods = JSON.parse(localStorage.getItem('fundingMethods') || '[]');
        const newMethod = {
            id: Date.now().toString(),
            ...data,
            created_date: new Date().toISOString(),
            created_by: 'current-user@example.com'
        };

        methods.push(newMethod);
        localStorage.setItem('fundingMethods', JSON.stringify(methods));

        return newMethod;
    }

    static async update(id: string, data: any) {
        const methods = JSON.parse(localStorage.getItem('fundingMethods') || '[]');
        const index = methods.findIndex((method: any) => method.id === id);

        if (index !== -1) {
            methods[index] = { ...methods[index], ...data };
            localStorage.setItem('fundingMethods', JSON.stringify(methods));
            return methods[index];
        }

        throw new Error('Payment method not found');
    }

    static async delete(id: string) {
        const methods = JSON.parse(localStorage.getItem('fundingMethods') || '[]');
        const filtered = methods.filter((method: any) => method.id !== id);
        localStorage.setItem('fundingMethods', JSON.stringify(filtered));
        return true;
    }
}