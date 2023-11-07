<script>
    import { slide } from "svelte/transition";
</script>

<div class="header" in:slide={{ duration: 1000 }}><span>
    <a href="/"><img src="/LogoSlogan.png" width="400" height="auto"
        title="Return Home" alt="Dice Breakers Blue Icosahedron Logo"></a></span>
</div>

<style>
    .header {
        height: 210px; 
        margin-top: -90px;
    }

</style>