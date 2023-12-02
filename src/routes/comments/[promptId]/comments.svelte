<script lang="ts">
    import { writable } from 'svelte/store';
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
	import ServerMessage from '$lib/components/serverMessage.svelte';
    import { currentUser } from '$lib/stores/user';
    import CommentItem from './CommentItem.svelte';
    import Reply from './Reply.svelte';
	
    export let data;

   // console.log(data)

    const showReplyForm = writable(false);

    let comment;
    let promptId;


    let SuccessMessage = false;
	let FailureMessage = false;
	let ReportMessage = false;
	let LoginMessage = false;
	let promptHiddenMessage = false;
	let authorHiddenMessage = false;

    type Prompt = {
        text: string;
        id: string;
        authName: string;
        authId: string;
        isFavAuth: boolean;
        isLiked: boolean;
        isSuper: boolean;
        score: number;
    }

    type Comment = {
        text: string;
        id: string;
        authName: string;
        authId: string;
        promptId: string;
        parent: string;
        isFavAuth: boolean;
        isLiked: boolean;
        isSuper: boolean;
        score: number;
        children?: Comment[];
    }

    let prompt = writable<Prompt>({
        text: '',
        id: '',
        authName: '',
        authId: '',
        isFavAuth: false,
        isLiked: false,
        isSuper: false,
        score: 0
    });

    let commentArray = writable<Comment[]>([]);
    let loading = true;

    if (data && data.prompt) {
        try {
            const promptData = JSON.parse(data.prompt);
            console.log('promptData:', promptData)
            prompt.set({
                id: promptData.id,
                text: promptData.prompt,
                authName: promptData.expand.author.username,
                authId: promptData.expand.author.id,
                isFavAuth: promptData.isFavAuthor,
                isLiked: promptData.isLiked,
                isSuper: promptData.isSuper,
                score: promptData.score
            });
            
            loading = false;
        } catch (e) {
            console.error("Error parsing data:", e);
            loading = false;
        }
    } else {
        loading = false;
    }

    if (data && data.records) {
        try {
            const recordsArray = JSON.parse(data.records);
            const mappedComments = recordsArray.map(obj => {
                return {
                    authId: obj.expand.author.id,
                    authName: obj.expand.author.username,
                    id: obj.id,
                    parent: obj.parent,
                    text: obj.text,
                    isLiked: obj.isLiked,
                    isSuper: obj.isSuper,
                    isFavAuth: obj.isFavAuthor,
                    score: obj.score
                };
            });
            commentArray.set(mappedComments);
            loading = false;
        } catch (e) {
            console.error("Error parsing data:", e);
            loading = false;
        }
    } else {
        loading = false;
    }

    console.log($commentArray);

function organizeComments(commentsArray: Comment[]): Comment[] {
    let organizedComments: Comment[] = [];
    let commentMap: Record<string, Comment> = {};

    commentsArray.forEach(comment => {
        commentMap[comment.id] = { ...comment, children: [] };
    });

    commentsArray.forEach(comment => {
        if (comment.parent) {
            commentMap[comment.parent].children!.push(commentMap[comment.id]);
        } else {
            organizedComments.push(commentMap[comment.id]);
        }
    });

    Object.values(commentMap).forEach(comment => {
        comment.children!.sort((a, b) => b.score - a.score);
    });

    organizedComments.sort((a, b) => b.score - a.score);

    return organizedComments;
}

    let organizedComments = organizeComments($commentArray);

async function pVote() {
    if (!$currentUser) {
      LoginMessage = true;
      setTimeout(() => {
        LoginMessage = false;
      }, 1500);
      return;
    }

    if (!$prompt.id) return;

        prompt.update(current => {
            let newScore = current.score;
            let newIsLiked = current.isLiked;
            let newIsSuper = current.isSuper;

            if (current.isSuper) {
                newIsLiked = false;
                newIsSuper = false;
                newScore -= 5;
            } else if (current.isLiked) {
                newIsSuper = true;
                newIsLiked = false;
                newScore += 4;
            } else {
                newIsLiked = true;
                newScore += 1;
            }

            return { ...current, score: newScore, isLiked: newIsLiked, isSuper: newIsSuper };
        });

    console.log('pScore', $prompt.score)

    const formData = new FormData();
    formData.append('promptId', $prompt.id);

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

  if (!$prompt.authId) return;

    prompt.update(current => {
        return { ...current, isFavAuth: !current.isFavAuth };
    });

  const formData = new FormData();
  formData.append('authId', $prompt.authId);

  try {
    const response = await fetch('?/favAuth', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('Favorite Toggled Successfully');
      console.log('prompt.isFavAuth:', $prompt.isFavAuth)
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

function toggleReplyForm() {
        showReplyForm.update(current => !current);
    }

 $: bulbImage = $prompt?.isSuper ? '/bulb2.png' :
                   $prompt?.isLiked ? '/bulb1.png' : '/bulb0.png';

</script>


<div class="card p-4">
    <div class="comments-container">
        <div class="promptContainer">
            <div class="scoreContainer">
                <button on:click={pVote}>
                    <img alt="Bulb Rating" src={bulbImage} class="bulbImage">
                </button>
                <div class="score" use:popup={{ event: 'hover', target: 'scoreTT', placement: 'right'}}>
                    ({$prompt.score})
                </div>
            </div>
            <div class="prompt">
                {$prompt.text}
            </div>
            <div class="author">
                <b>-{$prompt.authName}</b> 
                <button on:click={favToggle}>
                    {#if $prompt.isFavAuth}
                        <i class="fa-solid fa-xl fa-star" style="color: #fecb0e;"></i>
                    {:else}
                        <i class="fa-regular fa-xl fa-star" style="color: #0d4576;"></i>
                    {/if}
                </button>
            </div>
        </div>
        {#each organizedComments as comment}
            <CommentItem comment={comment} promptId={$prompt.id} />
        {/each}
        {#if $commentArray.length === 0}
            <div>No comments yet... Be the first?</div>
            <div class="button"><button on:click={toggleReplyForm} class="badge variant-filled-primary">Reply</button></div>
            {#if $showReplyForm}
                <Reply promptId={$prompt.id} on:cancelReply={toggleReplyForm} />
            {/if}
        {/if}
    </div>
</div>

<!-- Popup Menus -->
<div class="popup scoreTT" data-popup="scoreTT">
    {#if $prompt.score==1}
        Like
    {:else}
        Likes
    {/if}
</div>


<style>
.author {
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: auto;
    text-align: right;
}

.promptContainer {
    display: flex;
    align-items: center;
    flex-direction: column; /* Stack items vertically */
}

.prompt {
    text-align: center;
    margin-top: 10px;
    font-size:large;
}

.scoreContainer {
    display: flex;
    align-items: center; 
    flex-direction: column;
}

.button {
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>