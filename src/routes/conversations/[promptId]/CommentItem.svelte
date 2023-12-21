<script>
    import { currentUser } from '$lib/stores/user';
    import { authorFavorites } from '$lib/stores/authors';
    import CommentItem from './CommentItem.svelte';
    import Reply from './Reply.svelte';
	import ServerMessage from '$lib/components/serverMessage.svelte';

    export let comment;
    export let promptId;

    let LoginMessage = false;
    let FailureMessage = false;

    let showReplyForComment = false;

    function hasChildren(comment) {
        return comment.children && comment.children.length > 0;
    }

    function toggleReplyForm() {
        showReplyForComment = !showReplyForComment;
    }

    function handleNewComment(event) {
    const newComment = event.detail.newComment;

    // Set the favorite status for the new comment
    newComment.isFavAuth = $authorFavorites[newComment.authId] || false;

    if (comment.id === newComment.parent) {
        // Add the new comment to the children of the current comment
        comment.children = [...(comment.children || []), newComment];
    }
}


    function addCommentToCorrectPlace(comments, newComment) {
        // Set the favorite status for the new comment
        newComment.isFavAuth = $authorFavorites[newComment.authId] || false;

        if (newComment.parent) {
            // If the new comment has a parent, find the parent and add the new comment to its children
            for (let comment of comments) {
                if (comment.id === newComment.parent) {
                    comment.children = [...(comment.children || []), newComment];
                    return;
                }
                if (comment.children) {
                    addCommentToCorrectPlace(comment.children, newComment);
                }
            }
        } else {
            // If the new comment is a top-level comment, add it directly to the comments array
            comments.push(newComment);
        }
    }

    // Update nested comments recursively
    function updateNestedComments(comments, newComment) {
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === newComment.parent) {
                comments[i].children = [...(comments[i].children || []), newComment];
                return;
            } else if (comments[i].children) {
                updateNestedComments(comments[i].children, newComment);
            }
        }
    }


async function cVote() {
    if (!$currentUser) {
      LoginMessage = true;
      setTimeout(() => {
        LoginMessage = false;
      }, 1500);
      return;
    }

    if (!comment.id) return;

    let newScore = comment.score;
    let newIsLiked = comment.isLiked;
    let newIsSuper = comment.isSuper;

    if (comment.isSuper) {
        newIsLiked = false;
        newIsSuper = false;
        newScore -= 5;
    } else if (comment.isLiked) {
        newIsSuper = true;
        newIsLiked = false;
        newScore += 4;
    } else {
        newIsLiked = true;
        newScore += 1;
    }

    comment = { ...comment, score: newScore, isLiked: newIsLiked, isSuper: newIsSuper };

    console.log('cScore', comment.score)

    const formData = new FormData();
    formData.append('commentId', comment.id);

    try {
      const response = await fetch('?/cVote', {
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

    if (!comment.authId) return;

    authorFavorites.toggleFavorite(comment.authId);

    const formData = new FormData();
    formData.append('authId', comment.authId);

    try {
        const response = await fetch('?/favAuth', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Server response not OK');
        }

        console.log('Favorite Toggled Successfully');
    } catch (error) {
        console.error('An error occurred:', error);
        FailureMessage = true;
        setTimeout(() => {
            FailureMessage = false;
        }, 1500);
    }
}

    $: isFavAuthor = $authorFavorites[comment.authId] || false;
    $: bulbImage = comment.isSuper ? '/bulb2.png' :
                   comment.isLiked ? '/bulb1.png' : '/bulb0.png';

</script>

<div class="comment">
    <div class="scoreContainer">
        <button on:click={cVote}>
            <img alt="Bulb Rating" src={bulbImage} class="bulbImage">
        </button>
        <div class="score">({comment.score})</div>
    </div>
        <div class="comment-text">{comment.text}</div>
        <div class="flexRight">
            <b>-{comment.authName}</b> 
            <button on:click={favToggle}>
                {#if isFavAuthor}
                    <i class="fa-solid fa-xl fa-star" style="color: #fecb0e;"></i>
                {:else}
                    <i class="fa-regular fa-xl fa-star" style="color: #0d4576;"></i>
                {/if}
            </button>
        </div>
        <div class="flexRight replyButtonMargin">
            {#if !showReplyForComment}
                <button on:click={toggleReplyForm} class="badge variant-filled-primary">Reply</button>
            {/if}
        </div>
        


    {#if showReplyForComment}
        <Reply promptId={promptId} parentId={comment.id} on:cancelReply={toggleReplyForm} on:commentAdded={handleNewComment} />
    {/if}

    {#if hasChildren(comment)}
        <div class="child-comments">
            {#each comment.children as childComment}
                <CommentItem comment={childComment} promptId={promptId}/>
            {/each}
        </div>
    {/if}
</div>


{#if FailureMessage}
	<ServerMessage isError={true} messageText="Something is broken :-(" />
{/if}

{#if LoginMessage}
  <ServerMessage isError={true} messageText="You'll need to log in first!" />
{/if}

<style>

    .bulbImage {
        width: 80%;
        height: auto;
    }

    .scoreContainer {
        display: flex;
        flex-direction: column;
        align-items: center; /* Center items horizontally */
        justify-content: center; /* Center items vertically */
        float: left; /* Position to the left */
        margin-right: 10px; /* Space between the scoreContainer and the comment text */
    }

    .score {
        margin-right: 10px;
        margin-top: 5px;
    }

    .badge {
        margin-bottom: 1px;
    }

    .comment {
        background-color: white;
        padding: 5px;
        margin-top: 5px;
        margin-left: 1px; 
        border: 1px solid #ccc; 
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
        border-radius: 5px;
    }

    .flexRight {
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: auto;
        text-align: right;
    }

    .child-comments {
        position: relative;
    }

</style>
