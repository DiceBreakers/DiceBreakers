<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { catList } from '$lib/components/catList.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import ServerMessage from '$lib/components/serverMessage.svelte';

	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	  filter: boolean;
	  tooltip: string;
	};

	type UserPrompt = {
		prompt: string;
		categories: string[];
		id: string;
	};

	const deletePopup: PopupSettings = {
		event: 'click',
		target: 'deletePopup',
		placement: 'left',
	};

	let selectedCategories = writable<CatItem[]>([]);
	let primaryCategories = writable<CatItem[]>([]);
	let additionalCategories = writable<CatItem[]>([]);
	let selectedPrompts = writable<UserPrompt[]>([]);
	let filterCategories = writable<CatItem[]>([]);
	let filterPrimaryCats = writable<CatItem[]>([]);
	let filterAdditionalCats = writable<CatItem[]>([]);
	let userPrompts = writable<UserPrompt[]>([]);
	let currentPage = writable(0);
	let perPage = writable(10);

	let showSuccessMessage = false;
	let showDeleteMessage = false;
	let showFailureMessage = false;
	let currentPagePromptsLength = 0;
	let promptText = '';
	let prompts: UserPrompt[] = [];
	let editingPrompt: {
  		promptText: 'Select a prompt to edit...';
  		selectedCategories: string[];
  		promptId: '';
	} | null = null;

	async function pullPrompts() {
		editingPrompt = null;
  		const formData = new FormData();
	  	filterCategories.subscribe((list: CatItem[]) => {
    		list.forEach(catItem => {
      			if (catItem.filter) {
       				formData.append('filterCategories', catItem.value);
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
		const rawData = JSON.parse(serverData.data);
		const promptData = JSON.parse(rawData[1]);

  	prompts = promptData.map(obj => ({
          prompt: obj.prompt,
          categories: obj.categories,
          id: obj.id,
        }));
	currentPage.set(0);
	userPrompts.set(prompts);
	currentPagePromptsLength = prompts.length;

    } else {
      console.error('Failed to generate prompts.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

	onMount(() => {
		catList.subscribe((list: CatItem[]) => {
			selectedCategories.set(list);
			const categories = list;
			filterCategories.set(list);
			const fCategories = list;
			primaryCategories.set(categories.slice(0, 6));
			additionalCategories.set(categories.slice(6));
			filterPrimaryCats.set(fCategories.slice(0, 6));
			filterAdditionalCats.set(fCategories.slice(6));
			pullPrompts();
		});
	}
	)

	let currentPagePrompts = derived(
	[userPrompts, currentPage, perPage],
	([$userPrompts, $currentPage, $perPage]) => {
		const startIndex = $currentPage * $perPage;
		const endIndex = startIndex + $perPage;
		return $userPrompts.slice(startIndex, endIndex);
  		}
	);

	currentPagePrompts.subscribe((prompts) => {
	currentPagePromptsLength = prompts.length; 
	});

	function toggleFilterCategory(catItem) {
		console.log('Clicked on catItem:', catItem);
		filterCategories.update(fCategories => {
		const updatedCategories = fCategories.map(item => {
			if (item.value === catItem.value) {
			item.checked = !item.filter;
			}
			return item;
		});
		return updatedCategories;
		});
		pullPrompts();
	}
  
	function nextPage() {
 		currentPage.update((currentPageValue) => currentPageValue + 1);
	}

	function prevPage() {
		currentPage.update((currentPageValue) => currentPageValue - 1);
	}

	function handleEditPrompt(userPrompt) {
   		editPrompt(userPrompt);
	}
	
	function editPrompt(userPrompt) {
		if (editingPrompt !== null) {
			editingPrompt = null;
		}
			promptText = userPrompt.prompt;
			selectedCategories.update(categories => {
				return categories.map(catItem => {
					catItem.checked = userPrompt.categories.includes(catItem.value);
					return catItem;
					});
    			});

			editingPrompt = {
				promptText: userPrompt.prompt,
				selectedCategories: userPrompt.categories,
				promptId: userPrompt.id,
			};

		selectedPrompts.update(prompts => [...prompts, userPrompt]);
	}

async function updatePrompt(event: Event) {
    if (!editingPrompt) return;

    const formData = new FormData();
    formData.append('prompt', editingPrompt.promptText);
    formData.append('pId', editingPrompt.promptId);

    selectedCategories.subscribe((list: CatItem[]) => {
        list.forEach(catItem => {
            if (catItem.checked) {
                formData.append('categories', catItem.value);
            }
        });
    });

    try {
        const response = await fetch('/edit?/update', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Prompt updated successfully!');
            showSuccessMessage = true;
			editingPrompt = null;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 1500);
        } else {
            console.error('Failed to submit prompt.');
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

async function deletePrompt(event: Event) {
    if (!editingPrompt) return;

    const formData = new FormData();
    formData.append('pId', editingPrompt.promptId);

    try {
        const response = await fetch('/edit?/delete', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Prompt deleted successfully!');
            showDeleteMessage = true;
			editingPrompt = null;
            setTimeout(() => {
                showDeleteMessage = false;
            }, 1500);
        } else {
            console.error('Failed to delete prompt.');
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


</script>
  
{#if showSuccessMessage}
	<ServerMessage />
{/if}

{#if showFailureMessage}
	<ServerMessage isError={true} messageText="Something is broken :-(" />
{/if}

{#if showDeleteMessage}
	<ServerMessage isError={true} messageText="Prompt Deleted" />
{/if}

<div class="card">
	<Accordion autocollapse>
		<AccordionItem> 
			<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
			<svelte:fragment slot="summary">Filter:</svelte:fragment>
			<svelte:fragment slot="content">
		<Accordion>
		<AccordionItem open>
			<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
			<svelte:fragment slot="summary">Primary Categories:</svelte:fragment>
			<svelte:fragment slot="content">
				<label class="label">
					<div class="categories-grid">
						{#each $filterPrimaryCats as catItem}
						<label class="category-item">
							<input
							name='filterCategories'
							bind:checked={catItem.filter}
							class="checkbox checkboxSize"
							type="checkbox"
							value={catItem.value}
							title={catItem.tooltip}
							on:change={() => toggleFilterCategory(catItem)}>
							<span class="checkboxSM">{catItem.label}
								<div class="fa-solid fa-circle-info"
									use:popup={{ event: 'hover', target: 'loopExample-' + catItem.value, placement: 'top' }}></div>
							</span>
							<div class="popup" data-popup="loopExample-{catItem.value}">{catItem.tooltip}</div>
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
						{#each $filterAdditionalCats as catItem}
						<label class="category-item">
							<input
							name='filterCategories'
							bind:checked={catItem.filter}
							class="checkbox checkboxSize"
							type="checkbox"
							value={catItem.value}
							title={catItem.tooltip}
							on:change={() => toggleFilterCategory(catItem)}>
							<span class="checkboxSM">{catItem.label}
								<div class="fa-solid fa-circle-info"
									use:popup={{ event: 'hover', target: 'loopExample-' + catItem.value, placement: 'top' }}></div>
							</span>
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
	  <AccordionItem open on:click={pullPrompts}>
		<svelte:fragment slot="lead"><img src="favicon.png" alt="Dice Icon" width="21px" /></svelte:fragment>
		<svelte:fragment slot="summary">Prompts:</svelte:fragment>
		<svelte:fragment slot="content">
			{#if $currentPagePrompts}
			<div class="prompts">
			  <ul>
				{#each $currentPagePrompts as userPrompt}
				  <li>
					<a href="/edit#prompt" on:click={() => handleEditPrompt(userPrompt)}>
					  <i class="mr fa-solid fa-pencil" style="color: #1673c5;"></i>
					  {userPrompt.prompt}
					</a>
				  </li>
				{/each}
			  </ul>		
			</div>
			<div class="pages">
			  <ul>
				{#if $currentPage > 0}
					<button on:click={prevPage} class="badge variant-filled-primary" style="float: left;">Previous</button>
			  	{/if}
				{#if Math.ceil(currentPagePromptsLength / $perPage) > 0}
				  	<button on:click={nextPage} class="badge variant-filled-primary" style="float: right;">Next</button>
				{/if}
			  </ul>
			</div>
			{/if}
		  </svelte:fragment>
	  </AccordionItem>
<section id="prompt">
{#if editingPrompt}
		<AccordionItem open>
		<svelte:fragment slot="lead"><i class="fa-lg fa-solid fa-pencil" style="color: #1673c5;"></i></svelte:fragment>		
		<svelte:fragment slot="summary">Edit:</svelte:fragment>
		<svelte:fragment slot="content">
		  <section id="editPrompt">
			<div class="card p-4 variant-glass-secondary">
			  <form>
				<label class="label">
				  		<textarea name="prompt" id="prompt" bind:value={editingPrompt.promptText} class="textarea" rows="2" />
				</label>
				<Accordion>
				  <AccordionItem open>
					<svelte:fragment slot="summary">Primary Categories:</svelte:fragment>
					<svelte:fragment slot="content">
					  <label class="label">
						<div class="categories-grid">
							{#each $primaryCategories as catItem}
							<label class="category-item">
							  <input
								name='categories'
								bind:checked={catItem.checked}
								class="checkbox checkboxSize"
								type="checkbox"
								value={catItem.value}
								title={catItem.tooltip}
								>
							  <span class="checkboxSM">{catItem.label}
								<div class="fa-solid fa-circle-info"
								  use:popup={{ event: 'hover', target: 'loopExample-' + catItem.value, placement: 'top' }}
								></div>
							  </span>
							  <div class="popup" data-popup="loopExample-{catItem.value}">{catItem.tooltip}</div>
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
						  {#each $additionalCategories as catItem}
							<label class="category-item">
							  <input
								name='categories'
								bind:checked={catItem.checked}
								class="checkbox checkboxSize"
								type="checkbox"
								value={catItem.value}
								title={catItem.tooltip}
							  >
							  <span class="checkboxSM">{catItem.label}
								<div class="fa-solid fa-circle-info"
								  use:popup={{ event: 'hover', target: 'loopExample-' + catItem.value, placement: 'top' }}
								></div>
							  </span>
							  <div class="popup" data-popup="loopExample-{catItem.value}">{catItem.tooltip}</div>
							</label>
						  {/each}
						</div>
					  </label>
					</svelte:fragment>
				  </AccordionItem>
				</Accordion>
				<input type="hidden" name="promptId" id="promptId" bind:value={editingPrompt.promptId} />
				<div class="text-center">
				  <button class="btn variant-filled-primary margin" on:click={updatePrompt}>Submit</button>
				  <button use:popup={deletePopup} style="float: right;" class="delete">
					<i class="mr fa-solid fa-trash-can" style="color: #1673c5;"></i>
					</button>
				  <div class="card p-4 w-36 shadow-xl" data-popup="deletePopup">
					<div>Confirm Delete?</div>
					<button class="btn variant-filled-primary margin" on:click={deletePrompt}>Delete</button>
					<div class="arrow bg-surface-100-800-token" />
				</div>	
				</div>
			  </form>
			</div>
		  </section>
		</svelte:fragment>
	</AccordionItem>
		{:else}
			<div class="text-center margin">Select prompt to edit...</div>
		{/if}
	</section>
	</Accordion>

</div>
  		
<style>
 .mr {
	margin-right: 5px;
 }

 .margin {
	margin: 20px;
 }

 .delete {
	margin-top: 40px;
 }

 .pages {
        justify-content: center;
        text-align: center;
		margin: 10px;
    }
    .pages ul {
        margin: auto;
        text-align: center;
    }
</style>