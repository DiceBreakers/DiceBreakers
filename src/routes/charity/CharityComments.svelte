<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { writable } from 'svelte/store';
	import ServerMessage from '$lib/components/serverMessage.svelte';
    import { currentUser } from '$lib/stores/user';
    import CommentItem from '$lib/components/CommentItem.svelte'
    import Reply from '$lib/components/Reply.svelte';
	
    export let data;
    export let type;

   // console.log(data)
   // console.log(type)

    const dispatch = createEventDispatcher();

    let queryId = type === 'approved' ? 'tr7djwhobfpudba' : '4537ifyx9pijbab';

    let approvedArray = writable<Comment[]>([]);
    let proposedArray = writable<Comment[]>([]);

    let loading = true;
    let showReplyForm = false;
    let SuccessMessage = false;
	let FailureMessage = false;
	let ReportMessage = false;
	let LoginMessage = false;
	let promptHiddenMessage = false;
	let authorHiddenMessage = false;

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

    if (data && data.proposedRecords) {
        try {
            const recordsArray = JSON.parse(data.propsedRecords);
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
            proposedArray.set(mappedComments);
            loading = false;
        } catch (e) {
            console.error("Error parsing data:", e);
            loading = false;
        }
    } else {
        loading = false;
    }

    if (data && data.approvedRecords) {
        try {
            const recordsArray = JSON.parse(data.approvedRecords);
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
            approvedArray.set(mappedComments);
            loading = false;
        } catch (e) {
            console.error("Error parsing data:", e);
            loading = false;
        }
    } else {
        loading = false;
    }

 //   console.log($commentArray);
 //   console.log($bugReportArray);    

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

function addNewComment(newComment) {
    const arrayToUpdate = type === 'approved' ? approvedArray : proposedArray;

    arrayToUpdate.update(currentEntries => {
        let updatedEntries = JSON.parse(JSON.stringify(currentEntries));

        if (newComment.parent) {
            const parentIndex = updatedEntries.findIndex(entry => entry.id === newComment.parent);
            if (parentIndex !== -1) {
                updatedEntries[parentIndex].children = [...(updatedEntries[parentIndex].children || []), newComment];
            }
        } else {
            updatedEntries.push(newComment);
        }

        return updatedEntries;
    });
}


function toggleReplyForm() {
    if (!$currentUser) {
      LoginMessage = true;
      setTimeout(() => {
        LoginMessage = false;
      }, 1500);
      return;
    }
    showReplyForm = !showReplyForm;
    }



$: organizedData = organizeComments(type === 'approved' ? $approvedArray : $proposedArray);

$: buttonLabel = type === 'proposed' ? 'Submit Charity Suggestion' : 'Submit Bug Report';

</script>

<div class="card p-4">
    <div class="comments-container">
        {#if type==="proposed"}
            <div class="button alignRight replyButtonMargin"><button on:click={toggleReplyForm} class="badge variant-filled-primary">{buttonLabel}</button></div>
        {/if}
        {#if showReplyForm}
            <Reply promptId='{queryId}' on:cancelReply={toggleReplyForm} on:commentAdded={e => addNewComment(e.detail.newComment)}/>
        {/if}
        {#each organizedData as comment}
            <CommentItem comment={comment} promptId='{queryId}' />
        {/each}
    </div>
</div>

<!-- Server Messages -->

{#if SuccessMessage}
	<ServerMessage />
{/if}

{#if ReportMessage}
	<ServerMessage messageText="Thanks, we will review your report."/>
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


<style>

    .button {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .alignRight {
        text-align: right;
    }

    .alignRight button {
        margin-left: auto;
    }

</style>