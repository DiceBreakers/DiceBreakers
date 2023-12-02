<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let promptId;
    export let parentId: string | null = null;

    const dispatch = createEventDispatcher();
    let replyText = '';

    async function submitReply() {
    if (!replyText.trim()) return;

    const formData = new FormData();
    formData.append('text', replyText);
    formData.append('promptId', promptId);
    formData.append('parentId', parentId || '');

    try {
        const response = await fetch('?/submitReply', { 
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('Reply submitted successfully');
            // Handle successful submission
            dispatch('replySubmitted');
        } else {
            console.error('Failed to submit reply');
            // Handle error
        }
    } catch (error) {
        console.error('Error submitting reply:', error);
        // Handle error
    }

    replyText = '';
}

    function cancelReply() {
        dispatch('cancelReply');
    }

</script>

<form on:submit|preventDefault={submitReply} class="reply-form">
    <textarea bind:value={replyText} placeholder="Write a reply..." class="reply-textarea"></textarea>
    <div class="button-group">
        <button type="button" on:click={cancelReply} class="button badge variant-filled-error">Cancel</button>
        <button type="submit" class="button badge variant-filled-primary">Reply</button>
    </div>
</form>


<style>
    .reply-form {
        display: flex;
        flex-direction: column;
    }

    .reply-textarea {
        margin-bottom: 10px; 
        width: 100%;
    }

    .button-group {
        display: flex;
        justify-content: space-between;
    }

    .button {
        margin-bottom: 10px;
        margin-left: 25px;
        margin-right: 25px;
    }

</style>