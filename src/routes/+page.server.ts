import { error, redirect } from '@sveltejs/kit';

interface PocketBaseError {
  originalError?: {
    status: number;
  };
}

export const actions = {
  generate: async ({ request, locals }) => {
    const data = await request.formData();
    let selectedCategories = data.getAll('categories') ?? [];
  
    let hiddenAuthors = locals.user?.hiddenAuthors ?? [];
    let hiddenPrompts = locals.user?.hiddenPrompts ?? [];
  
    if (hiddenAuthors.length === 0) {
      hiddenAuthors = ['empty'];
    }
    if (hiddenPrompts.length === 0) {
      hiddenPrompts = ['empty'];
    }
  
    try {
      const categoriesString = selectedCategories.toString().replace(/,/g, '"||categories~"');
      let prompts = await locals.pb.collection('prompts').getList(1, 2, {
        page: 1,
        perPage: 2,
        filter: `(categories~"${categoriesString}")&&("${hiddenAuthors}"?!~author)&&("${hiddenPrompts}"?!~id)`,
        expand: 'author',
        fields: 'expand.author.username,expand.author.id,id,prompt',
        sort: '@random',
      });
  
      console.log('Raw prompts:', prompts.items);
  
      const promptsData = await Promise.all(prompts.items.map(async (prompt) => {
      const isFavAuthor = locals.user?.favAuthors?.includes(prompt.expand?.author.id) || false;
  
        let scoreData;
        try {
          scoreData = await locals.pb.collection('pScore')
            .getFirstListItem(`id="${prompt.id}"`);
          // console.log(`Score data for prompt id ${prompt.id}:`, scoreData);
        } catch (err) {
          console.error(`Error fetching score for prompt id ${prompt.id}:`, err);
          scoreData = { score: 0 }; 
        }

        let commentCount;
        try {
          commentCount = await locals.pb.collection('cCount')
            .getFirstListItem(`id="${prompt.id}"`);
        //   console.log(`Comment count for prompt id ${prompt.id}:`, cCount);
        } catch (err) {
          console.error(`Error fetching comment count for prompt id ${prompt.id}:`, err);
          commentCount = { cCount: 0}; 
        }

        let voteStatus;
        try {
          voteStatus = await locals.pb.collection('pVotes')
            .getFirstListItem(`prompt="${prompt.id}"&&by="${locals.user?.id}"`);
        } catch (err) {
          console.error(`Error fetching vote status for prompt id ${prompt.id}:`, err);
          voteStatus = null;
        }
  
        return {
          ...prompt,
          liked: !!voteStatus,
          superLiked: !!voteStatus && voteStatus.super,
          isFavAuthor,
          score: scoreData.score,
          cCount: commentCount.cCount,
        };
      }));
  
      console.log('promptsData:', promptsData);
  
      return {
        records: JSON.stringify(promptsData),
      };
    } catch (err) {
      console.error('Error in generate function:', err);
      throw error(500, "The robots didn't like something about that...");
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

  pVote: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const data = await request.formData();
    const currentPromptId = data.get('promptId') ? String(data.get('promptId')) : '';
    const userId = locals.user?.id;
  
    if (!userId) {
      throw error(401, "You must be logged in to vote");
    }
  
    try {
      let existingVote;
  
      try {
        existingVote = await locals.pb.collection('pVotes')
          .getFirstListItem(`prompt="${currentPromptId}"&&by="${userId}"`);
      } catch (err: unknown) { 
        const pbError = err as PocketBaseError; 
        if (pbError.originalError && pbError.originalError.status === 404) {
          existingVote = null;
        } else {
          throw err;
        }
      }
  
      if (existingVote) {
        if (existingVote.super) {
          await locals.pb.collection('pVotes').delete(existingVote.id);
        } else {
          const updateVote = { super: true };
          await locals.pb.collection('pVotes').update(existingVote.id, updateVote);
        }
      } else {
        const newVote = {
          "prompt": currentPromptId,
          "by": userId,
          "super": false
        };
        await locals.pb.collection('pVotes').create(newVote);
      }
  
      return; // Indicate success
    } catch (err: unknown) { // Second catch with type assertion
      console.log('Error: ', err);
      throw error(500, "There was a problem processing your vote");
    }
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