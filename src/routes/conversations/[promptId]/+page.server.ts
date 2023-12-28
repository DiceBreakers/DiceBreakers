import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface PocketBaseError {
  originalError?: {
    status: number;
  };
}

export const load: PageServerLoad = async ({ params, locals }) => {
  const promptId = params.promptId;
  let hiddenAuthors = locals.user?.hiddenAuthors ?? [];

  if (hiddenAuthors.length === 0) {
    hiddenAuthors = ['empty'];
  }
  
  try {
    // console.log(`Fetching comments for prompt ${promptId}`);
    let comments = await locals.pb.collection('comments').getFullList({
      filter: `(prompt="${promptId}")&&("${hiddenAuthors}"?!~author)`,
      expand: 'author,prompt',
      fields: 'expand.author.id,expand.author.username,text,id,parent',
      sort: '-created',
    });

    // console.log(`Fetching prompt details for prompt ${promptId}`);
    let prompt = await locals.pb.collection('prompts').getFirstListItem(`id="${promptId}"`, {
      expand: 'author',
      fields: 'expand.author.id,expand.author.username,id,prompt',
    });

    const isFavAuthor = locals.user?.favAuthors?.includes(prompt.expand?.author.id) || false;

    // console.log(`Fetching vote status for prompt ${promptId}`);
    let voteStatus;
    try {
      voteStatus = await locals.pb.collection('pVotes')
        .getFirstListItem(`prompt="${promptId}"&&by="${locals.user?.id}"`);
    } catch (err: unknown) {
      const pbError = err as PocketBaseError;
      if (pbError.originalError && pbError.originalError.status === 404) {
   //     console.log(`No vote record found for prompt ${promptId}`);
        voteStatus = null; // Handle the case where no vote record exists
      } else {
        throw err;
      }
    }

    let score = 1;
    try {
      // console.log(`Fetching prompt score for prompt ${promptId}`);
      const pScore = await locals.pb.collection('pScore')
        .getFirstListItem(`id="${promptId}"`);
      score = pScore ? pScore.score : 1;
    } catch (err: unknown) {
      const pbError = err as PocketBaseError;
      if (pbError.originalError && pbError.originalError.status === 404) {
   //     console.log(`No score record found for prompt ${promptId}`);
      } else {
        throw err;
      }
    }

    prompt = {
      ...prompt,
      isLiked: !!voteStatus,
      isSuper: !!voteStatus && voteStatus.super,
      isFavAuthor,
      score,
    };


    const commentsData = await Promise.all(comments.map(async (comment) => {
      const isFavAuthor = locals.user?.favAuthors?.includes(comment.expand?.author.id) || false;
      
      try {
  //      console.log(`Fetching vote status for comment ${comment.id}`);
        const voteStatus = await locals.pb.collection('cVotes')
          .getFirstListItem(`comment="${comment.id}"&&by="${locals.user?.id}"`);

 //       console.log(`Fetching comment score for comment ${comment.id}`);
        const cScore = await locals.pb.collection('cScore')
          .getFirstListItem(`id="${comment.id}"`);
        const score = cScore ? cScore.score : 1;

        return {
          ...comment,
          isLiked: !!voteStatus,
          isSuper: !!voteStatus && voteStatus.super,
          isFavAuthor,
          score,
        };
      } catch (err: unknown) {
        const pbError = err as PocketBaseError;
        if (pbError.originalError && pbError.originalError.status === 404) {
          return {
            ...comment,
            isLiked: false,
            isSuper: false,
            isFavAuthor,
            score: 1,
          };
        } else {
          throw err;
        }
      }
    }));

    // console.log('commentsData', commentsData);

    return {
      records: JSON.stringify(commentsData),
      prompt: JSON.stringify(prompt)
    };
  } catch (err) {
    console.error('Error: ', err);
    throw error(500, "The robots didn't like something about that...");
  }
};


export const actions = {
  favAuth: async ({ request, locals }) => {
      if (request.method !== 'POST') {
        console.log('Error: Non-POST');
        throw error(400, "The robots didn't like something about that...");
      }
    
      const favAuths = locals.user?.favAuthors || [];

 //     console.log('localfavs:', favAuths)
      
      const data = await request.formData();    
      const favId = String(data.get('authId')) || '';

  //    console.log('favId:', favId)
    
      if (favAuths.includes(favId)) {
        const updatedFavAuths = favAuths.filter((authId) => authId !== favId);
        const favUpdate = {
          favAuthors: updatedFavAuths,
        };

  //      console.log('favUpdate:', favUpdate)
        
        try {
          const record = await locals.pb.collection('users').update(locals.user?.id, favUpdate);
        } catch (err) {
          console.log('Error: ', err);
          throw error(500, "Something went wrong while removing the favorite author.");
        }
      } else {
        const updatedFavAuths = [...favAuths, favId];
        const favUpdate = {
          favAuthors: updatedFavAuths,
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
  
      return; 
    } catch (err: unknown) {
      console.log('Error: ', err);
      throw error(500, "There was a problem processing your vote");
    }
  },

  cVote: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const data = await request.formData();
    const currentCommentId = data.get('commentId') ? String(data.get('commentId')) : '';
    const userId = locals.user?.id;
  
    if (!userId) {
      throw error(401, "You must be logged in to vote");
    }
  
    try {
      let existingVote;
  
      try {
        existingVote = await locals.pb.collection('cVotes')
          .getFirstListItem(`comment="${currentCommentId}"&&by="${userId}"`);
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
          await locals.pb.collection('cVotes').delete(existingVote.id);
        } else {
          const updateVote = { super: true };
          await locals.pb.collection('cVotes').update(existingVote.id, updateVote);
        }
      } else {
        const newVote = {
          "comment": currentCommentId,
          "by": userId,
          "super": false
        };
        await locals.pb.collection('cVotes').create(newVote);
      }
  
      return; 
    } catch (err: unknown) {
      console.log('Error: ', err);
      throw error(500, "There was a problem processing your vote");
    }
  },

  submitReply: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const data = await request.formData();
    const text = data.get('text') ? String(data.get('text')) : '';
    const promptId = data.get('promptId') ? String(data.get('promptId')) : '';
    const parentId = data.get('parentId') ? String(data.get('parentId')) : '';
    const authorId = locals.user?.id;

    const addComment = {
      'prompt': promptId,
      'text': text,
      'author': authorId,
      'parent': parentId,
    };

//    console.log('addComment:', addComment)
  
    if (!authorId) {
      throw error(401, "You must be logged in to comment");
    }

    try {      
      const record = await locals.pb.collection('comments').create(addComment);

      const newVote = {
        "comment": record.id,
        "by": locals.user?.id,
        "super": false
      };

      await locals.pb.collection('cVotes').create(newVote);

      return (record); 
    } catch (err: unknown) {
      console.log('Error: ', err);
      throw error(500, "There was a problem submitting your comment.");
    }
  },


}