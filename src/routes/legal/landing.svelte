<script>
    import TOS from "./tos.svelte";
    import Privacy from "./privacy.svelte";
    import Cookies from "./cookies.svelte";
    import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";
</script>

<div class="body center-text">
	        <div class="card p-4 variant-glass-tertiary">
                <div class="card p-4">
                    <h2><b>Dice Breakers Legal Info:</b></h2>
                    Legal sorts of documents for your viewing pleasure. Probably the most exciting page on this website!
                </div>
            </div>
            <div class="card p-4">
                <div class="card p-4 variant-glass-secondary">
                    <h2>Docs:</h2>
                    <Accordion>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Terms of Service:</svelte:fragment>
                            <svelte:fragment slot="content">
                                <TOS />
                            </svelte:fragment>   
                        </AccordionItem>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Privacy Policy:</svelte:fragment>
                            <svelte:fragment slot="content">
                                <Privacy />
                            </svelte:fragment>   
                        </AccordionItem>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Cookie Policy:</svelte:fragment>
                            <svelte:fragment slot="content">
                                <Cookies />
                            </svelte:fragment>   
                        </AccordionItem>
                        <AccordionItem>
                            <svelte:fragment slot="summary">Cookie Consent:</svelte:fragment>
                            <svelte:fragment slot="content">
                                <div><button class="btn btn-sm variant-filled-primary"
                                    onclick="window.displayPreferenceModal();return false;" id="termly-consent-preferences">
                                    Change Cookie Consent Preferences</button></div>
                            </svelte:fragment>   
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
            <div class="card p-4 variant-glass-tertiary">
				<div class="card p-4">
                    <h3><b>I encourage everyone to read the above policies for details regarding our terms of service, privacy info, and data collection. However, here is a birds-eye view of Dice Breaker's approach to your data-</b></h3>
                    <div>
                        Dice Breakers wants people to ask questions, but we don't care much about your answers. We are not building profiles to sell user data.
                        The site uses cookies to handle security and user preferences, some parts of the site might not work right if you block all cookies. We also run Google Analytics and Adsense which both use cookies. My view of Google's info is anonymous. I use analytics info to evaluate this project and target areas for improvement. Google uses the info for all the things Google does and I understand if you want to opt out of that.
                        Registering for this site requires an email address and password. Again, I'm not selling your email. Your password is hashed on the server before being stored in the database, so nobody at Dice Breakers knows your password.
                        Dice Breakers does not feel the need to send frequent emails. Unless you request an email (e.g. resetting a password), you probably won't hear from us. If we send an un-prompted email, it will be for a major feature enhancement, account security message, or something similarly significant. I'd be surprised if I sent something more than once every few months, if that.
                        If any of this changes down the line, you will be notified in advance.
                    </div>
                </div>
            </div>
</div>

