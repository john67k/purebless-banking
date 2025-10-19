import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Create page URL helper
export function createPageUrl(page: string, params?: Record<string, string>): string {
    const baseUrl = `/${page}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        return `${baseUrl}?${searchParams.toString()}`;
    }
    return baseUrl;
}

// Format currency helper
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount || 0);
}

// Format date helper
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}