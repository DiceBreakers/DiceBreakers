<script lang="ts">
	import { catList } from '../../lib/components/catList.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { readable } from 'svelte/store';
	import ServerMessage from '../../lib/components/serverMessage.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';

	const Hover: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};
 
	// Define the type for catItem
	type CatItem = {
		value: string;
		label: string;
		checked: boolean;
		tooltip: string;
	};
  
	let showSuccessMessage = false;
	let showFailureMessage = false;
	let promptText = '';
	let selectedCategories = writable<CatItem[]>([]);
	let primaryCategories = writable<CatItem[]>([]);
	let additionalCategories = writable<CatItem[]>([]);

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
				promptText = '';
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

	onMount(() => {
		catList.subscribe((list: CatItem[]) => {
			selectedCategories.set(list);
			const categories = list;
			primaryCategories.set(categories.slice(0, 6)); // Adjust the number as needed
			additionalCategories.set(categories.slice(6));
		});
	}
	)
</script>
  
{#if showSuccessMessage}
	<ServerMessage />
{/if}

{#if showFailureMessage}
	<ServerMessage isError={true} messageText="Something is broken :-(" />
{/if}
  

<section id="addPrompt">
	<div class="card p-4 variant-glass-secondary">
		<form on:submit={handleSubmit}>
			<label class="label">
				<div class="body padding"><h1>Add a Prompt:</h1></div>
				<textarea name="prompt" bind:value={promptText} class="textarea" rows="2" placeholder="Enter Prompt" />
			</label>
			<Accordion>
				<AccordionItem open>
					<svelte:fragment slot="summary">Primary Categories:</svelte:fragment>
					<svelte:fragment slot="content">
						<label class="label"> <!-- Added "class" here -->
							<div class="categories-grid">
								{#each $primaryCategories as catItem}
								<label class="category-item">
									<input name='categories' bind:checked={catItem.checked}
										class="checkbox checkboxSize" type="checkbox" value={catItem.value} title={catItem.tooltip}>
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
								{#each $additionalCategories as catItem}
								<label class="category-item">
									<input name='categories' bind:checked={catItem.checked}
										class="checkbox checkboxSize" type="checkbox" value={catItem.value} title={catItem.tooltip}>
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
			<div class="text-center">
				<button class="btn variant-filled-primary margin" type="submit">Submit</button>
			</div>
		</form>
	</div>
</section>
			
<style>
	.padding {
		padding: 15px;
	}

	.margin {
		margin: 2em;
	}
</style>
