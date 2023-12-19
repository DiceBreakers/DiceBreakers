<script>
  import { pb, updateCurrentUser } from '$lib/stores/pocketbase';
  import { onMount } from 'svelte';
  import Header from '$lib/components/header.svelte'
  import AddPrompt from './add.svelte';
  import Footer from '$lib/components/footer.svelte'

</script>


<div class="bg_gradient">
	<Header />
</div>

<div class="bg_gradient">
  <AddPrompt />
</div>

<div class="bg_gradient_footer">
	<Footer />
</div>