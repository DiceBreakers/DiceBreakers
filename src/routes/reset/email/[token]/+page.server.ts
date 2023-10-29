
import type { Actions, Load } from '@sveltejs/kit';
import crypto from 'crypto';
import { SECRET_SIGNATURE } from '$env/static/private';
import { error } from '@sveltejs/kit';

export const load: Load = async (context) => {
  // Extract the token from the URL
  const { params } = context;

  // You can use this 'params.token' in your page component or template, but no further actions are performed.
  
  return {
    props: {
      token: params.token
    }
  };
};

export const actions: Actions = {
  confirmEmail: async ({ request, locals, params }) => {
    const data = Object.fromEntries(await request.formData()) as {
      token: string;
      password: string;
    };

    try {
      // Get the password from the form data
      const password = data.password || '';
      const token = params.token || '';     

      // Hash the password using SHA-256 and the environment secret
      const hash = crypto.createHash('sha256');
      hash.update(password);
      hash.update(SECRET_SIGNATURE);
      const hashedPassword = hash.digest('hex');

      // Set the data
      data.token = token;
      data.password = hashedPassword;
      
      await locals.pb.collection('users').confirmEmailChange(
        data.token,
        data.password,
      );

      return {
        success: true
      };
    } catch (err) {
      console.error('Error:', err);
      throw error(500, 'Something went wrong');
    }
  }
};

