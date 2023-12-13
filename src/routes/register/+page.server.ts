import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { SECRET_SIGNATURE } from '$env/static/private'
import crypto from 'crypto'

export const actions: Actions = {
  register: async ({ locals, request }) => {
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
      const password = data.password || '';
      const hash = crypto.createHash('sha256');
      hash.update(password);
      hash.update(SECRET_SIGNATURE);
      const hashedPassword = hash.digest('hex');
      
      data.password = hashedPassword;
      data.passwordConfirm = hashedPassword;

      const result = await locals.pb.collection('users').create(data);
      console.log('result', result);

      await locals.pb.collection('users').authWithPassword(data.email, data.password);
      await locals.pb.collection('users').requestVerification(data.email);
    } catch (e) {
      console.error(e);
      throw e;
    }

    throw redirect(303, '/');
  },
}
