<script>

  import { onMount } from 'svelte';
  import Header from '$lib/components/header.svelte';
  import ServerMessage from "$lib/components/serverMessage.svelte";
  import Footer from '$lib/components/footer.svelte';
  let form;
  let token;
  export let data;

  // Use onMount to access the token when the component is fully initialized
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
    <div class="flex flex-col items-center h-full w-full">
      <h2>
        Reset Your Password
      </h2>
      <p>Set and confirm new password:</p>
      <form
        action="?/resetPassword"
        method="POST"
        class="flex flex-col items-center w-full m2">
          <div class="form-control w-full max-w-md">
              <input type="password" name="password" placeholder="Password" class="input m2" />
              <input type="password" name="passwordConfirm" placeholder="Confirm Password" class="input m2" />
              <hidden name="token" value={token} class="input" />
          </div>
          <div>
            <button type="submit" class="btn btn-sm variant-filled-primary m2">Complete Password Reset</button>
          </div>
        {#if form?.success}
                <ServerMessage />
        {/if}
      </form>
    </div>
  </div>
</div>
  
<div class="bg_gradient">
  <Footer />
</div>

<style>
  .m2 {
    margin: 2px;
  }
</style>