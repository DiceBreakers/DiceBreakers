<script>
	import { createEventDispatcher } from 'svelte';
	import { applyAction, enhance } from '$app/forms'
    import { pb } from '$lib/stores/pocketbase'
	import { currentUser } from '$lib/stores/user';
	import ServerMessage from '$lib/components/serverMessage.svelte';

	let loginSuccessMessage = false;

	const handleLoginClick = (event) => {
		closeMenu();
	};

    const dispatch = createEventDispatcher();

    const closeMenu = () => {
        dispatch('closeMenu');
    };

	$: if ($currentUser) {
    loginSuccessMessage = true;
    setTimeout(() => loginSuccessMessage = false, 2000); // Message display duration
  }

</script>

<div>
<h2>Login:</h2>
	<form
	method="POST"
	action="/login?/login"
	class="card item"
	use:enhance={() => {
	  return async ({ result }) => {
		pb.authStore.loadFromCookie(document.cookie)
		await applyAction(result)
	  }
	}}>
		<input type="email" name="email" placeholder="Email" class="input" autocomplete="email" />
		<input type="password" name="password" placeholder="Password" class="input" />
		<button on:click={handleLoginClick} class="btn btn-sm variant-filled-primary">Login</button>
		<a on:click={closeMenu} href="/reset" class="button btn btn-sm">Forgot pw?</a>
  </form>
  <form class="auth-form" method="post" action="/login?/OAuth2">
	<div>
		<p class="indent">Or</p>
		<button class="btn-auth" type="submit">
		<img class="btn-auth-img" src='/googleSignIn.png' alt='google sign in'/>
		</button>
	</div>
	</form> 
	
 	<div class="register btn btn-lg variant-filled-secondary">
  		<a on:click={closeMenu} href="/register" title="Register Here"><strong>Click here to register!</strong></a>
	</div>
</div>

{#if loginSuccessMessage}
  <ServerMessage isError={false} messageText='Thanks for logging back in, ${currentUser}!' />
{/if}

<style>
	button:hover{
		cursor: pointer;
		text-decoration: underline;
		color: #FFF;
		background-color: #4d4c4c;
		transition: all 0.3s ease-in;
	}

	.btn {
		margin: 5px;
	}
	.btn-auth-img:hover{
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);

	}
	.btn-auth{
		border:0;
		background-color: rgba(84, 81, 81, 0.0);
		padding:.01em;
	}
	.btn-auth:hover{
		border:0;
		padding:.01em;
		text-decoration: none;
		background-color: rgba(84, 81, 81, 0.0);
	}
	
	h2 {
		margin-left: 10px;
		margin-top: 5px;
		margin-bottom: 5px;
	}

	.indent {
		margin-left: 20px;
		margin-top: 5px;
		margin-bottom: 5px;
	}

	.register {
		margin-top: 100px;
	}
</style>