import { createInstance } from '$lib/stores/pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // If locals.pb is already set, use that instance. Otherwise, create a new one.
  const pb = event.locals.pb || createInstance();

  // Load the auth store data from the request cookie string
  pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
  try {
    // Refresh auth store state if valid
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  } catch (_) {
    pb.authStore.clear();
  }

  event.locals.pb = pb;
  event.locals.user = pb.authStore.model;

  const response = await resolve(event);

  // Only set the cookie if there's a change in authentication state
  if (event.locals.user !== pb.authStore.model) {
    response.headers.append(
      'set-cookie',
      pb.authStore.exportToCookie({ httpOnly: false })
    );
  }

  return response;
};
