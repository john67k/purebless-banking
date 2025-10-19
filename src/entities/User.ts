// User entity - handles authentication and user data
export class User {
    static async me() {
        // Mock user data - in a real app, this would come from an API
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            return JSON.parse(userData);
        }

        // Default mock user
        const defaultUser = {
            id: '1',
            full_name: 'John Doe',
            email: 'john@example.com',
            wallet_balance: 1250.75,
            kyc_status: 'verified',
            role: 'user',
            daily_send_limit: 5000,
            daily_receive_limit: 10000,
            created_date: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        return defaultUser;
    }

    static async updateMyUserData(data: any) {
        const currentUser = await this.me();
        const updatedUser = { ...currentUser, ...data };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return updatedUser;
    }

    static async logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    }

    static async login(email: string, password: string) {
        // Mock login - in a real app, this would authenticate with a server
        if (email && password) {
            const user = {
                id: '1',
                full_name: 'John Doe',
                email,
                wallet_balance: 1250.75,
                kyc_status: 'verified',
                role: email.includes('admin') ? 'admin' : 'user',
                daily_send_limit: 5000,
                daily_receive_limit: 10000,
                created_date: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', 'mock-token-' + Date.now());
            return user;
        }
        throw new Error('Invalid credentials');
    }

    static async register(userData: any) {
        // Mock registration
        const user = {
            id: Date.now().toString(),
            ...userData,
            wallet_balance: 0,
            kyc_status: 'unverified',
            role: 'user',
            daily_send_limit: 1000,
            daily_receive_limit: 2000,
            created_date: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        return user;
    }
}