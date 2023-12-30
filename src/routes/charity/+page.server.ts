import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface PocketBaseError {
  originalError?: {
    status: number;
  };
}

export const load: PageServerLoad = async ({ locals }) => {
  let hiddenAuthors = locals.user?.hiddenAuthors ?? [];

  if (hiddenAuthors.length === 0) {
    hiddenAuthors = ['empty'];
  }
  
  try {
    // console.log(`Fetching comments for upcoming`);
    let approved = await locals.pb.collection('comments').getFullList({
      filter: "prompt='tr7djwhobfpudba'",
      expand: 'author,prompt',
      fields: 'expand.author.id,expand.author.username,text,id,parent',
      sort: '-created',
    });

 //   console.log('initApprovedData:', approved)

    let proposed = await locals.pb.collection('comments').getFullList({
      filter: "prompt='4537ifyx9pijbab'",
      expand: 'author,prompt',
      fields: 'expand.author.id,expand.author.username,text,id,parent',
      sort: '-created',
    });

//    console.log('initProposedData:', proposed)

    const approvedData = await Promise.all(approved.map(async (comment) => {
      const isFavAuthor = locals.user?.favAuthors?.includes(comment.expand?.author.id) || false;
      
      try {
   //     console.log(`Fetching vote status for comment ${comment.id}`);
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

//     console.log('approvedData', approvedData);

     const proposedData = await Promise.all(proposed.map(async (comment) => {
      const isFavAuthor = locals.user?.favAuthors?.includes(comment.expand?.author.id) || false;
      
      try {
 //       console.log(`Fetching vote status for comment ${comment.id}`);
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

//     console.log('proposedData', proposedData);

    return {
      approvedRecords: JSON.stringify(approvedData),
      proposedRecords: JSON.stringify(proposedData),      
    };
  } catch (err) {
    console.error('Error: ', err);
    throw error(500, "The robots couldn't get the suggestion data...");
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

//      console.log('favId:', favId)
    
      if (favAuths.includes(favId)) {
        const updatedFavAuths = favAuths.filter((authId) => authId !== favId);
        const favUpdate = {
          favAuthors: updatedFavAuths,
        };

 //       console.log('favUpdate:', favUpdate)
        
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

 //   console.log('addComment:', addComment)
  
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