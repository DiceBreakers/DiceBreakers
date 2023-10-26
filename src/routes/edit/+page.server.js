import { error, redirect } from '@sveltejs/kit';

export const actions = {
    pullPrompts: async ({ request, locals }) => {
      const data = await request.formData();
      const selectedCategories = data.getAll('filterCategories') ?? [];

      console.log(selectedCategories)
  
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
        throw error(err.status, "The robots didn't like something about that...");
      }
    },
  
    update: async ({ request, locals }) => {
      if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(err.status, "The robots didn't like something about that...");
      }
  
      // Handle the POST request for form submission
      const data = await request.formData();
      
      const prompt = data.get('prompt') ?? '';
      const categories = data.getAll('categories') ?? '';
      const promptId = String(data.get('pId')) || '';

      console.log('promptId', promptId)
      console.log('prompt', prompt)
      console.log('categories', categories)

  
      const editPrompt = {
        prompt: prompt,
        categories: categories,
      };
  
      try {
        const record = await locals.pb.collection('prompts').update(promptId, editPrompt);
        // Handle success, e.g., return a success response
      } catch (err) {
        console.log('Error: ', err);
        console.log('promptId:', promptId)
        throw error(err.status, "The robots didn't like something about that...");
      }
  
      throw redirect(303, '/edit'); // Redirect to the desired location
    },
  };
