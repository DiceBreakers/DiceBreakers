<script lang="ts">
    import Menu from '$lib/menu.svelte';
    import '../app.postcss'
    
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