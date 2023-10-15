import { error } from '@sveltejs/kit';
import type { Actions } from './$types'

export const actions: Actions = {
	resetPasswordInit: async ({ request, locals }) => {
		const data = Object.fromEntries(await request.formData()) as {
			email: string
		}

		try {
			await locals.pb.collection('users').requestPasswordReset(data.email);
			return {
				success: true
			};
		} catch (err) {
			console.log('Error: ', err);
			throw error(500, 'Something went wrong');
		}
	}
};