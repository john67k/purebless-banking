// Notification entity - handles user notifications
export class Notification {
    static async list(orderBy = '-created_date', limit = 50) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

        // Sort notifications
        const sorted = notifications.sort((a: any, b: any) => {
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
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const newNotification = {
            id: Date.now().toString(),
            ...data,
            read: false,
            created_date: new Date().toISOString(),
            created_by: 'current-user@example.com'
        };

        notifications.unshift(newNotification);
        localStorage.setItem('notifications', JSON.stringify(notifications));

        return newNotification;
    }

    static async update(id: string, data: any) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const index = notifications.findIndex((notif: any) => notif.id === id);

        if (index !== -1) {
            notifications[index] = { ...notifications[index], ...data };
            localStorage.setItem('notifications', JSON.stringify(notifications));
            return notifications[index];
        }

        throw new Error('Notification not found');
    }

    static async markAllAsRead() {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const updated = notifications.map((notif: any) => ({ ...notif, read: true }));
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
    }
}