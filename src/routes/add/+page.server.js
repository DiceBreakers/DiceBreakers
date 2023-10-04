import { error, redirect } from '@sveltejs/kit';
import { append } from 'svelte/internal';

export const load = ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}
};

export const actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();

		data.append('author', locals.user.id);

		const prompt = data.get('prompt')?? '';
		const categories = data.getAll('categories')?? '';
		const author = data.get('author')?? '';

		const addPrompt = {
			"prompt": prompt,
			"categories": categories,
			"author": author,
		};

		try {
			const record = await locals.pb.collection('prompts').create(addPrompt);
		} catch (err) {
			console.log('Error: ', err);
			throw error(err.status, "The robots didn't like something about that...");
		}

		throw redirect(303, '/add#addPrompt');
	}
};