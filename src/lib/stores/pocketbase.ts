// pocketbase.ts
import PocketBase from 'pocketbase';
import { currentUser } from './user';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export function createInstance() {
    return new PocketBase(PUBLIC_POCKETBASE_URL);
}

export const pb = createInstance();

// This will be called initially and every time the auth state changes
export function updateCurrentUser() {
    // Set the current user with the updated model from the authStore
    currentUser.set(pb.authStore.model);
}
