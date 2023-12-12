<script>
    import { writable } from 'svelte/store';
    import CommentItem from './CommentItem.svelte';
    import Reply from './Reply.svelte';

    export let comment;
    export let promptId;

    const showReplyForm = writable(false);

    function hasChildren(comment) {
        return comment.children && comment.children.length > 0;
    }

    function toggleReplyForm() {
        showReplyForm.update(current => !current);
    }

    function handleNewComment(event) {
    const newComment = event.detail.newComment;
    if (comment.id === newComment.parent) {
        // Use the spread operator to trigger reactivity
        comment.children = [...(comment.children || []), newComment];
    }
}

</script>

<div class="comment">
        <div class="comment-text">{comment.text}</div>
        <p class="comment-author">-{comment.authName}</p>
    {#if !$showReplyForm}
        <button on:click={toggleReplyForm} class="badge variant-filled-primary">Reply</button>
    {/if}

    {#if $showReplyForm}
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

<style>

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

    .comment-author {
        margin-bottom: 1px;
        text-align: left;
    }

    .child-comments {
        position: relative;
    }

</style>
