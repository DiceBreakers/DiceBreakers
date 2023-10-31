import { error, redirect } from '@sveltejs/kit';

export const actions = {
  generate: async ({ request, locals }) => {
    const data = await request.formData();
    const selectedCategories = data.getAll('categories') ?? [];

    try {

        const categoriesString = selectedCategories.toString().replace(/,/g, '"||categories~"');

		let generatedPrompts = [];

		let records = await locals.pb.collection('prompts').getFullList({
      filter: `(categories~"${categoriesString}") && postPublic = true`,
      expand: 'author',
      fields: 'expand.author.username,expand.author.id,prompt',
      sort: '@random',
        });

		generatedPrompts = records.map((record) => ({
			prompt: record.prompt,
			author: record.expand?.author.username,
      id: record.expand?.author.id,
      isFavAuthor: locals.user?.favAuthors?.includes(record.expand?.author.id) || false,
		  }));
      

      return {
        records: JSON.stringify(generatedPrompts),
      };
    } catch (err) {
      console.error('Error: ', err);
      throw error(400, "The robots didn't like something about that...");
    }
  },

  favAuthor: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const favAuthors = locals.user?.favAuthors || [];
    
    const data = await request.formData();
    
    const favId = String(data.get('id')) || '';
  
    if (favAuthors.includes(favId)) {
      // If favId exists in the array, remove it
      const updatedFavAuthors = favAuthors.filter((authorId) => authorId !== favId);
      const favUpdate = {
        favAuthors: updatedFavAuthors,
      };
      
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, favUpdate);
      } catch (err) {
        console.log('Error: ', err);
        console.log('favId:', favId);
        throw error(500, "Something went wrong while removing the favorite author.");
      }
    } else {
      // If favId doesn't exist in the array, add it
      const updatedFavAuthors = [...favAuthors, favId];
      const favUpdate = {
        favAuthors: updatedFavAuthors,
      };
      
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, favUpdate);
      } catch (err) {
        console.log('Error: ', err);
        console.log('favId:', favId);
        throw error(500, "Something went wrong while adding the favorite author.");
      }
    }
  
    throw redirect(303, '/');
  },  
};

