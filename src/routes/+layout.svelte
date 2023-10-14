<script lang="ts">
    import Menu from '$lib/menu.svelte';
    import '../app.postcss'
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
      storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    
    let showMenu = false;
</script>

<div class="bg">
<Menu {showMenu}/>
<div>
  <slot />
</div>
</div>

<style>

</style>