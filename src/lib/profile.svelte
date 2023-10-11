<script>
	import Input from "./components/input.svelte";
    import { currentUser } from '$lib/stores/user'

	// - unused? - export let data
</script>

<div class="body center-text">
	<div class="card p-4 variant-glass-secondary">
		<div class="card p-4">
			<form action="?/updateUsername" method="POST">
				<h2><Input id="username" label="Username:" value={$currentUser?.username}/></h2>
				<button class="btn btn-sm variant-filled-primary">Change Username</button>
			</form>
			<form action="?/updateEmail" method="POST">
				<h2><Input id="email" label="Email:" value={$currentUser?.email}/></h2>
				<button class="btn btn-sm variant-filled-primary">Change Email</button>
			</form>
			<form action="?/updatePassword" method="POST">
				<h2><Input label="Current Password:" id="oldPassword" type="password" required /></h2>				
				<h2><Input label="New Password:" id="password"  type="password" required /></h2>
				<h2><Input label="Confirm:" id="passwordConfirm" type="password" required /></h2>
				<button class="btn btn-sm variant-filled-primary">Change Password</button>
			</form>
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
</style>