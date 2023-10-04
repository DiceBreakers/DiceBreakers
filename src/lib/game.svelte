<script>
    import '../app.postcss'
	import { catList } from './components/catList.svelte';

</script>

		<div class="card p-4">
			<div class="card p-4 variant-glass-secondary">
			<form action="?/create" method="POST"
			>
				<label class="label">
					<div class="body"><h2>Select Categories:</h2></div>
				<ul class="columns">
					{#each catList as catItem}
					<li><label class="flex"><input name="categories" class="checkbox" type="checkbox" value={catItem.value}/>{catItem.label}</label></li>
					{/each}
					</ul>
				</label>
			</form>
			</div>
			<div class="text-center">
				<button class="btn variant-filled-primary">Roll the Dice</button>
			</div>
		</div>
			
			
<style>
    .card {
        padding: 1rem;
    }

	.margin {
		padding: 15px;
	}

	.body h2 {
		font-size: large;
	}

	ul.columns  { 
 		margin: 0; 
  		padding: 0; 
  		margin-left: 10px; 
  		list-style: none; 
	} 

	ul.columns li input { 
  		margin-right: .25em; 
	} 

	ul.columns li { 
		display:inline-block;
		width:10em;
	} 

</style>