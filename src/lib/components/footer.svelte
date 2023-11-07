<script>
    import { fade, slide } from "svelte/transition";
</script>

<div class="footer" transition:fade={{ delay: 250, duration: 300 }}>
    <div class="icons">
        <ul class="fa-brands fa-xl">
            <a href="https://old.reddit.com/r/DiceBreakers" class="fa-reddit-alien" title="reddit"> </a>
            <a href="https://www.instagram.com" class="fa-instagram" title="instagram"> </a>
            <a href="https://www.twitter.com" class="fa-twitter" title="twitter"> </a>
            <a href="https://www.facebook.com" class="fa-facebook-f" title="facebook"> </a>
        </ul>
    </div>
    <div class="legal mr">
    <ul>
        <a href="/about" title="About"><i class="fa-regular fa-copyright" title="Copyright Dice Breakers"/> DiceBreakers</a>
        <a href="mailto: Admin@DiceBreakers.app" class="fa-regular fa-envelope" title="Email Us"> </a>
        <a href="/legal" title="Terms of Service, Privacy Policy, and Cookies">Legal Info</a>
    </ul>
    </div>
</div>


<style>
    .footer {
        justify-content: center;
        height: 0px;
        text-align: center;
        margin-top: -25px;
    }
    .footer ul {
        margin: auto;
        text-align: center;
    }
    .footer a {
    	padding: 5px;
    }
    .legal {
        padding-top: 40px;        
    }
    .footer ul i {
        margin-left: 20px;
    }

    .mr {
        margin-right:50px;
    }

</style>
