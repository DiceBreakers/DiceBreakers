<script lang="ts">
	import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import ServerMessage from "$lib/components/serverMessage.svelte";

	type HiddenPrompt = {
		prompt: string;
		id: string;
	};

	type HiddenAuthor = {
		username : string;
		id: string;
	}

	let hiddenPrompts = writable<HiddenPrompt[]>([]);
	let hiddenAuthors = writable<HiddenAuthor[]>([]);
	let currentAuthPage = writable(0);
	let currentPromptPage = writable(0);
	let perPage = writable(10);

	let currentPageAuthorsLength = 0;
	let currentPagePromptsLength = 0;

	let hiddenPrompt;
	let hiddenAuthor;

	let prompts: HiddenPrompt[] = [];
	let authors: HiddenAuthor[] = [];

	let showSuccessMessage = false;
	let showFailureMessage = false;

	async function pullHiddenPrompts() {
		hiddenPrompt = null;
  		const formData = new FormData();

	try {
		const response = await fetch('?/pullHiddenPrompts', {
			method: 'POST',
			body: formData,
		});

		if (response.ok) {
		const serverData = await response.json();
		const rawData = JSON.parse(serverData.data);
		const promptData = JSON.parse(rawData[1]);

        prompts = promptData.map(obj => ({
            prompt: obj.prompt,
            id: obj.id,
        }));
		currentPromptPage.set(0);
		hiddenPrompts.set(prompts);
		currentPagePromptsLength = prompts.length;

		} else {
		console.error('Failed to load hidden prompts.');
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
	}

	async function pullHiddenAuthors() {
		hiddenAuthor = null;
  		const formData = new FormData();

	try {
		const response = await fetch('?/pullHiddenAuthors', {
			method: 'POST',
			body: formData,
		});

		if (response.ok) {
		const serverData = await response.json();
		const rawData = JSON.parse(serverData.data);
		const authorData = JSON.parse(rawData[1]);

        authors = authorData.map(obj => ({
            username: obj.username,
            id: obj.id,
        }));
		currentAuthPage.set(0);
		hiddenAuthors.set(authors);
		currentPageAuthorsLength = authors.length;

		} else {
		console.error('Failed to load hidden authors.');
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
	}

	onMount(() => {
		pullHiddenAuthors();
		pullHiddenPrompts();
	}
	)

	let currentPagePrompts = derived(
	[hiddenPrompts, currentPromptPage, perPage],
	([$hiddenPrompts, $currentPromptPage, $perPage]) => {
		const startIndex = $currentPromptPage * $perPage;
		const endIndex = startIndex + $perPage;
		return $hiddenPrompts.slice(startIndex, endIndex);
  		}
	);

	let currentPageAuthors = derived(
	[hiddenAuthors, currentAuthPage, perPage],
	([$hiddenAuthors, $currentAuthPage, $perPage]) => {
		const startIndex = $currentAuthPage * $perPage;
		const endIndex = startIndex + $perPage;
		return $hiddenAuthors.slice(startIndex, endIndex);
  		}
	);

	currentPagePrompts.subscribe((prompts) => {
	currentPagePromptsLength = prompts.length; 
	});

	currentPageAuthors.subscribe((authors) => {
	currentPageAuthorsLength = authors.length; 
	});
	  
	function nextPromptPage() {
 		currentPromptPage.update((currentPromptPageValue) => currentPromptPageValue + 1);
	}

	function prevPromptPage() {
		currentPromptPage.update((currentPromptPageValue) => currentPromptPageValue - 1);
	}
		  
	function nextAuthPage() {
 		currentAuthPage.update((currentAuthPageValue) => currentAuthPageValue + 1);
	}

	function prevAuthPage() {
		currentAuthPage.update((currentAuthPageValue) => currentAuthPageValue - 1);
	}

	function handleShowPrompt(selectedPrompt: HiddenPrompt) {
   		showPrompt(selectedPrompt);
	}

	async function showPrompt(selectedPrompt: HiddenPrompt) {
		if (!selectedPrompt) return;

		const formData = new FormData();
		formData.append('promptId', selectedPrompt.id);

    try {
        const response = await fetch('/profile/hidden?/showPrompt', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
			pullHiddenPrompts();
            console.log('Prompt no longer hidden!');
            showSuccessMessage = true;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 1500);
        } else {
            console.error('Failed to unhide prompt.');
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

	function handleShowAuthor(selectedAuthor: HiddenAuthor) {
   		showAuthor(selectedAuthor);
	}

	async function showAuthor(selectedAuthor: HiddenAuthor) {
		if (!selectedAuthor) return;

		const formData = new FormData();
		formData.append('authorId', selectedAuthor.id);

    try {
        const response = await fetch('/profile/hidden?/showAuthor', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
			pullHiddenAuthors();
            console.log('Author no longer hidden!');
            showSuccessMessage = true;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 1500);
        } else {
            console.error('Failed to unhide Author.');
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

<div class="card p-4">
	<Accordion autocollapse>
		<AccordionItem open on:toggle={pullHiddenAuthors}>
			<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-users" style="color: #1673c5;"></i></svelte:fragment>
			<svelte:fragment slot="summary">Hidden Authors:</svelte:fragment>
			<svelte:fragment slot="content">
				{#if $currentPageAuthors}
					<div class="hiddenAuthors">
						<ul>
							{#each $currentPageAuthors as author}
								<li>
									<a href="/profile/hidden" on:click={() => handleShowAuthor(author)}>
									<i class="mr fa-solid fa-x" style="color: #1673c5;"></i>
										{author.username}</a>
								</li>
							{/each}
						</ul>		
					</div>
					<div class="pages">
					<ul class="pad">
						{#if $currentAuthPage > 0}
							<button on:click={prevAuthPage} class="badge variant-filled-primary" style="float: left;">Previous</button>
						{/if}
						{#if Math.ceil(currentPageAuthorsLength / $perPage) > 0}
							<button on:click={nextAuthPage} class="badge variant-filled-primary" style="float: right;">Next</button>
						{/if}
					</ul>
					</div>
				{/if}
			</svelte:fragment>
		</AccordionItem>
		<AccordionItem on:toggle={pullHiddenPrompts}>
			<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-pencil" style="color: #1673c5;"></i></svelte:fragment>
			<svelte:fragment slot="summary">Hidden Prompts:</svelte:fragment>
			<svelte:fragment slot="content">
				{#if $currentPagePrompts}
					<div class="hiddenPrompts">
						<ul>
						{#each $currentPagePrompts as prompt}
						<li>
							<a href="/profile/hidden" on:click={() => handleShowPrompt(prompt)}>
							<i class="mr fa-solid fa-x" style="color: #1673c5;"></i>
							{prompt.prompt}
							</a>
						</li>
						{/each}
						</ul>		
					</div>
					<div class="pages">
					<ul class="pad">
						{#if $currentPromptPage > 0}
							<button on:click={prevPromptPage} class="badge variant-filled-primary" style="float: left;">Previous</button>
						{/if}
						{#if Math.ceil(currentPagePromptsLength / $perPage) > 0}
							<button on:click={nextPromptPage} class="badge variant-filled-primary" style="float: right;">Next</button>
						{/if}
					</ul>
					</div>
				{/if}
			</svelte:fragment>
		</AccordionItem>
	</Accordion>
</div>

<style>
	.mr {
		margin-right: 5px;
 	}

	.pad {
		padding-bottom: 20px;
		margin-left: 20px;
		margin-right: 20px;
	}

</style>