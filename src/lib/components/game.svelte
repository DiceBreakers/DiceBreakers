<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { quintOut } from 'svelte/easing';
	import { slide, fade } from 'svelte/transition';
	import DicePortal from './dicePortal.svelte';
	import { catList } from './catList.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';

	const Hover: PopupSettings = {
	event: 'hover',
	target: 'popupHover',
	placement: 'top'
};

    let rollDice = false;

	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	  tooltip: string;
	};
	
	let selectedCategories = writable<CatItem[]>([]);
	let primaryCategories = writable<CatItem[]>([]);
	let additionalCategories = writable<CatItem[]>([]);
	let currentPrompt = "";
	let currentAuthor = "";
	let promptIndex = 0;
	let generatedPrompts: { prompt: string; author: string }[] = [];
	let animationPlayed = false;
	
	onMount(() => {
        catList.subscribe((list: CatItem[]) => {
            selectedCategories.set(list);
            const categories = list;
            primaryCategories.set(categories.slice(0, 6)); // Adjust the number as needed
            additionalCategories.set(categories.slice(6));
        });
    });

	function toggleDice() {
    rollDice = !rollDice;
    if (!animationPlayed) {
      animationPlayed = true; // Set animationPlayed to true when the animation is triggered
    }
    setTimeout(() => {
      rollDice = false;
    }, 4000);
  }

	
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
    const response = await fetch('?/generate', {
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
		<svelte:fragment slot="summary">Settings:</svelte:fragment>
		<svelte:fragment slot="content">
			<Accordion autocollapse>
				<AccordionItem open>
					<svelte:fragment slot="summary">Primary Categories:</svelte:fragment>
					<svelte:fragment slot="content">
			<label class="label">
				<div class="categories-grid">
					{#each $primaryCategories as catItem, i}
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
			</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">Oddly Specific Categories:</svelte:fragment>
				<svelte:fragment slot="content">
				<label class="label">
					<div class="categories-grid">
						{#each $additionalCategories as catItem, i}
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
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</svelte:fragment>
	  </AccordionItem>
	  <AccordionItem on:toggle={generate}>
		<svelte:fragment slot="lead"><img src="favicon.png" alt="Dice Icon" width="21px" /></svelte:fragment>
		<svelte:fragment slot="summary">Play</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="game"
			in:fade={{ delay: 1000, duration: 100 }}>
			{#if rollDice}
				<DicePortal />
			{/if}
			{#key promptIndex}
			<div class="prompts text-center"
			in:slide={{ delay: 3600, duration: 1000, easing: quintOut, axis: 'x' }}
			out:slide={{ duration: 500, easing: quintOut, axis: 'x' }}>
				<div id="prompt">{currentPrompt}</div>
				{#if animationPlayed}
				<button class="btn variant-filled-primary margin" on:click={displayNextPrompt}>Roll the Dice</button>
				{/if}
				<div class="right">{currentAuthor}</div>
	  		</div>
			{/key}
			</div>
		  </svelte:fragment>
	  </AccordionItem>
	</Accordion>

  </div>
  
			
			
<style>
		
	.margin {
		margin:2em;
	}

	.right {
		text-align: right;
	}

	.game {
		position: relative;
		display: flex;
    	justify-content: center; /* Center horizontally */
		align-items: center; /* Center vertically */
  		height: 40vh;
	}

</style>