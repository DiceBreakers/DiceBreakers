<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { pb } from '$lib/stores/pocketbase';
  import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
  import ServerMessage from '$lib/components/serverMessage.svelte';
  import TOS from '../legal/tos.svelte';
  import Cookies from '../legal/cookies.svelte';
  import { goto } from '$app/navigation';

  let tabSet: number = 0;

  let email = '';
  let password = '';
  let passwordConfirm = '';
  let emailErrorMessage = false;
  let passwordMatchMessage = false;
  let passwordBlankMessage = false;
  let TOSMessage = false;
  let registrationSuccessMessage = false;
  let passwordComplexityMessage = false;
  let tosChecked = false;
  let eValid = false;
  let pValid = false;

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!tosChecked) {
      TOSMessage = true;
      setTimeout(() => TOSMessage = false, 1500);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email)) {
      eValid = true;
    } else {
      emailErrorMessage = true;
      setTimeout(() => emailErrorMessage = false, 1500);
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;  
    if (password && passwordConfirm && password === passwordConfirm) {
    if (passwordRegex.test(password)) {
      pValid = true;
    } else {
      passwordComplexityMessage = true;
      setTimeout(() => passwordComplexityMessage = false, 4000);
      return;
    }
  } else {
    passwordMatchMessage = true;
    setTimeout(() => passwordMatchMessage = false, 1500);
    return;
  }

    if (eValid && pValid && tosChecked) {
      try {
        const formElement = document.getElementById('registerForm') as HTMLFormElement;
        const formData = new FormData(formElement);
        const response = await fetch('?/register', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        registrationSuccessMessage = true;
        setTimeout(() => {
          registrationSuccessMessage = false;
          pb.authStore.loadFromCookie(document.cookie);
          goto('/');
        }, 1500);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  function goToTermsOfService() {
    tabSet = 1;
  }
</script>


{#if TOSMessage}
  <ServerMessage isError={true} messageText="Must agree to our TOS" />
{/if}
{#if emailErrorMessage}
  <ServerMessage isError={true} messageText="That doesn't look like an email address" />
{/if}
{#if passwordComplexityMessage}
  <ServerMessage isError={true} messageText="Password must be at least 8 characters, with 1 number and 1 symbol" />
{/if}
{#if passwordMatchMessage}
  <ServerMessage isError={true} messageText="Passwords do not match" />
{/if}
{#if registrationSuccessMessage}
  <ServerMessage isError={false} messageText="Thank you for registering! Logging in now..." />
{/if}


<div class="card p-4">
  <div class="card p-4 variant-glass-secondary">
    <TabGroup justify="justify-center">
      <Tab bind:group={tabSet} name="Register" value={0}>
        <svelte:fragment slot="lead">Register</svelte:fragment></Tab>
      <Tab bind:group={tabSet} name="TermsofService" value={1}>Terms of Service</Tab>
      <Tab bind:group={tabSet} name="CookiePolicy" value={2}>Cookie Policy</Tab>
      <!-- Tab Panels --->
      <svelte:fragment slot="panel">
        {#if tabSet === 0}
        <div class="center">
          <form class="auth-form" method="post" action="/login?/OAuth2">
            <div>
              <button class="btn-auth" type="submit">
              <img class="btn-auth-img" src='/googleSignIn.png' alt='google sign in'/>
              </button>
            </div>
            </form>            
          <h2>Or enter email and password to register:</h2>
          <form id="registerForm" class="item">
            <input type="email" bind:value={email} name="email" placeholder="Email" class="input m2" />
            <input type="password" bind:value={password} name="password" placeholder="Password" class="input m2" />
            <input type="password" bind:value={passwordConfirm} name="passwordConfirm" placeholder="Confirm Password" class="input m2" />
            <label>
              <input
                name="TOS"
                class="checkbox checkboxSize m2"
                type="checkbox"
                bind:checked={tosChecked}
                title="Terms of Service" />
              Click to confirm you agree to follow our 
                <span class="link" on:click={goToTermsOfService} on:keydown={goToTermsOfService}
                  role="button" tabindex="0" title="Terms of Service">Terms of Service.</span>
            </label>
            <button on:click={handleRegister} class="btn btn-sm variant-filled-primary">Register</button>
          </form>
        </div>
        {:else if tabSet === 1}
          <TOS />
        {:else if tabSet === 2}
          <Cookies />
        {/if}
      </svelte:fragment>
    </TabGroup>
  </div>
</div>



<style>
  .btn {
		  margin: 5px;
	}

	.center {
      margin: auto;
      display: block;
      max-width: 700px;
  }

  .m2 {
    margin: 2px;
  }

  button:hover{
		cursor: pointer;
		text-decoration: underline;
		color: #FFF;
		background-color: #4d4c4c;
		transition: all 0.3s ease-in;
	}

	.btn {
		margin: 5px;
	}
	.btn-auth-img:hover{
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);

	}
	.btn-auth{
		border:0;
		background-color: rgba(84, 81, 81, 0.0);
		padding:.01em;
	}
	.btn-auth:hover{
		border:0;
		padding:.01em;
		text-decoration: none;
		background-color: rgba(84, 81, 81, 0.0);
	}
	
	h2 {
		margin-left: 10px;
		margin-top: 5px;
		margin-bottom: 5px;
	}

</style>