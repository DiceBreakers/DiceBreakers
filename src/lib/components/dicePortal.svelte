<!-- App.svelte -->
<script>
    import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  
    let controlsLayout = [
      'previousFrame',
      'playpause',
      'stop',
      'nextFrame',
      'progress',
      'frame',
      'loop',
      'spacer',
      'background',
      'snapshot',
      'zoom',
      'info',
    ];

  </script>


  
  <div class="dice">
  <LottiePlayer class="dice"
    src="/dicePortal.json"
    autoplay="{true}"
    loop="{true}"
    controls="{false}"
    renderer="svg"
    background="transparent"
    height="{300}"
    width="{300}"
    controlsLayout="{controlsLayout}"
  />
</div>

  <style>
    .dice {  
        position: fixed;
        top: 60%; /* Vertical center of the viewport */
        left: 50%; /* Horizontally center */
        transform: translate(-50%, -50%); /* Center both vertically and horizontally */
        z-index: 1000;
    }
  </style>