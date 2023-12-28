<script lang="ts">
    import { writable } from 'svelte/store';
    import PromptItem from '$lib/components/PromptItem.svelte';

    export let data;

    let promptsPageData = data.promptsPagination;

 //   console.log('promptsPageData:', promptsPageData)

    if (data.prompts) { 
    //    console.log('ConversationData:', data.prompts)
//        console.log('ConversationData: exists')
    }

    let organizedPrompts = writable<Prompt[]>([]); 
    let promptArray = writable<Prompt[]>([]);
    let page = 1;

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
    
    if (data && data.prompts) {
    //    console.log('data.prompts:', data.prompts)
        try {
            const recordsArray = JSON.parse(data.prompts);
  //          console.log('recordsArray:', recordsArray)
            const mappedPrompts = recordsArray.map(obj => {
                return {
                    text: obj.prompt,
                    id: obj.id,
                    authName: obj.expand.author.username,
                    authId: obj.expand.author.id,
                    isFavAuth: obj.isFavAuthor,
                    isLiked: obj.isLiked,
                    isSuper: obj.isSuper,
                    score: obj.score
                };
            });
            promptArray.set(mappedPrompts);
 //           console.log('mappedPrompts:', mappedPrompts)
 //           console.log('promptArray:', promptArray)
        } catch (e) {
            console.error("Error parsing data:", e);
        }
    } else {
        console.error("Sorry, I don't know what happened.");
    }   

    function organizePrompts(promptArray: Prompt[]): Prompt[] {
        const organizedPrompts = [...promptArray];
    //    console.log('organizedComments:', organizedComments);
        return organizedPrompts;
    }

    async function loadMore() {
        const formData = new FormData();
        let type = 'prompts';
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
  //              console.log('Response Data:', responseData);
 //               console.log('ResponseDataData:', responseData.data)
        if (responseData.data) {
            const promptsString = responseData.data;
  //          console.log('promptsString:', promptsString);
  //          const promptsData = JSON.parse(promptsString).prompts;
  //          console.log('Parsed Prompts Data:', promptsData);
            if (promptsString) {
                const recordsArray = JSON.parse(promptsString);
 //               console.log('moreRecordsArray:', recordsArray);
                const processingArray = JSON.parse(recordsArray[1])
   //             console.log('processingArray:', processingArray)
                const mappedPrompts = processingArray.map(obj => {
                    return {
                        text: obj.prompt,
                        id: obj.id,
                        authName: obj.expand.author.username,
                        authId: obj.expand.author.id,
                        isFavAuth: obj.isFavAuthor,
                        isLiked: obj.isLiked,
                        isSuper: obj.isSuper,
                        score: obj.score
                    };
                });

  //              console.log('moreMappedPrompts:', mappedPrompts);
                promptArray.update(current => [...current, ...mappedPrompts]);
            } else {
                console.error("No prompts data found after parsing:", promptsString);
            }
        } else {
            console.error("Invalid structure in response data:", responseData);
        }
    } catch (error) {
        console.error("Error parsing response data:", error);
    }
} else {
    console.error("Error loading more prompts...");
}
}

    $: {organizedPrompts.set(organizePrompts($promptArray));}

</script>

<div class="card p-4">
    <div class="prompts-container center">
        {#each $organizedPrompts as prompt}
            <PromptItem prompt={prompt} />
        {/each}
        {#if page < promptsPageData.totalPages}
            <div class="badge variant-filled-primary loadMore">
                <button on:click={loadMore}>Load More</button>
            </div>
        {/if}
        {#if $promptArray.length === 0}
            <div>They haven't started any conversations...</div>            
        {/if}
    </div>
</div>

<style>

    .loadMore {
        margin-top: 10px;
        width: 20%;
    }

</style>