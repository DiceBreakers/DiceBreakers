<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { popup } from '@skeletonlabs/skeleton';
  import { currentUser } from '$lib/stores/user';
  import { authorFavorites } from '$lib/stores/authors';
  import { catList } from '$lib/components/catList.svelte';
  import DiceRoll from '$lib/components/diceRoll.svelte';
  import ServerMessage from '$lib/components/serverMessage.svelte';

  export let data;

	type CatItem = {
	  value: string;
	  label: string;
	  checked: boolean;
	  tooltip: string;
	};

  type Prompt = {
    prompt: string;
    promptId: string;
    author: string;
    authorId: string;
    isFavAuthor: boolean;
    liked: boolean;
    superLiked: boolean;
    score: number;
    cCount: number;
  }
	
  let selectedFilter = writable('all');
	let selectedCategories = writable<CatItem[]>([]);
	let primaryCategories = writable<CatItem[]>([]);
	let additionalCategories = writable<CatItem[]>([]);
  let promptArray = writable<Prompt[]>([]);
	let currentPrompt = '';
	let currentPromptId = '';
	let currentAuthor = '';
	let currentAuthId = '';
	let currentFav = false;
  let cCount = 0;
	let promptIndex = 0;
	let isRolling = false;
  let SuccessMessage = false;
	let FailureMessage = false;
	let ReportMessage = false;
	let LoginMessage = false;
  let SettingsSaved = false;
	let promptHiddenMessage = false;
	let authorHiddenMessage = false;
  let reportReason = '';
  let allPrimaryChecked = true;
  let allAdditionalChecked = false;
  let preferences;

  if (data.preferences) {
  try {
    const preferences = JSON.parse(data.preferences);
   // console.log('preferences:', preferences);

    if (preferences) {
      if (preferences.selectedFilter) {
        selectedFilter.set(preferences.selectedFilter);
      }
      if (preferences.selectedCategories) {
        selectedCategories.set(preferences.selectedCategories);
      }
      if (preferences.primaryCategories) {
        primaryCategories.set(preferences.primaryCategories);
      }
      if (preferences.additionalCategories) {
        additionalCategories.set(preferences.additionalCategories);
      }
    } else {
      console.log('Preferences are null, using default values');
      // Set default values or handle the case where preferences are null
    }
  } catch (e) {
    console.error("Error parsing preferences data:", e);
    // Handle the parsing error, possibly set defaults
  }
} else {
  console.log('Preferences are null, using default categories');
  // Handle the case where there are no preferences, possibly set defaults
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

  formData.append('selectedFilter', $selectedFilter.toString());

  // console.log('SelectedFilter:', $selectedFilter.toString());

  try {
    const response = await fetch('?/generate', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
		
      let serverData = await response.json();
      let rawData = JSON.parse(serverData.data);
      let promptData = JSON.parse(rawData[1]);
      let generatedPrompts = promptData.map(obj => {

      return {
        prompt: obj.prompt,
        promptId: obj.id,
        author: obj.author,
        authorId: obj.authorId,
        isSuper: obj.superLiked,
        isLiked: obj.liked,
        isFavAuthor: obj.isFavAuthor,
        score: 1,
        cCount: 0,
      };
    });

      promptArray.set(generatedPrompts);
      console.log('generatedPrompts', generatedPrompts)

      generatedPrompts.forEach(prompt => {
        authorFavorites.toggleFavorite(prompt.authorId);
      });

      updatePrompt();
    } else {
        console.error('Failed to generate prompts.');
        currentPrompt = "Hmm. I didn't find any prompts for some reason."
        currentAuthor = "Womp Womp"
      }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function updatePrompt() {
  const prompts = get(promptArray);
  
  if (promptIndex < prompts.length) {
    const promptData = prompts[promptIndex];

    try {
      if (promptData) {
        const { prompt, promptId, author, authorId } = promptData;
        currentPrompt = prompt;
        currentPromptId = promptId;
        currentAuthor = author;
        currentAuthId = authorId;

        const additionalDetails = await fetchPromptDetails(promptId, authorId);
        if (additionalDetails) {
          const updatedPrompt = {
            ...promptData,
            ...additionalDetails
          };

          prompts[promptIndex] = updatedPrompt;
          promptArray.set(prompts);

          currentFav = updatedPrompt.isFavAuthor;
        }
      } else {
        throw new Error('Prompt data is undefined');
      }
    } catch (error) {
      console.error('Failed to set prompt data:', error);
      currentPrompt = "Hmm. Something went wrong, you shouldn't be here...";
      currentAuthor = '';
      currentPromptId = '';
      currentAuthId = '';
      currentFav = false;
    }
  } else {
    console.error('No more prompts to display.');
    currentPrompt = "Hmm. Either there was a server error, or the search was too narrow/you've managed to hide everyone. Change some settings and try again.";
    currentAuthor = "Womp Womp";
    currentFav = false;
  }
}


async function fetchPromptDetails(promptId, authorId) {
  try {
    const formData = new FormData();
    formData.append('promptId', promptId);
    formData.append('authorId', authorId)

    const response = await fetch('?/promptStatus', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    if (jsonResponse && jsonResponse.data) {
      const dataArr = JSON.parse(jsonResponse.data);
      const additionalDetails = dataArr.length > 1 ? JSON.parse(dataArr[1]) : {};

      console.log('additionalDetails:', additionalDetails);

      return additionalDetails;
    }

    return {};
  } catch (error) {
    console.error('An error occurred while fetching prompt details:', error);
    return {};
  }
}

async function saveSettings() {
  console.log('running Save Settings')
  
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 2000);
    return;
  }

    const formData = new FormData();

    const preferences = {
      selectedFilter: $selectedFilter,
      primaryCategories: $primaryCategories,
      additionalCategories: $additionalCategories
    };

    formData.append('preferences', JSON.stringify(preferences));

    console.log('SavingSettings:', preferences)

    try {
        const response = await fetch('?/saveSettings', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
			    SettingsSaved = true;
            setTimeout(() => {
                SettingsSaved = false;
            }, 2000);
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 2000);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 2000);
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

function displayNextPrompt() {
  promptIndex++;

  const prompts = get(promptArray);
  if (promptIndex >= prompts.length) {
    generate();
    return;
  }

  toggleDice();
  updatePrompt();
}

async function favToggle() {
  if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 2000);
    return;
  }

  const currentAuthId = $promptArray[promptIndex]?.authorId;

  authorFavorites.toggleFavorite(currentAuthId);
  
  const formData = new FormData();
  formData.append('authorId', currentAuthId);

  try {
    const response = await fetch('?/favAuthor', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('Favorite Toggled Successfully');
      currentFav = !currentFav
    } else {
      console.error('Something broke :-(');
      FailureMessage = true;
      setTimeout(() => {
        FailureMessage = false;
      }, 2000);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    FailureMessage = true;
    setTimeout(() => {
      FailureMessage = false;
    }, 2000);
  }
}

async function pVote() {
    if (!$currentUser) {
      LoginMessage = true;
      setTimeout(() => {
        LoginMessage = false;
      }, 2000);
      return;
    }

    const currentPrompts = get(promptArray);
    const prompt = currentPrompts[promptIndex];

    if (prompt.superLiked) {
      prompt.liked = false;
      prompt.superLiked = false;
      prompt.score -= 5;
    } else if (prompt.liked) {
      prompt.superLiked = true;
      prompt.liked = false;
      prompt.score += 4;
    } else {
      prompt.liked = true;
      prompt.score += 1;
    }

    promptArray.update(n => {
      n[promptIndex] = {
        ...prompt,
        score: prompt.score,
        liked: prompt.liked,
        superLiked: prompt.superLiked
      };
      return [...n];
    });

    console.log('score', prompt.score)

    if (!prompt.authorId) return;

    const formData = new FormData();
    formData.append('promptId', prompt.promptId);

    try {
      const response = await fetch('?/pVote', {
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
        }, 2000);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      FailureMessage = true;
      setTimeout(() => {
        FailureMessage = false;
      }, 2000);
    }
  }

async function hidePrompt() {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 2000);
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
            }, 2000);
			generate();
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 2000);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 2000);
    }
}

async function hideAuthor() {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 2000);
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
            }, 2000);
			generate();
        } else {
            console.error('Something broke :-(');
            FailureMessage = true;
            setTimeout(() => {
                FailureMessage = false;
            }, 2000);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 2000);
    }
}

async function submitReport() {
	if (!$currentUser) {
    LoginMessage = true;
    setTimeout(() => {
      LoginMessage = false;
    }, 2000);
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
            }, 2000);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 2000);
    }
  }

  function handleSelectAll(categoryGroup) {
        if (categoryGroup === 'primary') {
            allPrimaryChecked = !allPrimaryChecked;
            primaryCategories.update(cats => cats.map(cat => ({ ...cat, checked: allPrimaryChecked })));
        } else if (categoryGroup === 'additional') {
            allAdditionalChecked = !allAdditionalChecked;
            additionalCategories.update(cats => cats.map(cat => ({ ...cat, checked: allAdditionalChecked })));
        }
    }

    function updateAllChecked(categoryGroup) {
        if (categoryGroup === 'primary') {
            allPrimaryChecked = $primaryCategories.every(cat => cat.checked);
        } else if (categoryGroup === 'additional') {
            allAdditionalChecked = $additionalCategories.every(cat => cat.checked);
        }
    }

    function updateSelectedCategories() {
        selectedCategories.set([...$primaryCategories, ...$additionalCategories]);
    }


  $: allPrimaryChecked = $primaryCategories.every(cat => cat.checked);
  $: allAdditionalChecked = $additionalCategories.every(cat => cat.checked);
  $: score = $promptArray[promptIndex]?.score ?? 0;
  $: cCount = $promptArray[promptIndex]?.cCount ?? 0;
  $: bulbImage = $promptArray[promptIndex]?.superLiked ? 'bulb2.png' :
                 $promptArray[promptIndex]?.liked ? 'bulb1.png' : 'bulb0.png';

  $: if ($primaryCategories) {
        updateSelectedCategories();
    }

  $: if ($additionalCategories) {
        updateSelectedCategories();
    }

  $: if ($selectedFilter !== 'all') {
    if (!$currentUser) {
      $selectedFilter = 'all';
      LoginMessage = true;
      setTimeout(() => {
        LoginMessage = false;
      }, 2000);
    }
  }

  onMount(() => {
  if (!preferences) {
    //console.log('No preferences set, using default categories');
    catList.subscribe((list: CatItem[]) => {
      selectedCategories.set(list);
      const categories = list;
      primaryCategories.set(categories.slice(0, 5));
      additionalCategories.set(categories.slice(5));
    });
  } else {
    console.log('Preferences Set On Load');
  }
  displayNextPrompt();
});

</script>

{#if SuccessMessage}
	<ServerMessage />
{/if}

{#if ReportMessage}
	<ServerMessage messageText="Thanks, we will review your report."/>
{/if}

{#if SettingsSaved}
	<ServerMessage messageText="Settings Successfully Saved!"/>
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
  <ServerMessage isError={true} messageText="You'll need to log in first!" />
{/if}


  <div class="container card p-4 outsideContainer" transition:fade={{ delay: 1000, duration: 500 }}>
	<Accordion autocollapse>
	  <AccordionItem> 
		<svelte:fragment slot="lead"><i class="fa-solid fa-lg fa-gear" style="color: #1673c5;"></i></svelte:fragment>
		<svelte:fragment slot="summary">Settings and Categories</svelte:fragment>
		<svelte:fragment slot="content">
			<Accordion>
        <AccordionItem>
          <svelte:fragment slot="summary">Settings</svelte:fragment>
					<svelte:fragment slot="content">
            <label class="label">
              <span>Show</span>
              <select bind:value={$selectedFilter} class="selectFilter" name="selectedFilter">
                <option value="all">All Prompts</option>
                <option value="liked">All Liked</option>
                <option value="superLiked">Super Liked</option>
                <option value="favAuthors">Favorite Authors</option>
              </select>
            </label>
              <button on:click={saveSettings} class="btn variant-filled-primary margin">
                Save Settings/Categories as Default
              </button>
          </svelte:fragment>
        </AccordionItem>
				<AccordionItem>
					<svelte:fragment slot="summary">Primary Categories</svelte:fragment>
					<svelte:fragment slot="content">
            <label class="label">
              <div class="categories-grid">
                <label class="category-item">
                  <input type="checkbox" class="checkbox checkboxSize" 
                        bind:checked={allPrimaryChecked} 
                        on:click={() => handleSelectAll('primary')}>
                  <span class="checkboxSM">Select All</span>
              </label>
            {#each $primaryCategories as catItem}
            <label class="category-item">
              <input name='categories' bind:checked={catItem.checked}
                class="checkbox checkboxSize" type="checkbox" 
                value={catItem.value} title={catItem.tooltip}
                on:change={() => updateAllChecked('primary')}>
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
				<svelte:fragment slot="summary">Oddly Specific Categories</svelte:fragment>
				<svelte:fragment slot="content">
				<label class="label">
					<div class="categories-grid">
            <label class="category-item">
              <input type="checkbox" class="checkbox checkboxSize" 
                     bind:checked={allAdditionalChecked} 
                     on:click={() => handleSelectAll('additional')}>
              <span class="checkboxSM">Select All</span>
          </label>
						{#each $additionalCategories as catItem}
						<label class="category-item">
              <input name='categories' bind:checked={catItem.checked}
                class="checkbox checkboxSize" type="checkbox" 
                value={catItem.value} title={catItem.tooltip}
                on:change={() => updateAllChecked('additional')}>
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
	  <AccordionItem open on:toggle={displayNextPrompt}>
		<svelte:fragment slot="lead"><img src="favicon.png" alt="Dice Icon" width="21px" /></svelte:fragment>
		<svelte:fragment slot="summary"><div class="startConvo">Start a Conversation!</div></svelte:fragment>
		<svelte:fragment slot="content">
			<div class="game">
				{#if isRolling}
					<DiceRoll />
			  {:else}
					<div class="promptBox">
						<div class="gameTop" in:fade={{ delay: 100, duration: 800 }}>
                {#if $promptArray.length > 0 && $promptArray[promptIndex]}
                <div class="scoreContainer">
                  <button on:click={pVote}>
                    <img alt="Bulb Rating" src={bulbImage} class="bulbImage">
                  </button>
                  <span class="score" use:popup={{ event: 'hover', target: 'scoreTT', placement: 'right'}}>
                    ({score})</span>
                </div>
                {/if}
						  <div class="prompt">{currentPrompt}</div>
              <div class="author"><b>-{currentAuthor}</b> 
                <button on:click={favToggle}>
                  {#if currentFav}
                    <i class="fa-solid fa-xl fa-star" style="color: #fecb0e;"></i>
                  {:else}
                    <i class="fa-regular fa-xl fa-star" style="color: #0d4576;"></i>
                  {/if}
                </button>
              </div>
							<button in:fade={{ delay: 2000, duration: 1500 }} class="btn variant-filled-primary margin"
                on:click={displayNextPrompt}>Roll the Dice</button>
						</div>
						<div class="gameBottom" in:fade={{ delay: 100, duration: 800 }}>
              {#if $promptArray.length > 0 && $promptArray[promptIndex]}
							<div class="hideMenuButton">
								<div title="Hide/Report" class="fa-regular fa-xl fa-eye-slash" style="color: #1e3050;"
									use:popup={{ event: 'click', target: 'hideMenu', placement: 'top' }}>
                </div>
                <div class="hideText">(hide)</div>
							</div>
                <div class="comments"><a href="/conversations/{currentPromptId}">comments </a>({cCount})</div>
              {/if}
						</div>
					</div>
			  {/if}
			</div>			  
		  </svelte:fragment>
	  </AccordionItem>
	</Accordion>
  </div>

  <!-- Popup Menus -->

  <div class="popup scoreTT" data-popup="scoreTT">
    {#if score==1}
      Like
    {:else}
      Likes
    {/if}
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

  .outsideContainer {
    min-height:500px;
  }
  
  .selectFilter {
      border-radius: 5px;
      margin-left: 5px;
    }

  .scoreContainer {
    display: flex;
    align-items: center;
  }

  .author {
    align-self: flex-end;
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-right: 20px;
    margin-top: 10px;
  }
      
	.margin {
		margin:2em;
	}

	.fw {
		width: 70px;
	}

  .startConvo {
    text-align: center;
    font-weight: bold;
  }

	.report {
		margin-right: 8px;
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

  .hideMenuButton {
		list-style: none; 
		padding: 0; 
		margin: 0; 
		display: flex;
		gap: .5rem; 
    width: 100px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
	}

  .hideMenuButton .fa-eye-slash {
    cursor: pointer; 
  }

  .hideText {
    font-size: small;
  }

	.gameTop {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

  .gameBottom {
    display: flex;
    align-items: center; 
    justify-content: space-between;
    margin-left: auto;
    margin-right: auto;
    max-width: 500px;
    margin-top: 50px;
    padding-top: 50px;
    margin-bottom: -75px;
	}

	.game {
		position: relative;
		display: flex;
    justify-content: center;
    align-items: center;
    height: 45vh;
	}

	.prompt {
		text-align: center;
		min-width: 300px;
	}

  .bottom {
		margin-top: 6px;
	}

</style>