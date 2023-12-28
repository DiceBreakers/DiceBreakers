<script lang="ts">
  import Header from '$lib/components/header.svelte'
  import CharityGuide from './CharityGuide.svelte';
  import Footer from '$lib/components/footer.svelte'
  import type { PageData } from './$types';
	
//	export let data: PageData;
</script>

<div class="bg_gradient">
	<Header />
</div>

<div class="bg_gradient">
  <CharityGuide />
</div>

<div class="bg_gradient_footer">
  <Footer />
</div>
