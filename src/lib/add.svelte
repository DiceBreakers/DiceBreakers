<script>
    import '../app.postcss'
	import { enhance } from '$app/forms';

	const catList = [
		{
			value: 'closeFriends',
			label: 'Close Friends',
		},
		{
			value: 'newFriends',
			label: 'New Friends',
		},
		{
			value: 'dateNight',
			label: 'Date Night',
		},
		{
			value: 'happy',
			label: 'Happy',
		},
		{
			value: 'heavy',
			label: 'Heavy',
		},
		{
			value: 'kids',
			label: 'Kids',
		},
		{
			value: 'music',
			label: 'Music',
		},
		{
			value: 'movies',
			label: 'Movies',
		},
		{
			value: 'journal',
			label: 'Journal',
		},
		{
			value: 'politics',
			label: 'Politics',
		},
		{
			value: 'silly',
			label: 'Silly',
		},
		{
			value: 'philosophy',
			label: 'Philosophy',
		},
		{
			value: 'mature',
			label: 'Mature',
		},
		{
			value: 'fortune',
			label: 'Fortune Teller',
		},
		{
			value: 'activities',
			label: 'Activies',
		},
		{
			value: 'wyr',
			label: 'Would You Rather',
		},
	]

</script>

		<div class="card p-4">
			<div class="card p-4 variant-glass-secondary">
			<form action="?/create" method="POST"
			enctype="multipart/form-data"
			use:enhance
			>
				<label class="label">
					<div class="body margin"><h1>Add a Prompt:</h1></div>
					<textarea name="prompt" class="textarea" rows="2" placeholder="Enter Prompt" />
				</label>
				<label class="label">
					<div class="body"><h2>Check Applicable Categories:</h2></div>
				<ul class="columns">
					{#each catList as catItem}
					<li><label class="flex"><input name="categories" class="checkbox" type="checkbox" value={catItem.value}/>{catItem.label}</label></li>
					{/each}
					</ul>
				</label>
				<div class="text-center">
				<button class="btn variant-filled-primary">Submit</button>
				</div>
			</form>
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