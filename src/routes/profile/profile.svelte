<script>
	import Input from "$lib/components/input.svelte";
    import { currentUser } from '$lib/stores/user'
	import ServerMessage from "$lib/components/serverMessage.svelte";

	let form;

</script>


	<div class="card p-4 body center">
		<form action="?/updateUsername" method="POST"
		class="flex flex-col items-center">
			<h1>Username:</h1>
			<div class="form-control w-full max-w-md">
				<Input id="username" value={$currentUser?.username}/>
			</div>
			<button class="btn btn-sm variant-filled-primary">Change Username</button>
			{#if form?.success}
				<ServerMessage messageText="Username Changed Successfully" />
			{/if}
		</form>
		<form action="?/updateEmail" method="POST"
		class="flex flex-col items-center">
			<h1>Email:</h1>
			<div class="form-control w-full max-w-md">
				<Input id="email" value={$currentUser?.email}/>
			</div>
			<button class="btn btn-sm variant-filled-primary">Change Email</button>      
			{#if form?.success}
				<ServerMessage messageText="Check email to confirm" />
			{/if}
		</form>
			<a href="/reset" class="button btn btn-sm varient-filled-primary">Click here to request a password reset.</a>
	</div>


<style>

    .card {
        padding: 1.5rem;
    }
	.btn {
        margin-bottom: 15px;
    }

	h1 {
		padding-bottom: .5em;
	}


</style>