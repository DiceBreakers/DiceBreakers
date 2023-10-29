<script>
	import Input from "../../lib/components/input.svelte";
    import { currentUser } from '$lib/stores/user'

</script>

<div class="body center-text">
	<div class="card p-4 variant-glass-secondary">
		<div class="card p-4">
			<form action="?/updateUsername" method="POST">
				<h1>Username:</h1><Input id="username" value={$currentUser?.username}/>
				<button class="btn btn-sm variant-filled-primary">Change Username</button>
			</form>
			<form action="?/updateEmail" method="POST">
				<h1>Email:</h1>
				<Input id="email" value={$currentUser?.email}/>
				<button class="btn btn-sm variant-filled-primary">Change Email</button>
			</form>
				<a href="/reset" class="button btn btn-sm varient-filled-primary">Click here to request a password reset.</a>
		</div>
	</div>	
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