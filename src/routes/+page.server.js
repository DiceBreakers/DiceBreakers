import { error, redirect } from '@sveltejs/kit';

let pLiked = [];
let pSuperLiked = [];

export const actions = {
  generate: async ({ request, locals }) => {
    const data = await request.formData();
    const selectedCategories = data.getAll('categories') ?? [];
    pLiked = locals.user?.liked;
    pSuperLiked = locals.user?.superLiked;  

    try {
        const categoriesString = selectedCategories.toString().replace(/,/g, '"||categories~"');
		    let generatedPrompts = [];
        let records = await locals.pb.collection('prompts').getFullList({
          filter: `(categories~"${categoriesString}") && postPublic = true`,
          expand: 'author,prompt',
          fields: 'expand.author.username,expand.author.id,id,prompt',
          sort: '@random',
        });

        records = records.slice(0, 15);

		generatedPrompts = records.map((record) => ({
			prompt: record.prompt,
      promptId: record.id,
			author: record.expand?.author.username,
      authorId: record.expand?.author.id,
      isFavAuthor: locals.user?.favAuthors?.includes(record.expand?.author.id) || false,
      isSuper: locals.user?.superLiked?.includes(record.id) || false,
      isLiked: locals.user?.liked?.includes(record.id) || false,
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
    const favId = String(data.get('authorId')) || '';
  
    if (favAuthors.includes(favId)) {
      const updatedFavAuthors = favAuthors.filter((authorId) => authorId !== favId);
      const favUpdate = {
        favAuthors: updatedFavAuthors,
      };
      
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, favUpdate);
        console.log('favUpdate:', favUpdate)
      } catch (err) {
        console.log('Error: ', err);
        throw error(500, "Something went wrong while removing the favorite author.");
      }
    } else {
      const updatedFavAuthors = [...favAuthors, favId];
      const favUpdate = {
        favAuthors: updatedFavAuthors,
      };
      
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, favUpdate);
        console.log('favUpdate:', favUpdate)
      } catch (err) {
        console.log('Error: ', err);
        throw error(500, "Something went wrong while adding the favorite author.");
      }
    }
  
    throw redirect(303, '/');
  },

  likePrompt: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const data = await request.formData();
    const currentPromptId = String(data.get('promptId')) || '';
  

    pLiked = locals.user?.liked;
    pSuperLiked = locals.user?.superLiked;
  
    if (pSuperLiked.includes(currentPromptId)) {
      const updatedLike = pLiked.filter((promptId) => promptId !== currentPromptId);
      const updatedSuperLike = pSuperLiked.filter((promptId) => promptId !== currentPromptId);
      const updateLikes = {
        liked: updatedLike,
        superLiked: updatedSuperLike,        
      }
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, updateLikes);
        return;
      } catch (err) {
        console.log('Error: ', err);
        throw error(501, "Didn't remove likes");
      }
    } else if (pLiked.includes(currentPromptId)) {
      const updatedSuperLike = [...pSuperLiked, currentPromptId];
      const updateLikes = {
        superLiked: updatedSuperLike,        
      }
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, updateLikes);
        return;
      } catch (err) {
        console.log('Error: ', err);
        throw error(502, "Didn't add SuperLike");
      }
    } else {
      const updatedLike = [...pLiked, currentPromptId];
      const updateLikes = {
        liked: updatedLike,        
      }
      try {
        const record = await locals.pb.collection('users').update(locals.user?.id, updateLikes);
      } catch (err) {
        console.log('Error: ', err);
        throw error(503, "Didn't add Like");
      }
    }
    throw redirect(303, '/');
  },
};

