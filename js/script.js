// js/script.js

document.addEventListener('DOMContentLoaded', function() {

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        if (questionButton && answerDiv) {
            questionButton.addEventListener('click', () => {
                // Toggle 'active' class for styling the button if needed
                questionButton.classList.toggle('active');

                // Toggle display of the answer
                if (answerDiv.style.display === 'block') {
                    answerDiv.style.display = 'none';
                } else {
                    answerDiv.style.display = 'block';
                    // Optional: Close other open FAQs
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.querySelector('.faq-answer').style.display = 'none';
                            otherItem.querySelector('.faq-question').classList.remove('active');
                        }
                    });
                }
            });
        }
    });

    // --- Calendly Button in Hero Section ---
    const calendlyHeroButton = document.querySelector('.hero .calendly-button');
    if (calendlyHeroButton) {
        calendlyHeroButton.addEventListener('click', function() {
            // Die URL deines Calendly-Links
            const calendlyUrl = 'https://calendly.com/pascal_kilchenmann/kostenloses-kennenlern-gespraech';
            
            // Calendly Popup öffnen
            // Stelle sicher, dass das Calendly Widget Skript (widget.js) auf deiner Seite geladen ist,
            // damit Calendly.initPopupWidget verfügbar ist.
            // Die index.html lädt es bereits: <script src="https://assets.calendly.com/assets/external/widget.js" ...></script>
            Calendly.initPopupWidget({
                url: calendlyUrl,
                // Weitere Optionen findest du in der Calendly-Dokumentation:
                // https://help.calendly.com/hc/en-us/articles/360020052833-Advanced-embed-options
            });
            return false; // Verhindert Standard-Aktionen des Buttons, falls es ein Link wäre
        });
    }

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', function() {
            navbar.classList.toggle('active'); // Du benötigst CSS, um .navbar.active anzuzeigen
        });
    }

    // Hinweis: Der Calendly *Badge* Widget wird separat in deiner HTML initialisiert
    // window.onload = function() { Calendly.initBadgeWidget({ ... }) };
    // Dieser sollte weiterhin funktionieren, solange keine JavaScript-Fehler auftreten.

    // Der Login-spezifische Code von deiner ursprünglichen script.js wurde hier entfernt,
    // da er nicht zur index.html passt. Wenn du eine Login-Seite hast (z.B. login.html),
    // sollte dieser Code in einer separaten JS-Datei für diese Seite sein.

}); // Ende DOMContentLoaded Listener