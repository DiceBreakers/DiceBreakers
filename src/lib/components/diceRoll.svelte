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
<LottiePlayer
  src="./funDice.json"
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
  display: flex;
  justify-content: center; 
  align-items: center; 
  height: 100vh;
  z-index: 1000;
}
</style>
