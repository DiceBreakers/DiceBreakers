<script lang="ts">
	import '../app.postcss';
	import { catList } from './components/catList.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	
	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	};
	
	let selectedCategories = writable<CatItem[]>([]);
	let currentPrompt = "";
	let currentAuthor = "";
	let promptIndex = 0;
	let generatedPrompts: { prompt: string; author: string }[] = [];
	
	onMount(() => {
	  catList.subscribe((list: CatItem[]) => {
		selectedCategories.set(list);
	  });
	});
	
	async function generate(event: Event) {
  event.preventDefault();

  const formData = new FormData();

  selectedCategories.subscribe((list: CatItem[]) => {
    list.forEach(catItem => {
      if (catItem.checked) {
        formData.append('categories', catItem.value);
      }
    });
  });

  try {
    const response = await fetch('/play?/generate', {
      method: 'POST',
      body: formData,
    });

	if (response.ok) {
  const serverData = await response.json();
  const rawData = JSON.parse(serverData.data);

  // The prompt data is inside the array, so let's access it directly
  const promptData = JSON.parse(rawData[1]);

  generatedPrompts = promptData.map(obj => ({
    prompt: obj.prompt,
    author: obj.author,
  }));


      // Display the first prompt when generated
      displayNextPrompt();
    } else {
      console.error('Failed to generate prompts.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

	
function displayNextPrompt() {
  if (promptIndex < generatedPrompts.length) {
    const { prompt, author} = generatedPrompts[promptIndex];
    currentPrompt = prompt;
    currentAuthor = author; // Assuming you have a variable for displaying the author
    promptIndex++;
  } else {
    currentPrompt = "No more prompts"; // Optional message when there are no more prompts
  }
}
  </script>
  
  <div class="card p-4">
	<Accordion autocollapse>
	  <AccordionItem open>
		<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
		<svelte:fragment slot="summary">Game Settings</svelte:fragment>
		<svelte:fragment slot="content">
		  <form on:submit={generate}>
			<label class="label">
			  <div class="body"><h2>Pick your categories:</h2></div>
			  <ul class="columns">
				{#each $selectedCategories as catItem, index}
				<li>
				  <label class="flex">
					<input
					  id={catItem.label}
					  class="checkbox"
					  type="checkbox"
					  bind:checked={catItem.checked}
					  value={catItem.value}
					/>
					{catItem.label}
				  </label>
				</li>
				{/each}
			  </ul>
			</label>
			<div class="text-center">
			  <button type="submit" class="btn variant-filled-primary">Generate</button>
			</div>
		  </form>
		</svelte:fragment>
	  </AccordionItem>
	  <AccordionItem>
		<svelte:fragment slot="lead"><img src="favicon.png" alt="Dice Icon" width="21px" /></svelte:fragment>
		<svelte:fragment slot="summary">Play</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="text-center">
				<ul>
				  <li>{currentPrompt}</li>
				  <li>Author: {currentAuthor}</li>
				</ul>
				<button class="btn variant-filled-primary" on:click={displayNextPrompt}>Roll the Dice</button>
			  </div>
			  
		</svelte:fragment>
	  </AccordionItem>
	</Accordion>
  </div>
  
			
			
<style>
    .card {
        padding: 1rem;
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