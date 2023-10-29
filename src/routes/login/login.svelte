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
		<input type="email" name="email" placeholder="Email" class="input" autocomplete="email" />
		<input type="password" name="password" placeholder="Password" class="input" />
		<button class="btn btn-sm variant-filled-primary">Login</button>
		<a on:click={closeMenu} href="/reset" class="button btn btn-sm">Forgot pw?</a>
  </form>
  	<div class="register btn btn-lg variant-filled-secondary">
  		<a href="/register" title="Register Here"><strong>Click here to register!</strong></a>
	</div>
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

	.register {
		margin-top: 180px;
	}
</style>