<script lang="ts">
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import ChangeComments from './ChangeComments.svelte';

    export let data;

</script>

<div class="body center-text">
	<div class="card p-4 variant-glass-tertiary">
		<div class="card p-4">
            <div class="margin">
                <p>Hello, and thanks for your interest in Dice Breakers! This site is in active development by a hobby developer. You can help guide the site by voting for the features/enhancements you would appreciate most, adding input on any of my ideas, or submit your own ideas if you think of something!</p>
            </div>
                <Accordion>
                <AccordionItem>
                    <svelte:fragment slot="summary"><b>My Vision:</b></svelte:fragment>
                    <svelte:fragment slot="content">
                        <p>This is currently pure fantasy, but I've always been a fan of direct communication so people aren't surprised when I do something. What do I want to happen with this website? Well, step one is see if I'm able to get the website to be self-sustaining.
                             So far, I've spent about $1,500 for a website that has no revenue source, and that number is only going to grow as I continue to advertise. As much as I enjoy building this website, I'm just a regular guy with no investors and I don't plan to subsidize it forever,
                              so two things are going to happen: Ads are going to be enabled, and I'll introduce a paid membership for people who hate ads. I wanted to do a $1 monthly subscription, but credit card processing fees make that price structure difficult. My current thinking is $2/month, $9/six months, or $12/year.</p>
                        
                        <p>I have no clue what amount of revenue to expect from these changes. I know a lot of people hate ads, and a lot of people hate monthly subscriptions, so maybe I turn these on and I'm still burning money on hosting every month.
                             But, this is my fantasy section, so let's assume profitability! I really want two things in life - I want the time and resources that allow me to be creative, and I want to be able to help people. In light of these goals, Dice Breakers has pledged that 50% of profits will be donated to charity.
                              The National Alliance on Mental Illness will receive 20% of the charity pool, while Dice Breaker's members will have the oppurtunity to vote on how the remaining 80% is allocated.</p>
                       
                        <p>While I'm treating this as my public day dream journal, here is how I picture it working. From January through November, anyone who has spent a dollar will have access to a Charity discussion board where people can discuss and vote on their favorite charities.
                             Then in December, I'll open a poll with the most liked charities throughout the discussion months. Members will be given 1 vote per dollar spent and there be a friendly battle of the charities. Now that I type this out, I think I'm trying to gamify charity?</p>
                        
                        <p>Oh, while I'm rambling, I could set up a Printify account to sell merchandise... Would anyone want a Dice Breakers hoodie? Or fannie pack? Maybe let merch sales be 80% profit to charity... If anyone wanted to help spread awareness for me, I'd want more of that to go towards charity.</p>
                    </svelte:fragment>
                </AccordionItem>
                <AccordionItem>
                    <svelte:fragment slot="summary"><b>Help Guide Dice Breakers:</b></svelte:fragment>
                    <svelte:fragment slot="content">
                        <ChangeComments {data} />
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