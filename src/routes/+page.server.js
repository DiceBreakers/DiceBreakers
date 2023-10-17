import { error } from '@sveltejs/kit';

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
      fields: 'expand.author.username,prompt',
      sort: '@random',
			skipTotal: 1,
        });

		generatedPrompts = records.map((record) => ({
			prompt: record.prompt,
			author: record.expand?.author.username,
		  }));
      

      return {
        records: JSON.stringify(generatedPrompts), // Convert to JSON string
      };
    } catch (err) {
      console.error('Error: ', err);
      throw error(err.status, "The robots didn't like something about that...");
    }
  },
};
