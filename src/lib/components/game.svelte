<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount, createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import DicePortal from './dicePortal.svelte';
	import { catList } from './catList.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import ServerMessage from '$lib/components/serverMessage.svelte';

	let showSuccessMessage = false;
	let showFailureMessage = false;

	const Hover: PopupSettings = {
	event: 'hover',
	target: 'popupHover',
	placement: 'top'
};

	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	  tooltip: string;
	};
	
	let selectedCategories = writable<CatItem[]>([]);
	let primaryCategories = writable<CatItem[]>([]);
	let additionalCategories = writable<CatItem[]>([]);
	let currentPrompt = '';
	let currentAuthor = '';
	let currentId = '';
	let currentFav = false;
	let promptIndex = 0;
	let generatedPrompts: { prompt: string; author: string; id: string; isFav: boolean; }[] = [];
	let isRolling = false;
	
	onMount(() => {
        catList.subscribe((list: CatItem[]) => {
            selectedCategories.set(list);
            const categories = list;
            primaryCategories.set(categories.slice(0, 6));
            additionalCategories.set(categories.slice(6));
        });
    });

	function toggleDice() {
    isRolling = true;
    setTimeout(() => {
      isRolling = false;
    }, 3800);
  }

  	function resetAnimation() {
		currentPrompt = '';
		currentAuthor = '';
		currentId = '',
		promptIndex = 0;
		currentFav = false;
	}

	function displayFirstPrompt() {
  if (promptIndex < generatedPrompts.length) {
	const { prompt, author, id } = generatedPrompts[promptIndex];
		currentPrompt = prompt;
		currentAuthor = author;
		currentId = id;
		const currentPromptIndex = generatedPrompts.findIndex(prompt => prompt.id === currentId);
    	currentFav = currentPromptIndex >= 0 && generatedPrompts[currentPromptIndex].isFav;
    promptIndex++;
  } else {
    currentPrompt = '';
	currentAuthor = 'Check the categories to roll new prompts!';
  }
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
  const promptData = JSON.parse(rawData[1]);

  generatedPrompts = promptData.map(obj => ({
    prompt: obj.prompt,
    author: obj.author,
	id: obj.id,
	isFav: obj.isFavAuthor,
  }));
  displayFirstPrompt();

    } else {
      console.error('Failed to generate prompts.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function displayNextPrompt() {
	toggleDice();
	displayFirstPrompt();
}

async function favToggle(event: Event) {
	currentFav = !currentFav;
    if (!currentId) return;

	const promptIndex = generatedPrompts.findIndex(prompt => prompt.id === currentId);
  		if (promptIndex >= 0) {
    		generatedPrompts[promptIndex].isFav = currentFav;
 		}

    const formData = new FormData();
    formData.append('id', currentId);

    try {
        const response = await fetch('?/favAuthor', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Favorite Toggled Successfully');
            showSuccessMessage = true;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 1500);
        } else {
            console.error('Something broke :-(');
            showFailureMessage = true;
            setTimeout(() => {
                showFailureMessage = false;
            }, 1500);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        showFailureMessage = true;
        setTimeout(() => {
            showFailureMessage = false;
        }, 1500);
    }
}

const bulbs = ['bulb0.png', 'bulb1.png', 'bulb2.png'];

let bulbIndex = 0;

const dispatch = createEventDispatcher();

const nextBulb = () => {
	bulbIndex = (bulbIndex + 1) % bulbs.length;
	dispatch('bulbChanged', bulbs[bulbIndex]);
};


</script>
  
  <div class="card p-4">
	<Accordion autocollapse>
	  <AccordionItem open on:click={resetAnimation}> 
		<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
		<svelte:fragment slot="summary">Settings:</svelte:fragment>
		<svelte:fragment slot="content">
			<Accordion>
				<AccordionItem open on:click={resetAnimation}>
					<svelte:fragment slot="summary">Primary Categories:</svelte:fragment>
					<svelte:fragment slot="content">
			<label class="label">
				<div class="categories-grid">
					{#each $primaryCategories as catItem}
					<label class="category-item">
					  <input name='categories' bind:checked={catItem.checked}
					   class="checkbox checkboxSize" type="checkbox" value={catItem.value} title={catItem.tooltip}>
					  <span class="checkboxSM">{catItem.label}
						<div class="fa-solid fa-circle-info"
						use:popup={{ event: 'hover', target: 'loopExample-' + catItem.value,
						placement: 'top' }}></div></span>
						<div class="popup" data-popup="loopExample-{catItem.value}">{catItem.tooltip}</div>
					</label>
					{/each}
				</div>
			  </label>
			</svelte:fragment>
			</AccordionItem>
			<AccordionItem on:click={resetAnimation}>
				<svelte:fragment slot="summary">Oddly Specific Categories:</svelte:fragment>
				<svelte:fragment slot="content">
				<label class="label">
					<div class="categories-grid">
						{#each $additionalCategories as catItem}
						<label class="category-item">
						  <input name='categories' bind:checked={catItem.checked}
						   class="checkbox checkboxSize" type="checkbox" value={catItem.value} title={catItem.tooltip}>
						  <span class="checkboxSM">{catItem.label}
							<div class="fa-solid fa-circle-info"
							use:popup={{ event: 'hover', target: 'loopExample-' + catItem.value,
							placement: 'top' }}></div></span>
							<div class="popup" data-popup="loopExample-{catItem.value}">{catItem.tooltip}</div>
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
			<div class="game">
				{#if isRolling}
					<DicePortal />
			  	{:else}
					<div in:fade={{ duration: 1000 }}>
						<div class="prompts">
							<div class="center">
								<div class="bulb"><button on:click={nextBulb}><img src={bulbs[bulbIndex]} alt="Bulb Rating"></button></div>
								<div id="prompt">{currentPrompt}</div>
								<button class="btn variant-filled-primary margin" on:click={displayNextPrompt}>Roll the Dice</button>
							</div>
							<div class="right"><b>{currentAuthor}</b> 
								<button on:click={favToggle}>
									{#if currentFav}
										<i class="fa-solid fa-xl fa-star" style="color: #fecb0e;"></i>
									{:else}
										<i class="fa-regular fa-xl fa-star" style="color: #0d4576;"></i>
									{/if}
								</button>
							</div>
						</div>
					</div>
			  	{/if}
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

	.center {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.game {
		position: relative;
		display: flex;
    	justify-content: center; /* Center horizontally */
		align-items: center; /* Center vertically */
  		height: 40vh;
	}

</style>