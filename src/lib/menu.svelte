<script>
    import { fade, slide, scale } from 'svelte/transition'
    import { applyAction, enhance } from '$app/forms'
    import { pb } from '$lib/pocketbase'
    import { currentUser } from '$lib/stores/user'
    import '../app.postcss'
    import Login from './login.svelte'

    export let showMenu = false;

    const toggleMenu = () => {
        showMenu = !showMenu;
    }
</script>

{#if showMenu}
<div class="backdrop" on:click|self={toggleMenu} on:keydown|self={toggleMenu} transition:fade>
  <nav class="nav menu" transition:slide={{ duration:800, axis:'x'}}>
    <ul class="item">
<!-- user logged in -->
        {#if $currentUser}
        <li><a href="add" on:click={toggleMenu}>Add Custom Prompts</a></li>
        <li><a href="edit" on:click={toggleMenu}>Edit Your Prompts</a></li>
        <br><li><a href="play" on:click={toggleMenu}>Play!</a></li>
        <li class="topMarginL"><a href="/" on:click={toggleMenu}>Home</a></li>
        <br><li><a href="profile" on:click={toggleMenu}>Account Settings</a></li>
            <form method="POST" action="/logout" use:enhance={() => {
                return async ({ result }) => {
                  pb.authStore.clear()
                  await applyAction(result)
                }
              }}
            >
              <button class="topMarginS">Log out</button>
            </form>
    <!-- user logged out -->
        {:else}

          <Login />


        {/if}
    </ul>
</nav>
</div>
{/if}
<div class="navToggle" on:click={toggleMenu} on:keydown={toggleMenu}>
    {#if showMenu}
    <img src="x.svg" alt="Account Icon" class="icon" transition:slide={{ duration:800, axis:'y'}}/>
    {:else}
    <img src="account.svg" alt="Account Icon" class="icon" transition:slide={{ duration:800, axis:'y'}} />
    {/if}
</div>

<style>
    .backdrop {
        width:100%;
        height: 100%;
        position: fixed;
        background: rgba(13,69,118,0.2);
        z-index: 1000;
    }
    
    .menu {
        padding: 10px;
        border-radius: 3px;
        margin: 10% auto;
        background-color: #8FE0F7;
        z-index: 2000;
    }

.nav {
    height: 500px;
    position: fixed;
    right: 0;
    width: 90%;
    max-width: 500px;
    border-radius: 3px;
    background-color: #8FE0F7;
    z-index: 2000;
    font-weight: 600;
}

.item {
  margin: 1rem;
}

.topMarginL {
    margin-top: 240px;
}

.topMarginS {
    margin-top: 20px;
}

.navToggle {
  position: relative;
  background-color: white;
  height: 4.5rem;
  width: 4.5rem;
  border-radius: 50%;
  position: fixed;
  top: 5vh; 
  right: 5vw; 
  z-index: 2000;
  box-shadow: 0 1rem 3rem #0b3861;
  cursor: pointer;
}

img.icon {
    width:38px;
    margin-top:11px;
    margin-left:18px;
    filter: invert(18%) sepia(11%) saturate(7499%) hue-rotate(182deg) brightness(92%) contrast(95%);
}

</style>