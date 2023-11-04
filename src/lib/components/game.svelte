<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import DicePortal from './dicePortal.svelte';
	import { catList } from './catList.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import ServerMessage from '$lib/components/serverMessage.svelte';
    import { currentUser } from '$lib/stores/user'

	let SuccessMessage = false;
	let FailureMessage = false;
	let ReportMessage = false;
	let LoginMessage = false;
	let promptHiddenMessage = false;
	let authorHiddenMessage = false;

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
	let currentPromptId = '';
	let currentAuthor = '';
	let currentAuthId = '';
	let currentFav = false;
	let promptIndex = 0;
	let generatedPrompts: { prompt: string; promptId: string; author: string; authorId: string; isFav: boolean; isSuper: boolean; isLiked: boolean; }[] = [];
	let isRolling = false;
	let reportReason = '';
	
	onMount(() => {
        catList.subscribe((list: CatItem[]) => {
            selectedCategories.set(list);
            const categories = list;
            primaryCategories.set(categories.slice(0, 6));
            additionalCategories.set(categories.slice(6));
        });
    });

	function getBulbImage(isLiked, isSuper) {
  if (isSuper) {
    return 'bulb2.png';
  } else if (isLiked) {
    return 'bulb1.png';
  } else {
    return 'bulb0.png';
  }
}

	function toggleDice() {
    isRolling = true;
    setTimeout(() => {
      isRolling = false;
    }, 3300);
  }

  	function resetAnimation() {
		currentPrompt = '';
		currentAuthor = '';
		currentAuthId = '',
		promptIndex = 0;
		currentFav = false;
	}

	function displayFirstPrompt() {
  if (promptIndex < generatedPrompts.length) {
	const { prompt, promptId, author, authorId } = generatedPrompts[promptIndex];
		currentPrompt = prompt;
		currentPromptId = promptId;
		currentAuthor = author;
		currentAuthId = authorId;
		const currentPromptIndex = generatedPrompts.findIndex(prompt => prompt.authorId === currentAuthId);
    	currentFav = currentPromptIndex >= 0 && generatedPrompts[currentPromptIndex].isFav;
    promptIndex++;
  } else {
    currentPrompt = '';
	currentAuthor = 'Check the categories to roll new prompts!';
  }
}
	async function generate(event: Event) {
		resetAnimation();
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
  let serverData = await response.json();
  let rawData = JSON.parse(serverData.data);
  let promptData = JSON.parse(rawData[1]);

console.log('promptData:', promptData)

  generatedPrompts = promptData.map(obj => ({
    prompt: obj.prompt,
	promptId: obj.promptId,
    author: obj.author,
	authorId: obj.authorId,
	isFav: obj.isFavAuthor,
	isSuper: obj.isSuper,
	isLiked: obj.isLiked,
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
	console.log('pIndex:', promptIndex)
	if (promptIndex === 15) {
		resetAnimation();
    generate(new Event('click'));
  }
}

async function favToggle(event: Event) {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 1500);
    return;
  }

	currentFav = !currentFav;
    if (!currentAuthId) return;

	const promptIndex = generatedPrompts.findIndex(prompt => prompt.authorId === currentAuthId);
  		if (promptIndex >= 0) {
    		generatedPrompts[promptIndex].isFav = currentFav;
 		}

    const formData = new FormData();
    formData.append('authorId', currentAuthId);

    try {
        const response = await fetch('?/favAuthor', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Favorite Toggled Successfully');
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 1500);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 1500);
    }
}

function incrementBulb() {
  if (generatedPrompts[promptIndex].isSuper === true) {
    generatedPrompts[promptIndex].isLiked = false;
    generatedPrompts[promptIndex].isSuper = false;
  } else if (generatedPrompts[promptIndex].isLiked === true) {
    generatedPrompts[promptIndex].isSuper = true;
  } else {
    generatedPrompts[promptIndex].isLiked = true;
  }
}


async function likePrompt(event: Event) {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 1500);
    return;
  }

  	incrementBulb();

    if (!currentAuthId) return;

    const formData = new FormData();
    formData.append('promptId', currentPromptId);

    try {
        const response = await fetch('?/likePrompt', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Like Status Changed');
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 1500);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 1500);
    }
};

async function hidePrompt(event: Event) {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 1500);
    return;
  }

    if (!currentPromptId) return;

    const formData = new FormData();
    formData.append('promptId', currentPromptId);

    try {
        const response = await fetch('?/hidePrompt', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Prompt Hidden Successfully');
			promptHiddenMessage = true;
            setTimeout(() => {
                promptHiddenMessage = false;
            }, 1500);
			displayNextPrompt();
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 1500);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 1500);
    }
}

async function hideAuthor(event: Event) {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 1500);
    return;
  }

    if (!currentAuthId) return;

    const formData = new FormData();
    formData.append('authorId', currentAuthId);

    try {
        const response = await fetch('?/hideAuthor', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Author Hidden Successfully');
			authorHiddenMessage = true;
            setTimeout(() => {
                authorHiddenMessage = false;
            }, 1500);
			displayNextPrompt();
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 1500);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 1500);
    }
}

async function submitReport(event: Event) {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 1500);
    return;
  }

    if (!currentAuthId) return;

    const formData = new FormData();
    formData.append('authorId', currentAuthId);
	formData.append('promptId', currentPromptId);
	formData.append('promptText', currentPrompt);
	formData.append('report', reportReason);

    try {
        const response = await fetch('?/report', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Thank you for contacting Dice Breakers. We will look into your report.');
			ReportMessage = true;
            setTimeout(() => {
                ReportMessage = false;
            }, 4000);
			displayNextPrompt();
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 1500);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 1500);
    }
}

</script>

{#if SuccessMessage}
	<ServerMessage />
{/if}

{#if ReportMessage}
	<ServerMessage messageText="We will look into your report."/>
{/if}

{#if promptHiddenMessage}
	<ServerMessage messageText="Prompt Hidden!" />
{/if}

{#if authorHiddenMessage}
	<ServerMessage messageText="Author Hidden!" />
{/if}

{#if FailureMessage}
	<ServerMessage isError={true} messageText="Something is broken :-(" />
{/if}

{#if LoginMessage}
	<ServerMessage isError={true} messageText="You must be logged in" />
{/if}
  
  <div class="card p-4">
	<Accordion autocollapse>
	  <AccordionItem open> 
		<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
		<svelte:fragment slot="summary">Settings:</svelte:fragment>
		<svelte:fragment slot="content">
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
						use:popup={{ event: 'hover', target: 'loopExample-' + catItem.value,
						placement: 'top' }}></div></span>
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
						<div class="promptBox">
							<div class="gameTop">
								<div class="bulb">
									<button on:click={likePrompt}>
									  <img src={getBulbImage(generatedPrompts[promptIndex].isLiked, generatedPrompts[promptIndex].isSuper)} alt="Bulb Rating">
									</button>
								</div>								  
								<div class="prompt">{currentPrompt}</div>
								<button class="btn variant-filled-primary margin" on:click={displayNextPrompt}>Roll the Dice</button>
							</div>
							<div class="gameBottom">
								<div class="hideMenuButton">
									<div title="Hide/Report" class="fa-regular fa-xl fa-eye-slash" style="color: #1e3050;"
									use:popup={{ event: 'click', target: 'hideMenu', placement: 'top' }}></div>
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
					</div>
			  	{/if}
			</div>			  
		  </svelte:fragment>
	  </AccordionItem>
	</Accordion>
  </div>

  <!-- Popup Menus -->

  	<div class="popup hideAdjust" data-popup="hideMenu">
		<div class="popup-HM" in:fade={{ duration: 800 }}>
			<span><button class="badge variant-filled-error report" 
				use:popup={{ event: 'click', target: 'reportMenu', placement: 'top' }}>Report</button>									  
				<i class="fa-regular fa-xl fa-eye-slash" style="color: #ffffff;"></i></span>
			<div class="hide-options">
				<button class="badge variant-filled-secondary fw" on:click={hidePrompt}>Hide Prompt</button>
				<button class="badge variant-filled-secondary fw bottom" on:click={hideAuthor}>Hide Author</button>
			</div>
		</div>
	</div>

  <div class="popup reportMenu" data-popup="reportMenu">
    <div class="popup-RM" in:fade={{ duration: 800 }}>
    	<textarea id="reportReason" bind:value={reportReason} class="textArea" rows="3" placeholder="Reason for report:"></textarea>
		<div class="center">
      		<button class="submit-report badge variant-filled-error" on:click={submitReport}>Report</button>
		</div>
    </div>
  </div>

<style>
		
	.margin {
		margin:2em;
	}

	.fw {
		width: 70px;
	}

	.bottom {
		margin-top: 6px;
	}

	.report {
		margin-right: 8px;
	}

	.hideAdjust {
		align-self: flex-start;
  		margin-top: 40px;
		margin-left: 12px;
		width: 175px;
	}

	.popup-HM {
        display: flex;
        justify-content: space-between; 
        align-items: center; 
    }

	.popup-RM {
		height: 145px;
		width: 300px;
		align-items: center;
		padding: .4em;
    }

	.textArea {
		width: 100%;
		margin: 0.4em 0;
		padding: 0.4em;
}

    .hide-options {
        display: flex; 
        flex-direction: column; 
        align-items: flex-end;
    }

    .hideMenuButton .fa-eye-slash {
        cursor: pointer; 
    }

	.gameBottom {
    display: flex;
    align-items: center; 
    justify-content: space-between;
	margin-left: auto;
	margin-right: auto;
	width: 250px;
	}

	.hideMenuButton {
		list-style: none; 
		padding: 0; 
		margin: 0; 
		display: flex;
		gap: 1rem; 
	}

	.gameTop {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.game {
		position: relative;
		display: flex;
    	justify-content: center;
		align-items: center;
  		height: 40vh;
	}

	.prompt {
		text-align: center;
		min-width: 300px;
	}

</style>