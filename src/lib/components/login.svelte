<script>
	import { applyAction, enhance } from '$app/forms'
    import { pb } from '$lib/pocketbase'

	export let showMenu = false;

    const closeMenu = () => {
        showMenu = false;
    }

</script>
<div class="center">
<h2>Login:</h2>
	<form
	method="POST"
	action="/login"
	class="card item"
	use:enhance={() => {
	  return async ({ result }) => {
		pb.authStore.loadFromCookie(document.cookie)
		await applyAction(result)
	  }
	}}>
		<input type="email" name="email" placeholder="Email" class="input" />
	  <input type="password" name="password" placeholder="Password" class="input" />
	  <button class="btn btn-sm variant-filled-primary">Login</button>
	  <a on:click={closeMenu} href="/reset" class="button btn btn-sm varient-filled-primary">Forgot pw?</a>
  </form>
  <h2>or register:</h2>
  <form
  method="POST"
  action="/register"
  class="card item"
  use:enhance={() => {
	return async ({ result }) => {
	  pb.authStore.loadFromCookie(document.cookie)
	  await applyAction(result)
	}
  }}>
	<input type="email" name="email" placeholder="Email" class="input" />
	<input type="password" name="password" placeholder="Password" class="input" />
	<input type="password" name="passwordConfirm" placeholder="Confirm Password" class="input" />
	<button class="btn btn-sm variant-filled-primary">Register</button>
</form>
</div>

<style>
	.center {
  margin: auto;
  display: block;
  max-width: 700px;
}
</style>