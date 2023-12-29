<script>
    import { fade } from "svelte/transition";
</script>

<div class="header" in:fade={{ duration: 1000 }}><span>
    <a href="/"><img src="/LogoSlogan.png" class="logo" width="400" height="auto"
        title="Return Home" alt="Dice Breakers Blue Icosahedron Logo"></a></span>
        <div class="center"><a href="https://shop.dicebreakers.app" class="badge variant-filled-secondary" 
         title="Shop Dice Breakers" target="_blank" rel="noopener noreferrer">Shop for Charity</a></div>
</div>


<style>
    .header {
        height: 135px; 
        margin-top: -70px;
    }

    .logo {
        margin-bottom: -15px;
    }
</style>