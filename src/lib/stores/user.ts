import { writable } from 'svelte/store';

interface User {
    created: string;
    email: string;
    emailVisibility: boolean;
    favAuthors: string[];
    hiddenAuthors: string[];
    hiddenPrompts: string[];
    id: string;
    postPublic: boolean;
    preferences: {
        additionalCategories: string[];
        primaryCategories: string[];
        selectedFilter: string;
    };
    updated: string;
    username: string;
    verified: boolean;
}

export const currentUser = writable<User | Record<string, any> | null>(null);
