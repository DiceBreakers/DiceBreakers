import { redirect } from '@sveltejs/kit';
import { updateCurrentUser } from '$lib/stores/pocketbase';

export const load = async ({ locals }) => {

	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}
};