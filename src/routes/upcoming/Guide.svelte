<script lang="ts">
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import ChangeComments from './ChangeComments.svelte';

    export let data;
    
</script>

<div class="body center-text">
	<div class="card p-4 variant-glass-tertiary">
		<div class="card p-4">
            <div class="margin">
                <p>Hello, and thanks for your interest in Dice Breakers! This site is in active development by a hobbyist developer. Want to support this site? The best way is to tell your friends! You can also help guide the site by voting for the features/enhancements you would appreciate most, adding input on any of my ideas, or submit your own ideas if you think of something!</p>
                <br>
                <p>Want to be extra supportive? <a href="https://shop.dicebreakers.app"><b>Visit our store</b></a> and see if anything strikes your fancy!</p>
            </div>
            <h2><b>Help Guide Dice Breakers:</b></h2>
                <Accordion>
                    <AccordionItem>
                        <svelte:fragment slot="summary">
                            <b>App Suggestions:</b>
                        </svelte:fragment>
                        <svelte:fragment slot="content">
                            <ChangeComments {data} type="suggestion" />
                        </svelte:fragment>
                    </AccordionItem>
                    <AccordionItem>
                        <svelte:fragment slot="summary">
                            <b>Bug Report:</b>
                        </svelte:fragment>
                        <svelte:fragment slot="content">
                            <ChangeComments {data} type="bugReport"/>
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