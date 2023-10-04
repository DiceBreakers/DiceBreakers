import { error, redirect } from '@sveltejs/kit'

export const load = ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}
};

export const actions = {
  updateProfile: async ({ request, locals }) => {
    let data = await request.formData()

    try {
      const { name } = await locals.pb.collection('users').update(locals?.user?.id, data);
	  if (locals.user?.name !== null) {
		locals.user.name = name;
	  }
	} catch (err) {
      console.log('Error: ', err);

      throw error(400, 'Something went wrong updating your profile');
      }

      return {
        success: true
      };
    },

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
              .update(locals.user.id, { username: data.username });
            locals.user.username = username;
            return {
              success: true
            };
          } catch (err) {
            console.log('Error: ', err);
            throw error(400, "That username might already exist, or it has some characters that aren't allowed. Or maybe something else went wrong, I'm a noob");
          }
        }
        console.log('Error: ', err);
        throw error(400, "Something broke! It might be a server error. Try again later and email me it it doesn't work");
      }
    }
  };
