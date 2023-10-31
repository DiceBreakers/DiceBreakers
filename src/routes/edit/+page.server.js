import { error, redirect } from '@sveltejs/kit';

export const actions = {
    pullPrompts: async ({ request, locals }) => {
      const data = await request.formData();
      const selectedCategories = data.getAll('filterCategories') ?? [];
  
      try {
  
          const categoriesString = selectedCategories.toString().replace(/,/g, '"||categories~"');
  
          let userPrompts = [];
          if (locals.user && locals.user.name !== null) {
          let records = await locals.pb.collection('prompts').getFullList({
        filter: `(categories~"${categoriesString}") && author.username = "${locals.user.username}"`,
        fields: 'categories,prompt,id',
        sort: '-created',
          });
        
          userPrompts = records.map((record) => ({
              prompt: record.prompt,
              categories: record.categories,
              id: record.id,
            }));
        };
  
        return {
          records: JSON.stringify(userPrompts), // Convert to JSON string
        };
      } catch (err) {
        console.error('Error: ', err);
        throw error(400, "The robots didn't like something about that...");
      }
    },
  
    update: async ({ request, locals }) => {
      if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
      }
  
      const data = await request.formData();
      
      const prompt = data.get('prompt') ?? '';
      const categories = data.getAll('categories') ?? '';
      const promptId = String(data.get('pId')) || '';

      const editPrompt = {
        prompt: prompt,
        categories: categories,
      };
  
      try {
        const record = await locals.pb.collection('prompts').update(promptId, editPrompt);
      } catch (err) {
        console.log('Error: ', err);
        console.log('promptId:', promptId)
        throw error(400, "The robots didn't like something about that...");
      }

      throw redirect(303, '/edit');
    },

  delete: async ({ request, locals }) => {
    if (request.method !== 'POST') {
    console.log('Error: Non-POST');
    throw error(400, "The robots didn't like something about that...");
    }

    const data = await request.formData();
    
    const promptId = String(data.get('pId')) || '';

    console.log('promptId', promptId)

    try {
      await locals.pb.collection('prompts').delete(promptId);

    } catch (err) {
      console.log('Error: ', err);
      console.log('promptId:', promptId)
      throw error(400, "The robots didn't like something about that...");
    }

    throw redirect(303, '/edit'); // Redirect to the desired location
  },
};
