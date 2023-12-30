<script lang="ts">
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import Basics from './Basics.svelte';
    import CharityComments from './CharityComments.svelte';

    export let data;
    
</script>

<div class="body center-text">
	<div class="card p-4 variant-glass-tertiary">
		<div class="card p-4">
            <div class="margin">
                <p>Dice Breakers is committed to being a socially concious company and has pledged that 50% of profits will be donated to various charities.</p>
            </div>
                <Accordion>
                <AccordionItem>
                    <svelte:fragment slot="summary"><b>How Charities are Selected:</b></svelte:fragment>
                    <svelte:fragment slot="content">
                       <Basics />
                    </svelte:fragment>
                </AccordionItem>
                <AccordionItem>
                    <svelte:fragment slot="summary"><b>Charity Discussion:</b></svelte:fragment>
                    <svelte:fragment slot="content">
                        <Accordion>
                            <AccordionItem>
                                <svelte:fragment slot="summary">
                                    <b>Approved Charities Discussion:</b>
                                </svelte:fragment>
                                <svelte:fragment slot="content">
                                    Here is where members can discuss the charities that will be in the end of year vote.
                                    <CharityComments {data} type="approved" />
                                </svelte:fragment>
                            </AccordionItem>
                            <AccordionItem>
                                <svelte:fragment slot="summary">
                                    <b>Proposed Charities Discussion:</b>
                                </svelte:fragment>
                                <svelte:fragment slot="content">
                                    <div>
                                        Here is where members can propose and discuss the charities they want included in the end of year vote.
                                    </div>
                                    <CharityComments {data} type="proposed" />
                                </svelte:fragment>
                            </AccordionItem>
                        </Accordion>                        
                    </svelte:fragment>
                </AccordionItem>
            </Accordion>
        </div>
    </div>
</div>
        

<style>
    .margin {
        margin: 20px;
    }
</style>