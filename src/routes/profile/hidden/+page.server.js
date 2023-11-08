import { error, redirect } from '@sveltejs/kit';

export const actions = {
    pullHiddenPrompts: async ({ locals }) => {

      let currentHiddenPrompts = locals?.user?.hiddenPrompts || [];
  
      try {
          const hiddenPromptsString = currentHiddenPrompts.toString().replace(/,/g, '"||id="');
  
          let hiddenPrompts = [];
          if (locals.user && locals.user.name !== null) {
          let records = await locals.pb.collection('prompts').getFullList({
            filter: `(id="${hiddenPromptsString}")`,
            fields: 'prompt,id',
            sort: '-created',
        });
        
          hiddenPrompts = records.map((record) => ({
              prompt: record.prompt,
              id: record.id,
            }));
        };

        return {
          records: JSON.stringify(hiddenPrompts),
        };
      } catch (err) {
        console.error('Error: ', err);
        throw error(400, "The robots didn't like something about that...");
      }
    },

    pullHiddenAuthors: async ({ locals }) => {    
      try {
        let hiddenAuthors = [];
        if (locals.user && locals.user.name !== null) {
          let records = await locals.pb.collection('users').getFullList({
            expand: 'hiddenAuthors',
            fields: 'expand.hiddenAuthors.username,expand.hiddenAuthors.id',
            sort: '-created',
          });
    
          console.log('records:', records);
    
          hiddenAuthors = records.flatMap((record) => {
            if (Array.isArray(record.expand?.hiddenAuthors)) {
              return record.expand?.hiddenAuthors.map((author) => ({
                username: author.username,
                id: author.id, 
              }));
            }
            return []; 
          });
        }
    
        console.log('hiddenAuthors:', hiddenAuthors);
    
        return {
          records: JSON.stringify(hiddenAuthors),
        };
      } catch (err) {
        console.error('Error: ', err);
        throw error(400, "The robots didn't like something about that...");
      }
    },
    
  
    showAuthor: async ({ request, locals }) => {
      if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
      }

      let currentHiddenAuthors = locals?.user?.hiddenAuthors || [];  
      const data = await request.formData();      
      const authorId = data.get('authorId') ?? '';

      let updateAuthors = currentHiddenAuthors.filter(author => author !== authorId);

      let authorsPackage = {
        "hiddenAuthors": updateAuthors
      }

      console.log('user.id:', locals.user?.id)
      console.log('AuthorsPackage:', authorsPackage)
  
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, authorsPackage);
      } catch (err) {
        console.log('Error: ', err);
        throw error(400, "The robots didn't like something about that...");
      }

      throw redirect(303, '/profile/hidden');
    },

    showPrompt: async ({ request, locals }) => {
      if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
      }

      let currentHiddenPrompts = locals?.user?.hiddenPrompts || [];  
      const data = await request.formData();      
      const promptId = data.get('promptId') ?? '';

      let updatePrompts = currentHiddenPrompts.filter(prompt => prompt !== promptId);

      let promptsPackage = {
        "hiddenPrompts": updatePrompts
      }

      console.log('PromptsPackage:', promptsPackage)
  
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, promptsPackage);
      } catch (err) {
        console.log('Error: ', err);
        throw error(400, "The robots didn't like something about that...");
      }

      throw redirect(303, '/profile/hidden');
    },

  };
