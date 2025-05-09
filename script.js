console.log("Script geladen");

document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', function () {
    const clickedItem = this.closest('.faq-item');
    document.querySelectorAll('.faq-item').forEach((item) => {
      if (item !== clickedItem) item.classList.remove('active');
    });
    clickedItem.classList.toggle('active');
  });
});
  

    // --- Calendly Button in Hero Section ---
    const calendlyHeroButton = document.querySelector('.hero .calendly-button');
    if (calendlyHeroButton) {
        calendlyHeroButton.addEventListener('click', function () {
            const calendlyUrl = 'https://calendly.com/pascal_kilchenmann/kostenloses-kennenlern-gespraech';
            Calendly.initPopupWidget({ url: calendlyUrl });
            return false;
        });
    };
    document.addEventListener('DOMContentLoaded', function() {
      const menuToggle = document.getElementById('menu-toggle');
      const navbar = document.getElementById('navbar');
    
      // Menü öffnen/schließen beim Klick auf das Burger-Menü
      menuToggle.addEventListener('click', function(event) {
        event.stopPropagation(); // verhindert sofortiges Schließen
        navbar.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });
    
       // Menü mit Verzögerung schließen bei jedem Klick außerhalb
  document.addEventListener('click', function() {
    setTimeout(() => {
      navbar.classList.remove('active');
      menuToggle.classList.remove('active');
    }, 200); // 200ms Verzögerung
  });
});
    
    