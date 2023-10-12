<script lang="ts">
	import '../app.postcss';
	import { catList } from './components/catList.svelte';
	import SuccessMessage from './components/successMessage.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
  
	// Define the type for catItem
	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	};
  
	let showSuccessMessage = false; // Declare the showSuccessMessage variable
	let promptText = '';
	let selectedCategories = writable<CatItem[]>([]); // Create a writable store for selected categories
  
	onMount(() => {
	  // Initialize selectedCategories when the component mounts
	  catList.subscribe((list: CatItem[]) => {
		selectedCategories.set(list);
	  });
	});
  
	async function handleSubmit(event: Event) {
	  event.preventDefault();
  
	  const formData = new FormData();
	  formData.append('prompt', promptText);
  
	  selectedCategories.subscribe((list: CatItem[]) => {
		list.forEach(catItem => {
		  if (catItem.checked) {
			formData.append('categories', catItem.value);
		  }
		});
	  });
  
	  try {
		const response = await fetch('/add?/create', {
		  method: 'POST',
		  body: formData,
		});
  
		if (response.ok) {
		  console.log('Prompt submitted successfully!');
		  showSuccessMessage = true;
  
		  // Reset the checkboxes using the catList store
		  selectedCategories.update(list => {
			return list.map(catItem => ({
			  ...catItem,
			  checked: false,
			}));
		  });
  
		  promptText = ''; // Reset the prompt text

		  setTimeout(() => {
			showSuccessMessage = false;
		  }, 1500);
		} else {
		  console.error('Failed to submit prompt.');
		}
	  } catch (error) {
		console.error('An error occurred:', error);
	  }
	}
  </script>
  
  {#if showSuccessMessage}
	<SuccessMessage />
  {/if}
  
  <section id="addPrompt">
	<div class="card p-4">
	  <div class="card p-4 variant-glass-secondary">
		<form on:submit={handleSubmit}>
		  <label class="label">
			<div class="body padding"><h1>Add a Prompt:</h1></div>
			<textarea name="prompt" bind:value={promptText} class="textarea" rows="2" placeholder="Enter Prompt" />
		  </label>
		  <label class="label">
			<div class="body"><h2>Check Applicable Categories:</h2></div>
			<div class="categories-grid">
			  {#each $selectedCategories as catItem}
			  <label class="category-item">
				<input name='categories' bind:checked={catItem.checked} class="checkbox" type="checkbox" value={catItem.value}/>
				{catItem.label}
			  </label>
			  {/each}
			</div>
		  </label>
		  <div class="text-center">
			<button class="btn variant-filled-primary margin" type="submit">Submit</button>
		  </div>
		</form>
	  </div>
	</div>
  </section>
  
  
			
<style>
    .card {
        padding: 1rem;
    }

	.padding {
		padding: 15px;
	}

	.margin {
		margin:2em;
	}

	.body h2 {
		font-size: large;
	}

</style>