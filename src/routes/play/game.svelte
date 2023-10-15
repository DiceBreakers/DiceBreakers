<script lang="ts">
	import { catList } from '../../lib/components/catList.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import DicePortal from '$lib/components/dicePortal.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';

	const Hover: PopupSettings = {
	event: 'hover',
	target: 'popupHover',
	placement: 'top'
};

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
	  tooltip: string;
	};
	
	let selectedCategories = writable<CatItem[]>([]);
	let currentPrompt = "";
	let currentAuthor = "";
	let promptIndex = 0;
	let generatedPrompts: { prompt: string; author: string }[] = [];
	
	onMount(() => {
			toggleDice();
	  catList.subscribe((list: CatItem[]) => {
		selectedCategories.set(list);
	  });
	});
	
	async function generate(event: Event) {
  		event.preventDefault();
		toggleDice();

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
  displayFirstPrompt();

    } else {
      console.error('Failed to generate prompts.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function displayFirstPrompt() {
  if (promptIndex < generatedPrompts.length) {
	const { prompt, author } = generatedPrompts[promptIndex];
		currentPrompt = prompt;
		currentAuthor = "Author: " + author; // Assuming you have a variable for displaying the author
    promptIndex++;
  } else {
    currentPrompt = '';
	currentAuthor = ''; // Optional message when there are no more prompts
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
    currentPrompt = '';
	currentAuthor = ''; // Optional message when there are no more prompts
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
					{#each $selectedCategories as catItem, i}
					<label class="category-item">
					  <input name='categories' bind:checked={catItem.checked}
					   class="checkbox checkboxSize" type="checkbox" value={catItem.value} title={catItem.tooltip}>
					  <span class="checkboxSM">{catItem.label}
					  <div class="fa-solid fa-circle-info"
						use:popup={{ event: 'hover', target: 'loopExample-' + i,
						placement: 'top' }}></div></span>
						<div class="popup" data-popup="loopExample-{i}">{catItem.tooltip}</div>
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
			in:slide={{ delay: 3600, duration: 1000, easing: quintOut, axis: 'x' }}
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