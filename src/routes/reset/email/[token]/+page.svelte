<script>

  import { onMount } from 'svelte';
  import Header from '$lib/components/header.svelte';
  import ServerMessage from "$lib/components/serverMessage.svelte";
  import Footer from '$lib/components/footer.svelte';
  let form;
  let token;
  export let data;

  onMount(() => {
    token = data.props.token;
    console.log({ token });
  });

</script>

<div class="bg_gradient">
  <Header />
</div>

<div class="bg_gradient">
  <div class="body card p-4">
    <div class="flex flex-col items-center w-full">
      <h2>
        Change Email
      </h2>
      <p class="text-center">Confirm password to set new email:</p>
      <form
        action="?/confirmEmail"
        method="POST"
        class="flex flex-col items-center space-y-2 w-full pt-4"
      >
        <div class="form-control w-full max-w-md">
            <input type="password" name="password" placeholder="Enter Current Password..." class="input" />
            <hidden name="token" value={token} class="input" />
        </div>
        <div class="center-text">
          <button type="submit" class="btn btn-sm variant-filled-primary">Complete Email Change</button>
        </div>
        {#if form?.success}
                <ServerMessage messageText="New Email Confirmed" />
        {/if}
      </form>
    </div>
  </div>
</div>
<div class="bg_gradient_footer">
  <Footer />
</div>

<style>
  	.body {
		padding: 2em;
	}
</style>