<script lang="ts">
	import '../app.postcss';
	import { catList } from './components/catList.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import DicePortal from '$lib/components/dicePortal.svelte';

    let rollDice = true;

    function toggleDice() {
        rollDice = !rollDice;
        setTimeout(() => {
            rollDice = false;
        }, 4000); // Set rollDice back to false after 4000 milliseconds (4 seconds)
    }


	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	};
	
	let selectedCategories = writable<CatItem[]>([]);
	let currentPrompt = "";
	let currentAuthor = "";
	let promptIndex = 1;
	let generatedPrompts: { prompt: string; author: string }[] = [];
	
	onMount(() => {
			toggleDice();
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

    } else {
      console.error('Failed to generate prompts.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

	
function displayNextPrompt() {
	toggleDice();
  if (promptIndex < generatedPrompts.length) {
	const { prompt, author } = generatedPrompts[promptIndex];
		currentPrompt = prompt;
		currentAuthor = "Author: " + author; // Assuming you have a variable for displaying the author
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
		<svelte:fragment slot="summary">Categories</svelte:fragment>
		<svelte:fragment slot="content">
		  <form>
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
		  </form>
		</svelte:fragment>
	  </AccordionItem>
	  <AccordionItem on:toggle={generate}>
		<svelte:fragment slot="lead"><img src="favicon.png" alt="Dice Icon" width="21px" /></svelte:fragment>
		<svelte:fragment slot="summary">Play</svelte:fragment>
		<svelte:fragment slot="content">
			{#key promptIndex}
			<div class="text-center margin"
			in:slide={{ delay: 3750, duration: 1000, easing: quintOut, axis: 'x' }}
			out:slide={{ delay: 100, duration: 500, easing: quintOut, axis: 'x' }}>
				<div id="prompt">
				  {currentPrompt}</div>				
				<button class="btn variant-filled-primary margin" on:click={displayNextPrompt}>Roll the Dice</button>
				<div class="right">
				{currentAuthor}</div>
				</div>
			{/key}
		</svelte:fragment>
	  </AccordionItem>
	</Accordion>
	{#if rollDice}
		<DicePortal />
	{/if}
  </div>
  
			
			
<style>
		
	.margin {
		margin:2em;
	}

    .card {
        padding: 1rem;
    }

	.right {
		text-align: right;
	}

</style>