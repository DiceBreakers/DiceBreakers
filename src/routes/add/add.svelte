<script lang="ts">
	import { catList } from '$lib/components/catList.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import ServerMessage from '$lib/components/serverMessage.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import { currentUser } from '$lib/stores/user';
 
	type CatItem = {
		value: string;
		label: string;
		checked: boolean;
		tooltip: string;
	};
  
	let showSuccessMessage = false;
	let showFailureMessage = false;
	let showVerifiedMessage = false;
	let showEmailSuccessMessage = false;
	let promptText = '';
	let selectedCategories = writable<CatItem[]>([]);
	let primaryCategories = writable<CatItem[]>([]);
	let additionalCategories = writable<CatItem[]>([]);


	async function sendVerificationEmail() {
    const formData = new FormData(); // Empty FormData

    try {
        const response = await fetch('/add?/verifyEmail', {
            method: 'POST',
            body: formData // Sending empty FormData
        });

		console.log('Verification Sent Successfully!');
		showVerifiedMessage = false
		showEmailSuccessMessage = true;  
		promptText = '';
		setTimeout(() => {
			showEmailSuccessMessage = false;
		}, 1500);
    } catch (error) {
		console.error('Something Went wrong.');
				showFailureMessage = true;
				setTimeout(() => {
					showFailureMessage = false;
				}, 1500);
    }
}

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
				}, 6000);
			}
		} catch (error) {
			console.error('An error occurred:', error);
			showFailureMessage = true;
			setTimeout(() => {
					showFailureMessage = false;
				}, 6000);
		}
	}

	onMount(() => {
		console.log('currentUser:', $currentUser)
		if (!$currentUser?.verified) {
            showVerifiedMessage = true;
			setTimeout(() => {
					showVerifiedMessage = false;
				}, 5000);
        }
		catList.subscribe((list: CatItem[]) => {
			selectedCategories.set(list);
			const categories = list;
			primaryCategories.set(categories.slice(0, 5));
			additionalCategories.set(categories.slice(5));
		});
	}
	)
</script>
  
{#if showSuccessMessage}
	<ServerMessage />
{/if}

{#if showFailureMessage}
	<ServerMessage isError={true} messageText="Something broke! Did you verify your email? If so, try logging out and back in.">
		<button class="btn variant-filled-warning margin" on:click={sendVerificationEmail}>Send Verification Email</button>
	</ServerMessage>
{/if}

{#if showVerifiedMessage}
    <ServerMessage messageText="Thanks for contributing! You must verify your email before submitting though.">
        <button class="btn variant-filled-warning margin" on:click={sendVerificationEmail}>Resend Email</button>
    </ServerMessage>
{/if}

{#if showEmailSuccessMessage}
	<ServerMessage messageText="Email Sent!" />
{/if}
  

	<div class="card p-4">
		<form on:submit={handleSubmit}>
			<label class="label">
				<div class="body padding"><h1>Start a Conversation:</h1></div>
				<textarea name="prompt" bind:value={promptText} class="textarea" rows="2" placeholder="Enter Prompt" />
			</label>
			<Accordion>
				<AccordionItem open>
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
			
<style>
	.padding {
		padding: 15px;
	}

	.margin {
		margin: 2em;
	}
</style>
