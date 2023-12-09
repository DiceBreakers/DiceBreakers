<script lang="ts">
  import type { PageData } from './$types';
  import Header from '$lib/components/header.svelte'
  import Footer from '$lib/components/footer.svelte'
  import Game from './game.svelte'

  export let data: PageData;

  console.log('Preferences in +page.svelte:', data);

</script>


<div class="bg_gradient">
  <Header />
</div>

<div class="bg_gradient">
  <Game { data } />
</div>

<div class="bg_gradient_footer">
  <Footer />
</div>
