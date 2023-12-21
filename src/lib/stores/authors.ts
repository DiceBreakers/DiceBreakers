import { writable } from 'svelte/store';
import { currentUser } from './user';

function createAuthorFavoritesStore() {
    const { subscribe, set, update } = writable({});

    return {
        subscribe,
        setFavorites: (favorites) => {
            set(favorites);
        },
        toggleFavorite: (authorId) => {
            update(favorites => {
                const newFavorites = { ...favorites };
                newFavorites[authorId] = !favorites[authorId];
                return newFavorites;
            });
        }
    };
}

export const authorFavorites = createAuthorFavoritesStore();
