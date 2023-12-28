<script>
    import { currentUser } from '$lib/stores/user';
    import { authorFavorites } from '$lib/stores/authors';
    import Reply from '$lib/components/Reply.svelte';
	import ServerMessage from '$lib/components/serverMessage.svelte';

    export let prompt;

    let LoginMessage = false;
    let FailureMessage = false;

    let showReplyForPrompt = false;

    function toggleReplyForm() {
        if (!$currentUser) {
            LoginMessage = true;
            setTimeout(() => {
                LoginMessage = false;
            }, 1500);
            return;
        }
        showReplyForPrompt = !showReplyForPrompt;
    }

    function handleNewComment(event) {
    const newComment = event.detail.newComment;

    // Set the favorite status for the new comment
    newComment.isFavAuth = $authorFavorites[newComment.authId] || false;

    if (prompt.id === newComment.parent) {
        // Add the new comment to the children of the current comment
        prompt.children = [...(prompt.children || []), newComment];
    }
}


async function pVote() {
    if (!$currentUser) {
      LoginMessage = true;
      setTimeout(() => {
        LoginMessage = false;
      }, 1500);
      return;
    }

    if (!prompt.id) return;

    let newScore = prompt.score;
    let newIsLiked = prompt.isLiked;
    let newIsSuper = prompt.isSuper;

    if (prompt.isSuper) {
        newIsLiked = false;
        newIsSuper = false;
        newScore -= 5;
    } else if (prompt.isLiked) {
        newIsSuper = true;
        newIsLiked = false;
        newScore += 4;
    } else {
        newIsLiked = true;
        newScore += 1;
    }

    prompt = { ...prompt, score: newScore, isLiked: newIsLiked, isSuper: newIsSuper };

 //   console.log('pScore', prompt.score)

    const formData = new FormData();
    formData.append('promptId', prompt.id);

    try {
      const response = await fetch('?/pVote', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
 //       console.log('Like Status Changed');
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

  async function favToggle() {
    if (!$currentUser) {
        LoginMessage = true;
        setTimeout(() => {
            LoginMessage = false;
        }, 1500);
        return;
    }

    if (!prompt.authId) return;

    authorFavorites.toggleFavorite(prompt.authId);

    const formData = new FormData();
    formData.append('authId', prompt.authId);

    try {
        const response = await fetch('?/favAuth', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Server response not OK');
        }

 //       console.log('Favorite Toggled Successfully');
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 1500);
    }
}

    $: isFavAuthor = $authorFavorites[prompt.authId] || false;
    $: bulbImage = prompt.isSuper ? '/bulb2.png' :
                   prompt.isLiked ? '/bulb1.png' : '/bulb0.png';


</script>

<div class="prompt">
    <div class="scoreContainer">
        <button on:click={pVote}>
            <img alt="Bulb Rating" src={bulbImage} class="bulbImage">
        </button>
        <div class="score">({prompt.score})</div>
    </div>
        <div class="prompt-text"><a href="/conversations/{prompt.id}">{prompt.text}</a></div>
        <div class="flexRight">
            <a href="/user/{prompt.authName}"><b>-{prompt.authName}</b></a> 
            <button on:click={favToggle}>
                {#if isFavAuthor}
                    <i class="fa-solid fa-xl fa-star" style="color: #fecb0e;"></i>
                {:else}
                    <i class="fa-regular fa-xl fa-star" style="color: #0d4576;"></i>
                {/if}
            </button>
        </div>
        <div class="flexRight replyButtonMargin">
            {#if !showReplyForPrompt}
                <button on:click={toggleReplyForm} class="badge variant-filled-primary">Reply</button>
            {/if}
        </div>

    {#if showReplyForPrompt}
        <Reply promptId={prompt.id} on:cancelReply={toggleReplyForm} on:commentAdded={handleNewComment} />
    {/if}

</div>

{#if FailureMessage}
	<ServerMessage isError={true} messageText="Something is broken :-(" />
{/if}

{#if LoginMessage}
  <ServerMessage isError={true} messageText="You'll need to log for that!" />
{/if}

<style>

    .bulbImage {
        width: 80%;
        height: auto;
    }

    .scoreContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center; 
        float: left; 
        margin-right: 10px; 
    }

    .score {
        margin-right: 10px;
        margin-top: 5px;
    }

    .badge {
        margin-bottom: 1px;
    }

    .prompt {
        background-color: white;
        padding: 5px;
        margin-top: 5px;
        margin-left: 1px; 
        border: 2px solid #0b3861; 
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
        border-radius: 5px;
    }

    .flexRight {
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: auto;
        text-align: right;
    }

</style>
