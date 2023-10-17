<script>
  import Header from '$lib/components/header.svelte'
  import Body from '$lib/components/body.svelte'
  import About from '$lib/components/about.svelte'
  import Footer from '$lib/components/footer.svelte'
  import Game from '$lib/components/game.svelte'
</script>


<div class="bg_gradient">
<Header />
</div>
<Body />
<div id="game">
<Game />
</div>
<About />
<div class="bg_gradient">
<Footer />
</div>

<style>

</style>