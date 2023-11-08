<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { pb } from '$lib/stores/pocketbase';
  import ServerMessage from '$lib/components/serverMessage.svelte';
  import TOS from '../legal/tos.svelte';
  let tosChecked = false;
  let TOSMessage = false;

  const handleSubmit = async (event) => {
    if (!tosChecked) {
      TOSMessage = true;
      setTimeout(() => {
            TOSMessage = false;
        }, 1500);
    } else {
      pb.authStore.loadFromCookie(document.cookie);
      await applyAction(event.result);
    }
  };
</script>

{#if TOSMessage}
  <ServerMessage isError={true} messageText="Must agree to our TOS" />
{/if}

<div class="center body card p-4">
  <h2>Enter email and password to register:</h2>
  <form
    method="POST"
    action="/register"
    class="card item"
    use:enhance={() => {
      return async ({ result }) => {
        pb.authStore.loadFromCookie(document.cookie);
        await applyAction(result);
      }
    }}
    on:submit={handleSubmit}>
    <input type="email" name="email" placeholder="Email" class="input" />
    <input type="password" name="password" placeholder="Password" class="input" />
    <input type="password" name="passwordConfirm" placeholder="Confirm Password" class="input" />
    <label>
      <input
        name="TOS"
        class="checkbox checkboxSize"
        type="checkbox"
        bind:checked={tosChecked}
        title="Terms of Service" />
      Click to confirm you agree to our <a href="/legal" title="Terms of Service">Terms of Service.</a>
    </label>
    <button class="btn btn-sm variant-filled-primary">Register</button>
  </form>
</div>


<style>
  .btn {
		  margin: 5px;
	}

	.center {
      margin: auto;
      display: block;
      max-width: 700px;
  }
</style>