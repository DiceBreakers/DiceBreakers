<script lang="ts">
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import GuideComments from './GuideComments.svelte';

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
                            <GuideComments {data} type="suggestion" />
                        </svelte:fragment>
                    </AccordionItem>
                    <AccordionItem>
                        <svelte:fragment slot="summary">
                            <b>Bug Report:</b>
                        </svelte:fragment>
                        <svelte:fragment slot="content">
                            <GuideComments {data} type="bugReport" />
                        </svelte:fragment>
                    </AccordionItem>
                </Accordion>
                <div class="charity">
                    <a href="/charity"><b>Charity Discussion:</b></a>
                </div>                
        </div>
    </div>
</div>
        

<style>
    .charity {
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 15px;
    }

    .margin {
        margin: 20px;
    }
</style>