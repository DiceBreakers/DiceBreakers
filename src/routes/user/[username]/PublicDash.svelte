<script lang="ts">    
	import ServerMessage from '$lib/components/serverMessage.svelte';
    import { TabGroup, Tab } from '@skeletonlabs/skeleton';
    import Prompts from './Prompts.svelte'
    import Comments from './Comments.svelte'
    
    export let data;
    
    const profileName = data.username;

    let SuccessMessage = false;
	let FailureMessage = false;
	let ReportMessage = false;
	let LoginMessage = false;
	let promptHiddenMessage = false;
	let authorHiddenMessage = false;

    let tabSet: number = 0;

</script>

<div class="card p-4">
    <div class="card p-4 variant-glass-secondary userDash">
        <h2><b>{profileName}:</b></h2>
      <TabGroup justify="justify-center">
        <Tab bind:group={tabSet} name="Conversations" value={0}>
          <svelte:fragment slot="lead"><b>Conversations</b></svelte:fragment></Tab>
        <Tab bind:group={tabSet} name="Comments" value={1}><b>Comments</b></Tab>
        <!-- Tab Panels --->
        <svelte:fragment slot="panel">
          {#if tabSet === 0}
            <Prompts {data} />
          {:else if tabSet === 1}
            <Comments {data} />
          {/if}
        </svelte:fragment>
      </TabGroup>
    </div>
  </div>
  
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

    h2 {
        font-size: large;
    }

    .userDash {
        min-height: 400px;
    }
  
  </style>