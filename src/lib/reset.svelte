<script>
	let form;
    import SuccessMessage from "./components/successMessage.svelte";
</script>

<div class="flex flex-col items-center h-full w-full">
	<h2 class="mt-2 text-center text-3xl font-bold tracking-tight text-base-content">
		Reset Your Password
	</h2>
	<p class="text-center mt-1">We'll send you an email with a link to reset your password.</p>
	<form
		action="?/resetPassword"
		method="POST"
		class="flex flex-col items-center space-y-2 w-full pt-4"
	>
		<div class="form-control w-full max-w-md">
			<label for="email" class="label font-medium pb-1">
				<span class="label-text">Email</span>
				<input type="email" id="email" name="email" class="input input-bordered w-full max-w-md" />
        </label>
		</div>
		<div class="center-text">
			<button type="submit" class="btn btn-sm variant-filled-primary">Request Password Reset</button>
		</div>
		{#if form?.success}
            <SuccessMessage />
		{/if}
	</form>
</div>