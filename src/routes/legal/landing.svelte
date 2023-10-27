<script>
    import Privacy from "./privacy.svelte";
    import Cookies from "./cookies.svelte";
    import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";
</script>

<div class="body center-text">
	        <div class="card p-4 variant-glass-tertiary">
                <div class="card p-4">
                    <h2><b>Dice Breakers Legal Info:</b></h2>
                    Legal Documents for your viewing pleasure. Probably the most exciting page on this website!
                </div>
            </div>
            <div class="card p-4">
                <div class="card p-4 variant-glass-secondary">
                    <h2>Docs:</h2>
                    <Accordion autocollapse>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Terms of Service</svelte:fragment>
                            <svelte:fragment slot="content">
                                <div>Terms Of Service here!</div>
                            </svelte:fragment>   
                        </AccordionItem>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Privacy Policy</svelte:fragment>
                            <svelte:fragment slot="content">
                                <Privacy />
                            </svelte:fragment>   
                        </AccordionItem>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Cookie Policy</svelte:fragment>
                            <svelte:fragment slot="content">
                                <Cookies />
                            </svelte:fragment>   
                        </AccordionItem>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Change Cookie Consent</svelte:fragment>
                            <svelte:fragment slot="content">
                                <div><a href="#" onclick="window.displayPreferenceModal();return false;" id="termly-consent-preferences">Consent Preferences</a></div>
                            </svelte:fragment>   
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
            <div class="card p-4 variant-glass-tertiary">
				<div class="card p-4">
                    <h3>I encourage everyone to read the above policies for details regarding our terms of service, privacy info, and data collection. However, here is a birds-eye view of Dice Breaker's approach to your data-</h3>
                    <div>
                        Dice Breakers wants people to ask questions, but we don't care much about your answers. We are not building profiles to sell user data.
                        The site uses cookies to handle security and user preferences, some parts of the site might not work right if you block all cookies. We also run Google Analytics and Adsense which use cookies. My view of Google's info is anonymous. I use analytics info to evaluate this project and target areas for improvement. Google uses the info for all the things Google does.
                        Registering for this site requires an email address and password. Again, I'm not selling your email. Your password is hashed on the server before being saved to the database, so nobody at Dice Breakers can see your password.
                        Dice Breakers does not feel the need to send regular emails. Unless you request an email (e.g. reseting a password), you probably won't hear from us. If we send an un-prompted email, it will be for a major feature enhancement, account security message, or something similarly significant.
                        If any of this data philosophy changes down the line, you will be notified in advance.
                    </div>
                </div>
            </div>
</div>

<style>

</style>

