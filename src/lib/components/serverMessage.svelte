<script>
	import { fly, slide } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  export let isError = false;
  export let isSuccess = true;
  export let messageText = 'Success!';

</script>

<div class="server-message" class:success={isSuccess} class:error={isError} transition:fly="{{ x: 200, y: -200, duration: 600, easing: cubicInOut }}">
  {messageText}
  <slot></slot>
</div>

<style>
  .server-message {
    display: none;
    padding: 10px;
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    transition: opacity 0.3s ease;
    color: white;
    display: block;
  }

  .server-message.success {
    background-color: #008000
  }

  .server-message.error {
    background-color: #ff0000
  }

</style>
