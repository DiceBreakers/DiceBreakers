// user.ts
import { writable } from 'svelte/store';

export const currentUser = writable<Record<string, any> | null>(null);
