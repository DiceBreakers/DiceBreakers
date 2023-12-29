<script lang="ts">
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import Basics from './Basics.svelte';
    import CharityComments from './CharityComments.svelte';

 //   export let data;
    
</script>

<div class="body center-text">
	<div class="card p-4 variant-glass-tertiary">
		<div class="card p-4">
            <div class="margin">
                <p>Dice Breakers is committed to being a socially concious company and has pledged that 50% of profits will be donated to various charities.</p>
            </div>
                <Accordion>
                <AccordionItem open>
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
                                    <b>Approved Charities (coming soon)</b>
                                </svelte:fragment>
                                <svelte:fragment slot="content">
                                    Approved Charities Coming Soon!
                                </svelte:fragment>
                            </AccordionItem>
                            <AccordionItem>
                                <svelte:fragment slot="summary">
                                    <b>Proposed Charities (coming soon)</b>
                                </svelte:fragment>
                                <svelte:fragment slot="content">
                                    Proposed Charities Coming Soon!
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