import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface PocketBaseError {
  originalError?: {
    status: number;
  };
}

export const load: PageServerLoad = async ({ locals }) => {
  // Check if the user is logged in and has preferences
  if (!locals.user || typeof locals.user.preferences === 'undefined') {
    console.log('User not logged in or no preferences found');
    return { props: { preferences: null } };
  } else {
    console.log('User preferences:', locals.user.preferences);
    return { preferences: JSON.stringify(locals.user.preferences), }
  }
};

let queryFilter;
let likeQueryFilter;

async function queryPromptsWithFilter(locals, queryFilter) {
  console.log('queryFilter:', queryFilter);
  return await locals.pb.collection('prompts').getList(1, 10, {
    page: 1,
    perPage: 10,
    filter: queryFilter,
    expand: 'author',
    fields: 'expand.author.username, expand.author.id, id, prompt',
    sort: '@random',
    skipTotal: true,
  });
}

async function queryLikedPrompts(locals, likeQueryFilter) {
  return await locals.pb.collection('pVotes').getList(1, 10, {
    page: 1,
    perPage: 10,
    filter: likeQueryFilter,
    expand: 'prompt.author', 
    fields: 'expand.prompt,expand.prompt.author.id,expand.prompt.author.username',
    sort: '@random',
    skipTotal: true,
  });
}

export const actions = {
  generate: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }

    const data = await request.formData();

    // console.log('formData:', data)

    const selectedCategories = data.getAll('categories') ?? [];
    const selectedFilter = data.get('selectedFilter');

    // console.log('selectedCategories:', selectedCategories)
  //  console.log('selectedFilter:', selectedFilter)
  
    let favAuthors = locals.user?.favAuthors ?? [];
    let hiddenAuthors = locals.user?.hiddenAuthors ?? [];
    let authorFilter = '';
    let categoriesFilter = '';
    let categoriesString = '';

    let hiddenPrompts = locals.user?.hiddenPrompts ?? [];
  
    if (hiddenAuthors.length === 0) {
      hiddenAuthors = ['FakePlaceholderUsername'];
    }
    if (hiddenPrompts.length === 0) {
      hiddenPrompts = ['FakePlaceholderPromptID'];
    }

  let prompts;
  
  try {
    switch (selectedFilter) {
      case 'favAuthors':
        categoriesString = selectedCategories.toString().replace(/,/g, '"||categories~"');
        categoriesFilter = `categories~"${categoriesString}"`;

        if (favAuthors.length > 0) {
          authorFilter = `"${favAuthors.join(',')}"?~author`;
        } else {
          authorFilter = `"${hiddenAuthors.join(',')}"?!~author`;
        }
        break;
      case 'liked':
            categoriesString = selectedCategories.toString().replace(/,/g, '"||prompt.categories~"');
            categoriesFilter = `prompt.categories~"${categoriesString}"`;
        break;
      case 'superLiked':
            categoriesString = selectedCategories.toString().replace(/,/g, '"||prompt.categories~"');
            categoriesFilter = `prompt.categories~"${categoriesString}")&&(super=true`;
        break;
      default:
        categoriesString = selectedCategories.toString().replace(/,/g, '"||categories~"');
        categoriesFilter = `categories~"${categoriesString}"`;
        authorFilter = `"${hiddenAuthors}"?!~author`;
        break;
    }

    queryFilter = `(${categoriesFilter})&&(${authorFilter})&&("${hiddenPrompts.join(',')}"?!~id)`;
    likeQueryFilter = `(${categoriesFilter})`

    if (selectedFilter === 'favAuthors' || selectedFilter === 'all') {
      prompts = await queryPromptsWithFilter(locals, queryFilter);
    } else {
      prompts = await queryLikedPrompts(locals, likeQueryFilter);
    } 

//    console.log('RawPrompts:', prompts);

    const promptsData = await Promise.all(prompts.items.map(async (promptItem) => {
  //    console.log('Current Prompt:', promptItem);


      const promptDetails = promptItem.expand.prompt;
      const pAuthor = promptItem.expand?.author || promptDetails.expand?.author || null;
      const isFavAuthor = locals.user?.favAuthors?.includes(pAuthor?.id) || false;

  //    console.log('promptDetails:', promptDetails)
 //     console.log('pAuthor:', pAuthor)
 //     console.log('isFavAuthor:', isFavAuthor)

      return {
      //  ...prompt,
        liked: promptItem.hasOwnProperty('super') ? true : false, // Assuming default liked status
        superLiked: promptItem.hasOwnProperty('super') ? promptItem.super : false, // Assuming default superLiked status
        id: promptItem.id || promptItem.expand.prompt.id,
        prompt: promptDetails?.prompt || promptItem.prompt || null, 
        author: pAuthor?.username || 'Unknown', // Safe access with default value
        authorId: pAuthor?.id || 'Unknown', // Safe access with default value
        isFavAuthor,
        score: 1, // Assuming default score
        cCount: 0, // Assuming default comment count
      };
    }));

 //   console.log('Processed Prompts Data:', promptsData);

    return {
      records: JSON.stringify(promptsData),
    };
  } catch (err) {
    console.error('Error in generate function:', err);
    throw error(500, "The robots didn't like something about that...");
  }
},

  promptStatus: async ({ request, locals }) => {
    try {
      // Extract the promptId from the request
      const data = await request.formData();
      const promptId = data.get('promptId');
  
      let scoreData, commentCount, likeStatus;
  
      try {
        scoreData = await locals.pb.collection('pScore')
          .getFirstListItem(`id="${promptId}"`);
      } catch (err) {
        scoreData = { score: 1 };
      }
  
      try {
        commentCount = await locals.pb.collection('cCount')
          .getFirstListItem(`id="${promptId}"`);
      } catch (err) {
        commentCount = { cCount: 0 };
      }
  
      try {
        likeStatus = await locals.pb.collection('pVotes')
          .getFirstListItem(`prompt="${promptId}"&&by="${locals.user?.id}"`);
      } catch (err) {
        likeStatus = null;
      }

      // console.log('likes:', likeStatus, 'comments:', commentCount, 'score:', scoreData)
  
      const promptAdditionalDetails = {
        liked: !!likeStatus,
        superLiked: !!likeStatus && likeStatus.super,
        score: scoreData.score,
        cCount: commentCount.cCount,
      };
  
      return {
        details: JSON.stringify(promptAdditionalDetails),
      };
  
    } catch (err) {
      console.error('Error in promptStatus function:', err);
      throw error(500, "There was an error processing the prompt details.");
    }
  },
  
  saveSettings: async ({ request, locals }) => {
    if (request.method !== 'POST') {
      console.log('Error: Non-POST');
      throw error(400, "The robots didn't like something about that...");
    }
  
    const data = await request.formData();       
    console.log('data:', data)

   // Retrieve 'preferences' from FormData and ensure it's a string before parsing
   const preferencesString = data.get('preferences');
   let preferences;
   if (typeof preferencesString === 'string') {
       preferences = JSON.parse(preferencesString);
   } else {
       // Handle the case where preferencesString is not a string
       console.error("Preferences data is not a string");
       throw error(400, "Invalid preferences data");
   }
   console.log('preferences:', preferences);

    const user = locals.user?.id || '';
  
    const settings = { 
      preferences: preferences,    
    };

    console.log('settings:', settings)
  
    try {
      const record = await locals.pb.collection('users').update(user, settings);
    } catch (err) {
      console.log('Error: ', err);
      throw error(500, "Failed to save settings. Try again?");
    }
  },

  loadSettings: async ({ locals }) => {
    if (!locals.user) {
      console.log('Error: User not logged in');
      throw error(401, "User not logged in");
    }

    try {
      const { preferences } = locals.user.preferences;
      console.log('preferences:', preferences)
      return {
        body: JSON.stringify({ preferences })
      };
    } catch (err) {
      console.log('Error loading settings:', err);
      throw error(500, "Failed to load settings");
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