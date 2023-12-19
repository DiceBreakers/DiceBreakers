<script lang="ts">
    import { onMount } from 'svelte';
    import { pb, updateCurrentUser } from '$lib/stores/pocketbase';
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import Menu from '$lib/components/menu.svelte';
    import '../app.postcss';
    import Analytics from '$lib/components/analytics.svelte'
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
      storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    $: if (browser) { 
      document.title = `Conversation Starters for Everyone - DiceBreakers.app${$page.url.pathname}`;
    }

    onMount(() => {
      if (pb.authStore.isValid) {
      //  console.log('preUpdate:', currentUser);
        updateCurrentUser();
     //   console.log('postUpdate:', currentUser);
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