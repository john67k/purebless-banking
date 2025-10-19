// CardApplication entity - handles credit card applications
export class CardApplication {
    static async list(orderBy = '-created_date', limit = 50) {
        const applications = JSON.parse(localStorage.getItem('cardApplications') || '[]');

        // Sort applications
        const sorted = applications.sort((a: any, b: any) => {
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
        const applications = JSON.parse(localStorage.getItem('cardApplications') || '[]');
        const newApplication = {
            id: Date.now().toString(),
            ...data,
            created_date: new Date().toISOString(),
            created_by: 'current-user@example.com'
        };

        applications.unshift(newApplication);
        localStorage.setItem('cardApplications', JSON.stringify(applications));

        return newApplication;
    }

    static async update(id: string, data: any) {
        const applications = JSON.parse(localStorage.getItem('cardApplications') || '[]');
        const index = applications.findIndex((app: any) => app.id === id);

        if (index !== -1) {
            applications[index] = { ...applications[index], ...data };
            localStorage.setItem('cardApplications', JSON.stringify(applications));
            return applications[index];
        }

        throw new Error('Card application not found');
    }
}