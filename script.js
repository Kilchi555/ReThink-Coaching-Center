document.addEventListener('DOMContentLoaded', function () {

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        if (questionButton && answerDiv) {
            questionButton.addEventListener('click', () => {
                questionButton.classList.toggle('active');

                if (answerDiv.style.display === 'block') {
                    answerDiv.style.display = 'none';
                } else {
                    answerDiv.style.display = 'block';

                    // Optional: andere schließen
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherQuestion = otherItem.querySelector('.faq-question');
                            if (otherAnswer) otherAnswer.style.display = 'none';
                            if (otherQuestion) otherQuestion.classList.remove('active');
                        }
                    });
                }
            });
        }
    });

    // --- Calendly Button in Hero Section ---
    const calendlyHeroButton = document.querySelector('.hero .calendly-button');
    if (calendlyHeroButton) {
        calendlyHeroButton.addEventListener('click', function () {
            const calendlyUrl = 'https://calendly.com/pascal_kilchenmann/kostenloses-kennenlern-gespraech';
            Calendly.initPopupWidget({ url: calendlyUrl });
            return false;
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const menuToggle = document.getElementById("menu-toggle");
        const navbar = document.getElementById("navbar");
      
        menuToggle.addEventListener("click", function () {
          navbar.classList.toggle("active");
        });
      });
      

  // Accordion
  const accordions = document.querySelectorAll(".accordion");

  accordions.forEach((accordion) => {
    accordion.addEventListener("click", function () {
      // Toggle active class
      this.classList.toggle("active");

      // Toggle panel
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
});