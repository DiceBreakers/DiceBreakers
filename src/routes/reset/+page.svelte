<script>
    import Header from '$lib/header.svelte'
    import Reset from '$lib/reset.svelte';
    import Footer from '$lib/footer.svelte'
    import Menu from '$lib/menu.svelte';
  
    let showMenu = false;

  </script>
  
  <Menu {showMenu} />
  <div class="bg_gradient">
      <Header />
  </div>
  <div class="body card p-4 variant-glass-secondary">
    <Reset />
  </div>
  <div class="bg_gradient">
      <Footer />
  </div>
  
  <style>
  
  </style>