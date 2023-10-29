import { error } from '@sveltejs/kit'

export const actions = {

    updateEmail: async ({ request, locals }) => {
      const data = Object.fromEntries(await request.formData());
  
      try {
        await locals.pb.collection('users').requestEmailChange(data.email);
    } catch (err) {
        console.log('Error: ', err);
  
        throw error(400, 'Something went wrong updating your email');
        }
  
        return {
          success: true
        };
      },
    
    updateUsername: async ({ request, locals }) => {
      const data = Object.fromEntries(await request.formData());
  
      try {
        await locals.pb.collection('users').getFirstListItem(`username = "${data.username}"`);
      } catch (err) {
        if (err.status === 404) {
          try {
            const { username } = await locals.pb
              .collection('users')
              .update(locals.user?.id, { username: data.username });
              if (locals.user && locals.user.username !== null) {
                locals.user.username = username;
              }
            return {
              success: true
            };
          } catch (err) {
            console.log('Error: ', err);
            throw error(400, "That username might already exist, or it has some characters that aren't allowed. Try something else or reach out for some help.");
          }
        }
        console.log('Error: ', err);
        throw error(400, "Something broke! It might be a server error. Try again later and email me it it doesn't work");
      }
    }
  };
