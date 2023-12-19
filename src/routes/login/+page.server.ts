import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import crypto from 'crypto'
import { SECRET_SIGNATURE } from '$env/static/private'

export async function load({locals,url,cookies}){

  // console.log('URL Origin: ', url.origin)
  // console.log('cookies: ', cookies)
  // console.log('locals: ', locals)

  return{}
}

export const actions: Actions = {
  login: async ({ locals, request }) => {
    const data = Object.fromEntries(await request.formData()) as {
      email: string
      password: string
    }

    try {
      const password = data.password || '';

      const hash = crypto.createHash('sha256');
      hash.update(password);
      hash.update(SECRET_SIGNATURE);
      const hashedPassword = hash.digest('hex');
      
      data.password = hashedPassword;

      const result = await locals.pb.collection('users').authWithPassword(data.email, data.password)
      console.log('Login result', result);
    } catch (e) {
      console.error(e)
      throw e
    }

    throw redirect(303, '/')
  },
  OAuth2: async({cookies,url,locals})=>{

    const authMethods = await locals.pb?.collection('users').listAuthMethods();
    console.log("authmethods", authMethods);
    if (!authMethods) {
        return {
            authProviderRedirect: '',
            authProviderState: ''
        };
    }
    const redirectURL = `${url.origin}/oauth`;
    const googleAuthProvider = authMethods.authProviders[0];
    const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`;
    const state = googleAuthProvider.state;
    const verifier = googleAuthProvider.codeVerifier

    cookies.set('state',state);
    cookies.set('verifier',verifier);
    // console.log('cookieState:', state)
    // console.log('cookieVerifier:', verifier)

    throw redirect(302,authProviderRedirect)


},

}