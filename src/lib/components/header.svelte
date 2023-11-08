<script>
    import { fade } from "svelte/transition";
</script>

<div class="header" in:fade={{ duration: 1000 }}><span>
    <a href="/"><img src="/LogoSlogan.png" width="400" height="auto"
        title="Return Home" alt="Dice Breakers Blue Icosahedron Logo"></a></span>
</div>

<style>
    .header {
        height: 110px; 
        margin-top: -70px;
    }

</style>