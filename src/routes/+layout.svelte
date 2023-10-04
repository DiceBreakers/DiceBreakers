<script lang="ts">
    import Menu from '$lib/menu.svelte';
    import '../app.postcss'
    
    let showMenu = false;
</script>

<Menu {showMenu}/>
<div>
  <slot />
</div>

<style>

</style>