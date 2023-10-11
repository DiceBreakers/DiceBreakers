import { error, redirect } from '@sveltejs/kit';

export const actions = {
  create: async ({ request, locals }) => {
    if (request.method !== 'POST') {
		console.log('Error: ', err);
		throw error(err.status, "The robots didn't like something about that...");
    }

    // Handle the POST request for form submission
    const data = await request.formData();

    const prompt = data.get('prompt') ?? '';
    const categories = data.getAll('categories') ?? '';
    const author = (locals.user?.id) ?? '';
    const postPublic = (locals.user?.postPublic) ?? '';

    const addPrompt = {
      prompt: prompt,
      categories: categories,
      author: author,
      postPublic: postPublic,
    };

    try {
      const record = await locals.pb.collection('prompts').create(addPrompt);
      // Handle success, e.g., return a success response
    } catch (err) {
      console.log('Error: ', err);
      throw error(err.status, "The robots didn't like something about that...");
    }

    throw redirect(303, '/add#addPrompt'); // Redirect to the desired location
  },
};