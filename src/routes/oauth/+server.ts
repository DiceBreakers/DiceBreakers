import { createInstance } from '$lib/stores/pocketbase';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ locals, url, cookies }: {
    locals: any,
    url: URL,
    cookies: any
}) => {
    const pb = createInstance()

    // console.log('Server URL search params:', url.searchParams);
    const redirectURL: string = `${url.origin}/oauth`;
    const expectedState: string | null = cookies.get('state');
    const expectedVerifier: string | null = cookies.get('verifier');
    const state: string | null = url.searchParams.get('state');
    const code: string | null = url.searchParams.get('code');

    // Log all relevant details for troubleshooting
    // console.log('cookies:', cookies.getAll());
    // console.log('expectedState', expectedState);
    // console.log('expectedVerifier', expectedVerifier);
    // console.log('returned state', state);
    // console.log('returned code', code);

    const authMethods = await locals.pb?.collection('users').listAuthMethods();
    if (!authMethods?.authProviders) {
        console.log('No Auth Providers');
        throw redirect(303, '/register');
    }

    const provider = authMethods.authProviders.find(p => p.name === 'google');
    if (!provider) {
        console.log('Google Provider Not Found');
        throw redirect(303, '/register');
    }

    if (expectedState !== state) {
        console.log('Returned State Does not Match Expected', expectedState, state);
        throw redirect(303, '/login');
    }

    if (code) {
        try {
            const authData = await locals.pb?.collection('users')
                .authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL, { username: '' });
            
                if (authData) {
                    // console.log('OAuth2 login successful:', authData)
                  
                    cookies.set('pb_auth', pb.authStore.exportToCookie({ httpOnly: true }));
                  
                    return new Response(null, {
                      status: 303,
                      headers: {
                        'Location': '/',
                      },
                    });
                  }
            // If authData is not received, you might want to throw an error or redirect
            throw new Error('Authentication data not received.');
        } catch (err) {
            console.log('Error logging in with OAuth2 user', err);
            throw redirect(303, '/login'); // Redirect to an error page on exception
        }
    } else {
        console.log('OAuth2 code not provided in URL parameters.');
        throw redirect(303, '/login'); // Redirect back to login if the code parameter is missing
    }
    // If no other action is taken, redirect to home as a fallback (though this should not be reached)
    throw redirect(303, '/');
};
