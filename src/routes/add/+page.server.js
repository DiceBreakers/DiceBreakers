import { error } from '@sveltejs/kit';

export const actions = {
  verifyEmail: async ({ locals }) => {
    try {
        const email = locals.user?.email;

        if (!email) {
            throw error(400, 'Email not provided');
        }

        const record = await locals.pb.collection('users').requestVerification(email);

        return {
            status: 200,
            body: { record },
        };
    } catch (err) {
        console.error('Error sending verification email:', err);
        throw error(500, 'Internal Server Error');
    }
},

  create: async ({ request, locals }) => {
    if (request.method !== 'POST') {
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

      if (record && author) {
        const newVote = {
          "prompt": record.id,
          "by": author,
          "super": false,
        };
        await locals.pb.collection('pVotes').create(newVote);
      }

      return {
        status: 201,
        body: { record },
      };
    } catch (err) {
      console.error('Error:', err);
      
      throw error(500, "Internal Server Error");
    }
  },
};
