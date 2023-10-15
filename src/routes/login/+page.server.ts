import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import crypto from 'crypto'
import { SECRET_SIGNATURE } from '$env/static/private'

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const data = Object.fromEntries(await request.formData()) as {
      email: string
      password: string
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

      const result= await locals.pb.collection('users').authWithPassword(data.email, data.password)
      console.log('result', result);
    } catch (e) {
      console.error(e)
      throw e
    }

    throw redirect(303, '/play')
  },
}