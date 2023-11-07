import { error, redirect } from '@sveltejs/kit';

let pLiked = [];
let pSuperLiked = [];

export const actions = {
  generate: async ({ request, locals }) => {
    const data = await request.formData();
    const selectedCategories = data.getAll('categories') ?? [];
    pLiked = locals.user?.liked;
    pSuperLiked = locals.user?.superLiked;
    let hiddenAuthors = locals.user?.hiddenAuthors ?? [];
    let hiddenPrompts = locals.user?.hiddenPrompts ?? [];  
    console.log('hiddenAuthors', hiddenAuthors)
    console.log('hiddenPrompts', hiddenPrompts)

    try {
          
        const categoriesString = selectedCategories.toString().replace(/,/g, '"||categories~"');
		    let generatedPrompts = [];
        let records = await locals.pb.collection('prompts').getFullList({
          filter: `(categories~"${categoriesString}")`,
          expand: 'author,prompt',
          fields: 'expand.author.username,expand.author.id,id,prompt',
          sort: '@random',
        });

        records = records.filter(record => 
          !hiddenAuthors.includes(record.expand?.author.id) &&
          !hiddenPrompts.includes(record.id)
        );

        if (records.length === 0) {
          console.log('noRecords');
          throw new Error("No Prompts Found");
        }
  
        console.log('stillrunning')
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

  hidePrompt: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const hiddenPrompts = locals.user?.hiddenPrompts || [];
    const data = await request.formData();    
    const promptId = String(data.get('promptId')) || '';

  //  console.log('hiddenPrompts:', hiddenPrompts)
  //  console.log('promptId:', promptId)
  
    if (hiddenPrompts.includes(promptId)) {
      console.log('Prompt already hidden');
      throw error(400, "Prompt already hidden");
    }
  
    const updatedHiddenPrompts = [...hiddenPrompts, promptId];
    console.log('updatedHiddenPrompts:', updatedHiddenPrompts)
    const hiddenPromptsPackage = {
      hiddenPrompts: updatedHiddenPrompts,
    };

   // console.log('hiddenPromptsPackage:', hiddenPromptsPackage)
  
    try {
      const record = await locals.pb.collection('users').update(locals.user?.id, hiddenPromptsPackage);
    } catch (err) {
      console.log('Error: ', err);
      throw error(500, "Failed to hide prompt");
    }
  
    throw redirect(303, '/');
  },

  hideAuthor: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const hiddenAuthors = locals.user?.hiddenAuthors || [];
    const data = await request.formData();    
    const authorId = String(data.get('authorId')) || '';

   // console.log('hiddenAuthors:', hiddenAuthors)
   // console.log('authorId:', authorId)
  
    if (hiddenAuthors.includes(authorId)) {
      console.log('Author already hidden');
      throw error(400, "Author already hidden");
    }
  
    const updatedHiddenAuthors = [...hiddenAuthors, authorId];
    console.log('updatedHiddenAuthors:', updatedHiddenAuthors)
    const hiddenAuthorsUpdate = {
      hiddenAuthors: updatedHiddenAuthors,
    };

   // console.log('hiddenAuthorsUpdate:', hiddenAuthorsUpdate)
  
    try {
      const record = await locals.pb.collection('users').update(locals.user?.id, hiddenAuthorsUpdate);
    } catch (err) {
      console.log('Error: ', err);
      throw error(500, "Failed to hide prompt");
    }

    throw redirect(303, '/');
  },

  report: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const data = await request.formData();    
    const reportUser = String(data.get('authorId')) || '';
    const reportPrompt = String(data.get('promptId')) || '';
    const promptText = String(data.get('promptText')) || '';
    const reportReason = String(data.get('report')) || '';
    const reportBy = locals.user?.id || '';
  
    const reportPackage = { reportedUser: reportUser,
      reportedBy: reportBy,
      reportedPrompt: reportPrompt,
      originalText: promptText,
      report: reportReason,      
    };
    
    // console.log('reportPackage:', reportPackage)
  
    try {
      const record = await locals.pb.collection('reports').create(reportPackage);
    } catch (err) {
      console.log('Error: ', err);
      throw error(500, "Report failed... Try again?");
    }
  
    // Redirect after successful hiding of the prompt
    throw redirect(303, '/');
  },
};