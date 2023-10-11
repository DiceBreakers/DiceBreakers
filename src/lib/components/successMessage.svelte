<script>
    import { onMount, afterUpdate } from 'svelte';
  
    let isVisible = false;
  
    onMount(() => {
      // Show the success message for a few seconds (e.g., 3 seconds)
      isVisible = true;
      setTimeout(() => {
        isVisible = false;
      }, 3000); // 3000 milliseconds (3 seconds)
    });
  
    // Hide the success message after it's been displayed
    afterUpdate(() => {
      if (isVisible) {
        setTimeout(() => {
          isVisible = false;
        }, 3000); // 3000 milliseconds (3 seconds)
      }
    });
  </script>
  
  <div class="success-message" class:visible={isVisible}>
    Success! Your prompt has been submitted.
  </div>
  
  <style>
    .success-message {
      display: none;
      background-color: green;
      color: white;
      padding: 10px;
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      transition: opacity 0.3s ease;
    }
  
    .visible {
      display: block;
    }
  </style>
  