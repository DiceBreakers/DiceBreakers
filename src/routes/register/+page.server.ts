import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { SECRET_SIGNATURE } from '$env/static/private'
import crypto from 'crypto'

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const data = Object.fromEntries(await request.formData()) as {
      email: string
      password: string
      passwordConfirm: string
      TOS: string;
    };

    if (!data.TOS) {
      return;
    }

    try {
      // Get the password from the form data
      const password = data.password || '';
      
      // Hash the password using SHA-256 and the environment secret
      const hash = crypto.createHash('sha256');
      hash.update(password);
      hash.update(SECRET_SIGNATURE);
      const hashedPassword = hash.digest('hex');
      
      // Set the hashed password for data
      data.password = hashedPassword;
      data.passwordConfirm = hashedPassword;

      // Create the user with the hashed password
      const result = await locals.pb.collection('users').create(data);
      console.log('result', result);

      // Continue with the rest of your registration process
      await locals.pb.collection('users').authWithPassword(data.email, data.password);
      await locals.pb.collection('users').requestVerification(data.email);
    } catch (e) {
      console.error(e);
      throw e;
    }

    throw redirect(303, '/');
  },
}
