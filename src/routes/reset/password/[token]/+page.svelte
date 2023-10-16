<script>

  import { onMount } from 'svelte';
  import Header from '$lib/components/header.svelte';
  import SuccessMessage from "$lib/components/successMessage.svelte";
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
<div class="body card p-4 variant-glass-secondary">
  <div class="flex flex-col items-center h-full w-full">
    <h2 class="mt-2 text-center text-3xl font-bold tracking-tight text-base-content">
      Reset Your Password
    </h2>
    <p class="text-center mt-1">Set and confirm new password:</p>
    <form
      action="?/resetPassword"
      method="POST"
      class="flex flex-col items-center space-y-2 w-full pt-4"
    >
      <div class="form-control w-full max-w-md">
          <input type="password" name="password" placeholder="Password" class="input" />
          <input type="password" name="passwordConfirm" placeholder="Confirm Password" class="input" />
          <hidden name="token" value={token} class="input" />
      </div>
      <div class="center-text">
        <button type="submit" class="btn btn-sm variant-filled-primary">Complete Password Reset</button>
      </div>
      {#if form?.success}
              <SuccessMessage />
      {/if}
    </form>
  </div>
</div>
<div class="bg_gradient">
  <Footer />
</div>
