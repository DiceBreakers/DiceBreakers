<script>
  import Header from '$lib/components/header.svelte'
  import Login from '$lib/components/login.svelte'
  import Footer from '$lib/components/footer.svelte'
  import Menu from '$lib/components/menu.svelte';

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