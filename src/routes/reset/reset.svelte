<script>
    import ServerMessage from "$lib/components/serverMessage.svelte";
	let form;

</script>

<div class="card p-4 body">
	<div class="flex flex-col items-center h-full w-full">
		<h1>
			Reset Your Password
		</h1>
		<p>We'll send you an email with a link to finish reseting your password.</p>
		<form
			action="?/resetPasswordInit"
			method="POST"
			class="flex flex-col items-center space-y-2 w-full pt-4"
		>
			<div class="form-control w-full max-w-md">
				<label for="email" class="label font-medium pb-1">
					<input type="email" placeholder="Enter Email Address..." id="email" name="email" class="input input-bordered w-full max-w-md" />
			</label>
			</div>
			<div class="center-text">
				<button type="submit" class="btn btn-sm variant-filled-primary">Request Password Reset</button>
			</div>
			{#if form?.success}
				<ServerMessage />
			{/if}
		</form>
	</div>
</div>

<style>
	h1 {
		margin-bottom: 20px;
	}
</style>