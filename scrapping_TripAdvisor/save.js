async function scrapeTripAdvisorReviews(url) {
    const browser = await puppeteer.launch({
      headless: false // Utilisation du nouveau mode Headless 'new'
    });
    const page = await browser.newPage();
  
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000  });
  
    //Part PopUp Cookie
    // Attente du sélecteur du bouton "J'accepte" pour les cookies
    await page.waitForSelector('#onetrust-accept-btn-handler');
  
    // Clic sur le bouton "J'accepte" pour fermer la fenêtre pop-up des cookies
    await page.click('#onetrust-accept-btn-handler');
  
    await page.waitForTimeout(2000);
    // Fin Part PopUp Cookie
  
    let reviews = [];
  
    while (true) {
  
      //Part pour cliquer sur "Voir plus" pour afficher le commentaire entier
      const showMoreSpans = await page.$$('.ulBlueLinks'); // Sélecteur des éléments "Voir plus"
  
      if (showMoreSpans.length > 0) {
        for (const span of showMoreSpans) {
          await span.evaluate(span => {
            span.click(); // Clic via JavaScript natif
          }, span);
          await page.waitForTimeout(500); // Attendre un court instant pour le chargement
        }
      }
      //Fin Part pour cliquer sur "Voir plus" pour afficher le commentaire entier
  
      //Part Récupérer les avis sur la page actuelle
      const reviewsOnPage = await page.evaluate(() => {
        const reviewContainers = document.querySelectorAll('.review-container');
        const reviewsData = [];
  
        reviewContainers.forEach(review => {
          const reviewText = review.querySelector('.partial_entry').innerText.trim();
          reviewsData.push({ reviewText });
        });
  
        return reviewsData;
      });
  
      reviews = reviews.concat(reviewsOnPage);
      //Fin Part Récupérer les avis sur la page actuelle
  
      //Part condition pour sortir de la boucle
      if (reviews.length >= 1500) {
        break; // Sortir de la boucle si on a plus de 1500 avis
      }
  
      // Cliquer sur le lien "Suivant" pour charger les avis suivants s'il est activé
      const nextButton = await page.$('.nav.next.ui_button.primary');
      if (!nextButton) {
        break; // Sortir de la boucle s'il n'y a pas de lien suivant
      }
  
      const isNextButtonDisabled = await page.evaluate(button => button.classList.contains('disabled'), nextButton);
      if (isNextButtonDisabled) {
        break; // Sortir de la boucle si le bouton suivant est désactivé
      }
      //Fin Part condition pour sortir de la boucle
  
      // Cliquer sur le bouton suivant et attendre le chargement de la page
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        nextButton.click()
      ]);
  
      // Attendre un court instant pour la mise à jour des avis
      await page.waitForTimeout(2000); // Vous pouvez ajuster ce délai en fonction de la vitesse de chargement
    }
  
    await browser.close();
  
    return reviews;
  }