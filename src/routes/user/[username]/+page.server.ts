import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface PocketBaseError {
  originalError?: {
    status: number;
  };
}

const promptsPerPage = 20;
let promptsPage = 1;
let commentsPage = 1;
let authId = '';

export const load: PageServerLoad = async ({ params, locals }) => {
  const userName = params.username;
  const authNameLower = userName.toLowerCase(); 

  try {
    const authQuery = await locals.pb.collection('userName').getFirstListItem(`userNameLower = "${authNameLower}"`);

    if (authQuery) {
      authId = authQuery.id;
      let promptsResult = await locals.pb.collection('prompts').getList(promptsPage, promptsPerPage, {
        filter: `author="${authId}"`, 
        expand: 'author',
        fields: 'expand.author.id,expand.author.username,prompt,id',
        sort: '-created',
      });
 //    console.log('promptsList:', promptsResult)
      let prompts = promptsResult.items

      let commentsResult = await locals.pb.collection('comments').getList(commentsPage, promptsPerPage, {
        filter: `(author="${authId}")`,
        expand: 'author,prompt',
        fields: 'expand.author.id,expand.author.username,prompt,id,text,parent',
        sort: '-created',
      });
 //     console.log('comments:', commentsResult)
      let comments = commentsResult.items
      
    const isFavAuthor = locals.user?.favAuthors?.includes(authId) || false;

      const promptsData = await Promise.all(prompts.map(async (prompt) => {        
        try {
  //        console.log(`Fetching vote status for prompt ${prompt.id}`);
          const voteStatus = await locals.pb.collection('pVotes')
            .getFirstListItem(`prompt="${prompt.id}"&&by="${locals.user?.id}"`);
  
  //       console.log(`Fetching prompt score for prompt ${prompt.id}`);
          const pScore = await locals.pb.collection('pScore')
            .getFirstListItem(`id="${prompt.id}"`);
          const score = pScore ? pScore.score : 1;
  
          return {
            ...prompt,
            isLiked: !!voteStatus,
            isSuper: !!voteStatus && voteStatus.super,
            isFavAuthor,
            score,
          };
        } catch (err: unknown) {
          const pbError = err as PocketBaseError;
          if (pbError.originalError && pbError.originalError.status === 404) {
            return {
              ...prompt,
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
  
      // console.log('promptsData', promptsData);

      const commentsData = await Promise.all(comments.map(async (comment) => {
        const isFavAuthor = locals.user?.favAuthors?.includes(comment.expand?.author.id) || false;
        
        try {
    //      console.log(`Fetching vote status for comment ${comment.id}`);
          const voteStatus = await locals.pb.collection('cVotes')
            .getFirstListItem(`comment="${comment.id}"&&by="${locals.user?.id}"`);
  
    //      console.log(`Fetching comment score for comment ${comment.id}`);
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
        prompts: JSON.stringify(promptsData),
        comments: JSON.stringify(commentsData),
        username: userName,
        promptsPagination: { 
          page: promptsPage,
          perPage: 20,
          totalItems: promptsResult.totalItems,
          totalPages: promptsResult.totalPages
        },
        commentsPagination: { 
          page: commentsPage,
          perPage: 20,
          totalItems: commentsResult.totalItems,
          totalPages: commentsResult.totalPages
        }
      };
    } else {
      throw new Error(`User with username "${authNameLower}" not found`);
    }
  } catch (err) {
    console.error('Error: ', err);
    throw error(500, "The robots didn't like something about that...");
  }
};

export const actions = {
  loadMore: async ({ locals, request }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }

    const data = await request.formData();
    const itemsPerPage = 20;
    const author = authId;
    const type = data.get('type') as string;
    let page = parseInt(data.get('page') as string) || 1;

//    console.log('data:', data)
 //   console.log('authId:', authId)

    if (type === 'prompts') {
      const promptsResult = await locals.pb.collection('prompts').getList(page, itemsPerPage, {
        filter: `author="${author}"`, 
        expand: 'author',
        fields: 'expand.author.id,expand.author.username,prompt,id',
        sort: '-created',
      });
  //    console.log('promptsResult:', promptsResult)
      let prompts = promptsResult.items;

      const isFavAuthor = locals.user?.favAuthors?.includes(authId) || false;

      const promptsData = await Promise.all(prompts.map(async (prompt) => {        
        try {
  //        console.log(`Fetching vote status for prompt ${prompt.id}`);
          const voteStatus = await locals.pb.collection('pVotes')
            .getFirstListItem(`prompt="${prompt.id}"&&by="${locals.user?.id}"`);
  
  //       console.log(`Fetching prompt score for prompt ${prompt.id}`);
          const pScore = await locals.pb.collection('pScore')
            .getFirstListItem(`id="${prompt.id}"`);
          const score = pScore ? pScore.score : 1;
  
          return {
            ...prompt,
            isLiked: !!voteStatus,
            isSuper: !!voteStatus && voteStatus.super,
            isFavAuthor,
            score,
          };
        } catch (err: unknown) {
          const pbError = err as PocketBaseError;
          if (pbError.originalError && pbError.originalError.status === 404) {
            return {
              ...prompt,
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

 //     console.log('promptsData:', promptsData)

      return {
            prompts: JSON.stringify(promptsData),
            promptsPagination: { 
                page: promptsPage,
                perPage: 20,
                totalItems: promptsResult.totalItems,
                totalPages: promptsResult.totalPages
            },
        };

    } else if (type === 'comments') {
      const commentsResult = await locals.pb.collection('comments').getList(page, itemsPerPage, {
        filter: `(author="${author}")`,
        expand: 'author,prompt',
        fields: 'expand.author.id,expand.author.username,prompt,id,text,parent',
        sort: '-created',
      });
  //    console.log('commentsResult:', commentsResult)
      let comments = commentsResult.items;
      const isFavAuthor = locals.user?.favAuthors?.includes(authId) || false;

      const commentsData = await Promise.all(comments.map(async (comment) => {        
        try {
  //        console.log(`Fetching vote status for prompt ${prompt.id}`);
          const voteStatus = await locals.pb.collection('cVotes')
            .getFirstListItem(`comment="${comment.id}"&&by="${locals.user?.id}"`);
  
  //       console.log(`Fetching prompt score for prompt ${prompt.id}`);
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

      console.log('commentsData:', commentsData)

      return {
            comments: JSON.stringify(commentsData),
            promptsPagination: { 
                page: promptsPage,
                perPage: 20,
                totalItems: commentsResult.totalItems,
                totalPages: commentsResult.totalPages
            },
        };
    }
  },
  
  favAuth: async ({ request, locals }) => {
      if (request.method !== 'POST') {
        console.log('Error: Non-POST');
        throw error(400, "The robots didn't like something about that...");
      }
    
      const favAuths = locals.user?.favAuthors || [];

      console.log('localfavs:', favAuths)
      
      const data = await request.formData();    
      const favId = String(data.get('authId')) || '';

      console.log('favId:', favId)
    
      if (favAuths.includes(favId)) {
        const updatedFavAuths = favAuths.filter((authId) => authId !== favId);
        const favUpdate = {
          favAuthors: updatedFavAuths,
        };

        console.log('favUpdate:', favUpdate)
        
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

    console.log('addComment:', addComment)
  
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