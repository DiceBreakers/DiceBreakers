<script>
  import Header from '$lib/header.svelte'
  import Login from '$lib/login.svelte'
  import Footer from '$lib/footer.svelte'
  import Menu from '$lib/menu.svelte';

</script>

<Menu showMenu />
<div class="bg_gradient">
	<Header />
</div>
<div class="body card p-4 variant-glass-secondary">
  <Login />
</div>
<div class="bg_gradient">
	<Footer />
</div>

<style>

</style>