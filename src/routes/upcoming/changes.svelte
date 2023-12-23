<script lang="ts">
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import Vision from './Vision.svelte'
    import ChangeComments from './ChangeComments.svelte';

    export let data;
    
</script>

<div class="body center-text">
	<div class="card p-4 variant-glass-tertiary">
		<div class="card p-4">
            <div class="margin">
                <p>Hello, and thanks for your interest in Dice Breakers! This site is in active development by a hobbyist developer. You can help guide the site by voting for the features/enhancements you would appreciate most, adding input on any of my ideas, or submit your own ideas if you think of something!</p>
            </div>
                <Accordion>
                <AccordionItem>
                    <svelte:fragment slot="summary"><b>My Vision:</b></svelte:fragment>
                    <svelte:fragment slot="content">
                       <Vision />
                    </svelte:fragment>
                </AccordionItem>
                <AccordionItem>
                    <svelte:fragment slot="summary"><b>Help Guide Dice Breakers:</b></svelte:fragment>
                    <svelte:fragment slot="content">
                        <Accordion>
                            <AccordionItem>
                                <svelte:fragment slot="summary">
                                    <b>Suggestions:</b>
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