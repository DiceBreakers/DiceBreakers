<script>
	export let value = '';
	export let placeholder = '';
	export let id;
	export let label = ''; // Set a default value for label
	export let type = 'text';
	export let disabled = false;
	export let required = false;
</script>

<div class="form-control w-full max-w-lg mb-2">
	{#if label}
		<label for={id} class="label font-medium pb-1">
			<span class="label-text">{label}</span>
		</label>
	{/if}
	<input
		class="input input-bordered w-full max-w-lg"
		{type}
		{required}
		{disabled}
		{id}
		name={id}
		{placeholder}
		{value}
	/>
</div>
