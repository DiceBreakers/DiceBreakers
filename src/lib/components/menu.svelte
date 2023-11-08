<script>
    import { fade, slide } from 'svelte/transition'
    import { applyAction, enhance } from '$app/forms'
    import { pb } from '$lib/stores/pocketbase'
    import { currentUser } from '$lib/stores/user'
    import LoginMenu from './loginMenu.svelte';

    export let showMenu = false;

    const toggleMenu = () => {
        showMenu = !showMenu;
    }
</script>

{#if showMenu}
<div class="backdrop" role="button" tabindex="0" on:click|self={toggleMenu} on:keydown|self={toggleMenu} transition:fade>
  <nav class="nav menu"
  in:slide={{ duration:800, axis:'x'}}
  out:slide={{ delay:800, duration:800, axis:'x'}}>
    <ul class="item">
        {#if $currentUser}
          <li><a href="/add" on:click={toggleMenu} class="btn btn-sm variant-filled-primary">Add Prompts</a></li>
          <li><a href="/edit" on:click={toggleMenu} class="btn btn-sm variant-filled-primary">Edit Prompts</a></li>
          <li><a href="/" on:click={toggleMenu} class="btn btn-sm variant-filled-primary">Play</a></li>
          <li class="topMarginL"><a href="/profile/hidden" on:click={toggleMenu} class="btn btn-sm variant-filled-primary">Hidden Authors/Prompts</a></li>
          <li><a href="/profile" on:click={toggleMenu} class="btn btn-sm variant-filled-primary">Account Settings</a></li>
              <form method="POST" action="/logout" use:enhance={() => {
                  return async ({ result }) => {
                    pb.authStore.clear()
                    await applyAction(result)}
                  }}>
                <button class="topMarginS btn btn-sm variant-filled-primary">Log out</button>
              </form>
        {:else}
          <LoginMenu />
        {/if}
    </ul>
</nav>
</div>
{/if}
<div class="navToggle" role="button" tabindex="0" on:click={toggleMenu} on:keydown={toggleMenu}>
    {#if showMenu}
    <img src="/x.svg" alt="Account Icon" class="icon" transition:slide={{ duration:800, axis:'y'}}/>
    {:else}
    <img src="/account.svg" alt="Account Icon" class="icon" transition:slide={{ duration:800, axis:'y'}} />
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
    height: 450px;
    position: fixed;
    right: 0;
    width: 90%;
    max-width: 500px;
    border-radius: 5px;
    background: linear-gradient(135deg, #8FE0F7 15%, #1883E0);
    z-index: 2000;
    font-weight: 600;
}

.item {
  margin: 1rem;
}

.topMarginL {
    margin-top: 90px;
}

.topMarginS {
    margin-top: 20px;
}

.btn {
  margin: 10px;
}

.navToggle {
  position: relative;
  background-color: white;
  height: 4rem;
  width: 4rem;
  border-radius: 50%;
  position: fixed;
  top: 2vh; 
  right: 5vw; 
  z-index: 2000;
  box-shadow: 0 1rem 3rem #0b3861;
  cursor: pointer;
}

img.icon {
    width:38px;
    margin-top:8px;
    margin-left:13px;
    filter: invert(18%) sepia(11%) saturate(7499%) hue-rotate(182deg) brightness(92%) contrast(95%);
}

</style>