// MerchantOrder entity - handles checkout and order processing
export class MerchantOrder {
    static async list(orderBy = '-created_date', limit = 50) {
        const orders = JSON.parse(localStorage.getItem('merchantOrders') || '[]');

        // Sort orders
        const sorted = orders.sort((a: any, b: any) => {
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
        const orders = JSON.parse(localStorage.getItem('merchantOrders') || '[]');
        const newOrder = {
            id: Date.now().toString(),
            ...data,
            created_date: new Date().toISOString(),
            created_by: 'current-user@example.com'
        };

        orders.unshift(newOrder);
        localStorage.setItem('merchantOrders', JSON.stringify(orders));

        return newOrder;
    }

    static async update(id: string, data: any) {
        const orders = JSON.parse(localStorage.getItem('merchantOrders') || '[]');
        const index = orders.findIndex((order: any) => order.id === id);

        if (index !== -1) {
            orders[index] = { ...orders[index], ...data };
            localStorage.setItem('merchantOrders', JSON.stringify(orders));
            return orders[index];
        }

        throw new Error('Merchant order not found');
    }
}