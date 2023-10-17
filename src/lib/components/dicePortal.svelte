<!-- App.svelte -->
<script>
    import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
    import { fade } from 'svelte/transition';
  
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
  <LottiePlayer
    src="./dicePortal.json"
    autoplay="{true}"
    loop="{false}"
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
        position: sticky;
        left: 50%;
        margin-top: 300px;
        transform: translate(-50%, -50%); /* Center both vertically and horizontally */
        z-index: 1000;
        
    }
  </style>