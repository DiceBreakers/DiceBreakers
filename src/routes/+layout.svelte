<script lang="ts">
  import { onMount } from 'svelte';
  import { pb, updateCurrentUser } from '$lib/stores/pocketbase';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import Menu from '$lib/components/menu.svelte';
  import '../app.postcss';
  import { currentUser } from '$lib/stores/user';
  import { authorFavorites } from '$lib/stores/authors';
  import Analytics from '$lib/components/analytics.svelte'
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from '@skeletonlabs/skeleton';
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  $: if (browser) { 
    document.title = `Conversation Starters for Everyone - DiceBreakers.app${$page.url.pathname}`;
  }

  function convertToFavoritesObject(favAuthorsArray) {
    const favoritesObject = {};
    favAuthorsArray.forEach(authorId => {
        favoritesObject[authorId] = true;
    });
    return favoritesObject;
}


  onMount(async () => {
    if (pb.authStore.isValid) {
      updateCurrentUser();
    }
    if ($currentUser && $currentUser.favAuthors) {
        const favoritesObject = convertToFavoritesObject($currentUser.favAuthors);
        authorFavorites.setFavorites(favoritesObject);
    }
  });

  let showMenu = false;
</script>

<Analytics />
<div class="bg">
<Menu {showMenu}/>
<div>
  <slot />
</div>
</div>

<style>

</style>
