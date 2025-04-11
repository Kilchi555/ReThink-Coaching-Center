// js/script.js

// Öffnen des Menüs bei Klick auf den Button
document.getElementById('menu-toggle').addEventListener('click', function() {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('active'); // Fügt die "active"-Klasse hinzu oder entfernt sie
});

const menuLinks = document.querySelectorAll('.navbar a'); // Alle Links im Menü

menuLinks.forEach(link => {
  link.addEventListener('click', function() {
    const navbar = document.getElementById('navbar');
    navbar.classList.remove('active'); // Entfernt die "active"-Klasse, um das Menü zu schließen
  });
});

// Schließe das Menü, wenn irgendwo außerhalb des Menüs geklickt wird
document.addEventListener('click', function(event) {
    navbar.querySelector('ul').classList.remove('active'); // Menü schließen
});

  
  
  // FAQ-Toggles
  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      faqItem.classList.toggle('active');
  
      // Optional: alle anderen schließen
      document.querySelectorAll('.faq-item').forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove('active');
        }
      });
    });
  });


// Stelle sicher, dass das Calendly-Widget geladen ist, bevor der Button hinzugefügt wird
window.onload = function() {
    // Initialisiere das Calendly Widget im unteren rechten Bereich
    Calendly.initBadgeWidget({
      url: 'https://calendly.com/pascal_kilchenmann/kostenloses-kennenlern-gespraech',
      text: 'Termin buchen',
      color: '#0069ff',
      textColor: '#ffffff'
    });
  
    // Event-Listener für das Erstellen eines weiteren Buttons an einem anderen Ort auf der Seite
    document.getElementById('calendly-button-container').addEventListener('click', function() {
      // Hier kannst du einen zweiten Button mit verschiedenen Parametern einfügen
      Calendly.initPopupWidget({
        url: 'https://calendly.com/pascal_kilchenmann/kostenloses-kennenlern-gespraech'
      });
    });
  };
  

  