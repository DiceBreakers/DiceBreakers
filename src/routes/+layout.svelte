<script lang="ts">
    import Menu from '$lib/components/menu.svelte';
    import '../app.postcss';
    import Analytics from '$lib/components/analytics.svelte'
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
      storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
          
    let showMenu = false;

    import { onMount } from 'svelte';
    import { pb, updateCurrentUser } from '$lib/stores/pocketbase';

    onMount(() => {
// On the client-side, once the module is loaded, you can check and update the current user
    if (pb.authStore.isValid) {
      updateCurrentUser();
      }
    });
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