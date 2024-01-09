
const puppeteer = require('puppeteer');

async function scrapeTripAdvisorReviews(url) {
  const browser = await puppeteer.launch({
    headless: false // Utilisation du nouveau mode Headless
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });

  //Part PopUp Cookie
  // Attente du sélecteur du bouton "J'accepte" pour les cookies
  await page.waitForSelector('#onetrust-accept-btn-handler');

  // Clic sur le bouton "J'accepte" pour fermer la fenêtre pop-up des cookies
  await page.click('#onetrust-accept-btn-handler');

  await page.waitForTimeout(1000);
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
        await page.waitForTimeout(1000); // Attendre un court instant pour le chargement
      }
    }
    //Fin Part pour cliquer sur "Voir plus" pour afficher le commentaire entier

    // Récupérer les avis sur la page actuelle
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

    // Cliquer sur le lien "Suivant" pour charger les avis suivants s'il est activé
    const nextButton = await page.$('.nav.next.ui_button.primary');
    if (!nextButton) {
      break; // Sortir de la boucle s'il n'y a pas de lien suivant
    }

    const isNextButtonDisabled = await page.evaluate(button => button.classList.contains('disabled'), nextButton);
    if (isNextButtonDisabled) {
      break; // Sortir de la boucle s'il n'y a pas de lien suivant activé
    }
    // const nextButtonDisabled = await nextButton.evaluate(button => button.getAttribute('disabled'));

    // if (nextButtonDisabled === 'true' || nextButtonDisabled === true) {
    //   break; // Sortir de la boucle s'il n'y a pas de lien suivant activé
    // }

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      nextButton.click()
    ]);

    // Attendre un court instant pour la mise à jour des avis
    await page.waitForTimeout(200); // Vous pouvez ajuster ce délai en fonction de la vitesse de chargement
  }

  await browser.close();

  return reviews;
}

const url = 'https://www.tripadvisor.fr/Restaurant_Review-g187087-d10067617-Reviews-O_Petit_Pau-Pau_Communaute_d_Agglomeration_Pau_Pyrenees_Bearn_Basque_Country_Pyr.html';
// const url = 'https://www.tripadvisor.fr/Restaurant_Review-g187087-d23285223-Reviews-Yellow_Peak-Pau_Communaute_d_Agglomeration_Pau_Pyrenees_Bearn_Basque_Country_Pyr.html';

scrapeTripAdvisorReviews(url)
  .then(reviews => {
    console.log('Total des avis récupérés:', reviews.length);
    
    // Convertir les avis en format JSON
    const reviewsJSON = JSON.stringify(reviews, null, 2);
    
    // Afficher les avis au format JSON
    // console.log('Avis au format JSON:', reviewsJSON);

    // Retourner les avis au besoin
    return reviewsJSON;
  })
  .catch(error => console.error('Erreur lors de l\'extraction des avis:', error));

