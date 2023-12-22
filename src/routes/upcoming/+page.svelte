<script lang="ts">
  import Header from '$lib/components/header.svelte'
  import Changes from './changes.svelte';
  import Footer from '$lib/components/footer.svelte'
  import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<div class="bg_gradient">
	<Header />
</div>

<div class="bg_gradient">
  <Changes {data} />
</div>

<div class="bg_gradient_footer">
  <Footer />
</div>
