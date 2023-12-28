<script lang="ts">
    import { writable } from 'svelte/store';
    import CommentItem from '$lib/components/CommentItem.svelte';

    export let data;

    let commentsPageData = data.commentsPagination;

    if (data.comments) {
//        console.log('CommentData: exists')
   //     console.log('CommentData:', data.comments)
    }

    let organizedComments = writable<Comment[]>([]); 
    let commentsArray = writable<Comment[]>([]);
    let loading = true;
    let page = 1;
    
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

    if (data && data.comments) {
        try {
            const recordsArray = JSON.parse(data.comments);
            const mappedComments = recordsArray.map(obj => {
                return {
                    authId: obj.expand.author.id,
                    authName: obj.expand.author.username,
                    id: obj.id,
                    promptId: obj.prompt,
                    parent: obj.parent,
                    text: obj.text,
                    isLiked: obj.isLiked,
                    isSuper: obj.isSuper,
                    isFavAuth: obj.isFavAuthor,
                    score: obj.score
                };
            });
            commentsArray.set(mappedComments);
            loading = false;
        } catch (e) {
            console.error("Error parsing data:", e);
            loading = false;
        }
    } else {
        loading = false;
    }

//           console.log('commentsArray:', $commentsArray);    

    function organizeComments(commentsArray: Comment[]): Comment[] {
        const organizedComments = [...commentsArray];
    //    console.log('organizedComments:', organizedComments);
        return organizedComments;
    }

    async function loadMore() {
        const formData = new FormData();
        let type = 'comments';
        formData.append('page', (++page).toString());
        formData.append('type', type);
        formData.append('userName', data.username);

        const response = await fetch('?/loadMore', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            try {
                const responseData = await response.json();
 //               console.log('Response Data:', responseData);
  //              console.log('ResponseDataData:', responseData.data)
        if (responseData.data) {
            const commentsString = responseData.data;
  //          console.log('commentsString:', commentsString);
            if (commentsString) {
                const recordsArray = JSON.parse(commentsString);
 //               console.log('moreRecordsArray:', recordsArray);
                const processingArray = JSON.parse(recordsArray[1])
   //             console.log('processingArray:', processingArray)
                const mappedComments = processingArray.map(obj => {
                    return {
                        text: obj.text,
                        id: obj.id,
                        authName: obj.expand.author.username,
                        authId: obj.expand.author.id,
                        isFavAuth: obj.isFavAuthor,
                        isLiked: obj.isLiked,
                        isSuper: obj.isSuper,
                        score: obj.score
                    };
                });

   //             console.log('moreMappedComments:', mappedComments);
                commentsArray.update(current => [...current, ...mappedComments]);
            } else {
                console.error("No comments data found after parsing:", commentsString);
            }
        } else {
            console.error("Invalid structure in response data:", responseData);
        }
    } catch (error) {
        console.error("Error parsing response data:", error);
    }
} else {
    console.error("Error loading more comments...");
}
}

    $: {organizedComments.set(organizeComments($commentsArray));}

</script>


<div class="card p-4">
    <div class="comments-container center">
        {#each $organizedComments as comment}
            <CommentItem comment={comment} promptId={comment.id} />
        {/each}
        {#if page < commentsPageData.totalPages}
            <div class="badge variant-filled-primary loadMore">
                <button on:click={loadMore}>Load More</button>
            </div>
        {/if}
        {#if $commentsArray.length === 0}
            <div>No comments found...</div>            
        {/if}
    </div>
</div>


<style>
    .loadMore {
        margin-top: 10px;
        width: 20%;
    }
 
</style>