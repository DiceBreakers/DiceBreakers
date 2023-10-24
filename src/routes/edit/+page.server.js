import { error } from '@sveltejs/kit';

export const actions = {
    pullPrompts: async ({ request, locals }) => {
      const data = await request.formData();
      const selectedCategories = data.getAll('categories') ?? [];
  
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
  };
  