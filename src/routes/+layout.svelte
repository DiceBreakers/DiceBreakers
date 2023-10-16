<script lang="ts">
    import Menu from '$lib/components/menu.svelte';
    import '../app.postcss';
    import Analytics from '$lib/components/analytics.svelte'
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
      storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    
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