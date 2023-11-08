<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import DicePortal from '$lib/components/dicePortal.svelte';
	import { catList } from '$lib/components/catList.svelte';
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
  let isLiked = false;
  let isSuper = false;
	let promptIndex = 0;
	let generatedPrompts: { prompt: string; promptId: string; author: string; authorId: string; isFav: boolean; isSuper: boolean; isLiked: boolean; }[] = [];
	let isRolling = false;
	let reportReason = '';
	
	onMount(async() => {
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
		currentAuthId = '';
		promptIndex = 0;
		currentFav = false;
	}

	function updatePrompt() {
    console.log('initpromptIndex', promptIndex)
    console.log('initgeneratedprompts.length', generatedPrompts.length)
    console.log('initgPromts[pIndex]:', generatedPrompts[promptIndex]);
  if (promptIndex < generatedPrompts.length) {
	const { prompt, promptId, author, authorId, isFav } = generatedPrompts[promptIndex];
		currentPrompt = prompt;
		currentPromptId = promptId;
		currentAuthor = author;
		currentAuthId = authorId;
    currentFav = isFav;

    console.log('endpromptIndex', promptIndex)
    console.log('endgeneratedprompts.length', generatedPrompts.length)
    console.log('endgPromts[pIndex]:', generatedPrompts[promptIndex]);
  } else {
    currentPrompt = "Hmm. Something went wrong, you shouldn't be here..."
	  currentAuthor = '';
    isLiked = false;
    isSuper = false;
    currentFav = false;
  console.log('Failed if check.')
  }
}

async function generate(event?: Event) {
  if (event) event.preventDefault();
  toggleDice();
  resetAnimation();

  const formData = new FormData();

  const selectedCats = await new Promise<CatItem[]>((resolve) => {
    selectedCategories.subscribe((list) => {
      resolve(list);
    });
  });

  selectedCats.forEach(catItem => {
    if (catItem.checked) {
      formData.append('categories', catItem.value);
    }
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
      updatePrompt();
    } else {
        console.error('Failed to generate prompts.');
        currentPrompt = "Hmm. Either there was a server error, or the search was too narrow/you've managed to hide everyone. Change some settings and try again."
      }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function displayNextPrompt() {
  promptIndex++;

  if (promptIndex >= generatedPrompts.length) {
    generate();
    return;
  }

  toggleDice();
  console.log('pIndex:', promptIndex);
  updatePrompt();
}

function updateFavoriteStatusForAuthor(authorId, isFav) {
  generatedPrompts = generatedPrompts.map((prompt) => {
    if (prompt.authorId === authorId) {
      return { ...prompt, isFav: isFav };
    }
    return prompt;
  });
}

async function favToggle() {
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
            updateFavoriteStatusForAuthor(currentAuthId, currentFav);
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

async function likePrompt() {
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

async function hidePrompt() {
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
			generate();
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

async function hideAuthor() {
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
			generate();
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

async function submitReport() {
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
  



  <div class="card p-4" transition:fade={{ delay: 1000, duration: 500 }}>
	<Accordion autocollapse>
	  <AccordionItem> 
		<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
		<svelte:fragment slot="summary">Settings:</svelte:fragment>
		<svelte:fragment slot="content">
			<Accordion>
				<AccordionItem>
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
					<div class="promptBox">
						<div class="gameTop">
              {#if generatedPrompts[promptIndex]}
              <button on:click={likePrompt}>
							  <img alt="Bulb Rating" src={getBulbImage(generatedPrompts[promptIndex].isLiked, generatedPrompts[promptIndex].isSuper)}>
              </button>
              {/if}
						  <div class="prompt" in:fade={{ delay: 100, duration: 800 }}>{currentPrompt}</div>
							<button in:fade={{ delay: 2500, duration: 1500 }} class="btn variant-filled-primary margin"
                on:click={displayNextPrompt}>Roll the Dice</button>
						</div>
            {#if generatedPrompts[promptIndex]}
						<div class="gameBottom" in:slide={{ delay: 1000, duration: 800 }}>
							<div class="hideMenuButton">
								<div title="Hide/Report" class="fa-regular fa-xl fa-eye-slash" style="color: #1e3050;"
									use:popup={{ event: 'click', target: 'hideMenu', placement: 'top' }}
                  use:popup={{ event: 'hover', target: 'hideTT', placement: 'top'}}></div>
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
              {/if}
						</div>
			  	{/if}
			</div>			  
		  </svelte:fragment>
	  </AccordionItem>
	</Accordion>
  </div>

  <!-- Popup Menus -->

  <div class="popup likeTT" data-popup="likeTT">
    Like
  </div>

  <div class="popup sLikeTT" data-popup="sLikeTT">
    Super Like
	</div>

  <div class="popup favTT" data-popup="favTT">
    Favorite Author
  </div>

  <div class="popup hideTT" data-popup="hideTT">
    Hide/Report
	</div>

  <div class="popup_hideMenu" data-popup="hideMenu">
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

  .likeTT {
    margin-top: 10px;
  }

  .hideTT {
    margin-top: -15px;
  }

	.popup_hideMenu {
		align-self: flex-start;
    margin-top: 40px;
		margin-left: 12px;
		width: 175px;
    background-color: #0b3861;
    color: #8FE0F7;
		padding: 5px;
		border-radius: 5px;
		z-index: 2000;
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


/* media query for narrow screens */
@media (max-width: 600px) {
  .category-item {
    display: flex;
    align-items: center; 
  }

  .checkboxSize {
    flex-shrink: 0;
  }

  .checkboxSM {
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    max-width: 70%; 
    font-size: .8em;
  }

  .fa-circle-info {
    flex-shrink: 0;
  }
}
</style>