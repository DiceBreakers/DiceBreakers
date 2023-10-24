<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { readable } from 'svelte/store'; // Change writable to readable
	import type { Readable } from 'svelte/store'; // Change Writable to Readable
	import type { Writable } from 'svelte/store';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { catList } from '$lib/components/catList.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';


	let userPrompts: { prompt: string; categories: string[]; id: string }[] = [];

	const Hover: PopupSettings = {
	event: 'hover',
	target: 'popupHover',
	placement: 'top'
};

	let selectedCategories = writable<CatItem[]>([]);

	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	  tooltip: string;
	};

	onMount(() => {
        catList.subscribe((list: CatItem[]) => {
            selectedCategories.set(list);
			pullPrompts();
        });
    });

	async function pullPrompts() {

  	const formData = new FormData();

	  	selectedCategories.subscribe((list: CatItem[]) => {
    		list.forEach(catItem => {
      			if (catItem.checked) {
       				formData.append('categories', catItem.value);
      		}
    	});
  	});

  try {
    const response = await fetch('?/pullPrompts', {
      method: 'POST',
      body: formData,
    });

	if (response.ok) {
  const serverData = await response.json();
  console.log('Server:', serverData)
  const rawData = JSON.parse(serverData.data);
  console.log('Raw:', rawData)
  const promptData = JSON.parse(rawData[1]);
  console.log('Prompt:', promptData)

  userPrompts = promptData.map(obj => ({
    prompt: obj.prompt,
    categories: obj.categories,
	id: obj.id,
  }));
  console.log('userPrompts:', userPrompts)

    } else {
      console.error('Failed to generate prompts.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

  function toggleCategory(catItem) {
    catItem.checked = !catItem.checked;
    pullPrompts();
  }

</script>


<div class="card">
	<Accordion>
	  <AccordionItem> 
		<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
		<svelte:fragment slot="summary">Filter Categories:</svelte:fragment>
		<svelte:fragment slot="content">
			<label class="label">
				<div class="categories-grid">
					{#each $selectedCategories as catItem (catItem.value)}
			<label class="category-item">
				<input
				name='categories'
				bind:checked={catItem.checked}
				class="checkbox checkboxSize"
				type="checkbox"
				value={catItem.value}
				title={catItem.tooltip}
				on:change={() => toggleCategory(catItem)}>
				<span class="checkboxSM">{catItem.label}
				<div class="fa-solid fa-circle-info" use:popup={{
					event: 'hover',
					target: 'loopExample-' + catItem.value,
					placement: 'top'}}
				></div>
				</span>
				<div class="popup" data-popup="loopExample-{catItem.value}">{catItem.tooltip}</div>
			</label>
			{/each}
				</div>
			  </label>
			</svelte:fragment>
	</AccordionItem>
	  <AccordionItem open on:click={pullPrompts}>
		<svelte:fragment slot="lead"><img src="favicon.png" alt="Dice Icon" width="21px" /></svelte:fragment>
		<svelte:fragment slot="summary">Prompts:</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="prompts">
				{#if userPrompts !== null}
					<ul>
  					{#each userPrompts as userPrompt}
					  <li><a href="/" id={userPrompt.id}><i class="mr fa-solid fa-pencil" style="color: #1673c5;"></i>
						{userPrompt.prompt}</a></li>
  					{/each}
					</ul>
				{:else}
  					<p>Loading...</p>
				{/if}
			</div>
		  </svelte:fragment>
	  </AccordionItem>
	</Accordion>
</div>
  		
<style>
 .mr {
	margin-right: 5px;
 }
</style>