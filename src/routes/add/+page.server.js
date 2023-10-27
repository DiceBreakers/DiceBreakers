import { error, redirect } from '@sveltejs/kit';

export const actions = {
  create: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      // If it's not a POST request, return an error response
      throw error(405, "Method Not Allowed");
    }

    try {
      const data = await request.formData();

      const prompt = data.get('prompt') || '';
      const categories = data.getAll('categories') || [];
      const author = locals.user?.id || '';
      const postPublic = locals.user?.postPublic || '';

      const addPrompt = {
        prompt,
        categories,
        author,
        postPublic,
      };

      const record = await locals.pb.collection('prompts').create(addPrompt);

      // Handle success
      return {
        status: 201, // Created status code
        body: { record }, // Return the newly created record
      };
    } catch (err) {
      console.error('Error:', err);

      // Handle errors and return an appropriate error response
      throw error(500, "Internal Server Error");
    }
  },
};
