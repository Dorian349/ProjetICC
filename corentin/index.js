
const puppeteer = require('puppeteer');
const keywords = require('./keywords.json');
const fs = require('fs');

async function scrapeTripAdvisorReviews(url) {
  const browser = await puppeteer.launch({
    headless: false // Utilisation du nouveau mode Headless
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
    await page.waitForTimeout(2000); // Vous pouvez ajuster ce délai en fonction de la vitesse de chargement
  }

  await browser.close();

  return reviews;
}


async function categorizeReview(reviewText) {
  for (const category in keywords) {
      const categoryKeywords = keywords[category];
      if (categoryKeywords.some(keyword => reviewText.toLowerCase().includes(keyword))) {
        console.log("Category : ", category);
        console.log(reviewText);
        return category;
      }
  }
  return "uncategorized";
}



// const url = 'https://www.tripadvisor.com/Restaurant_Review-g187087-d10067617-Reviews-O_Petit_Pau-Pau_Communaute_d_Agglomeration_Pau_Pyrenees_Bearn_Basque_Country_Pyr.html';
// const url = 'https://www.tripadvisor.com/Restaurant_Review-g60763-d13504265-Reviews-Boucherie_Union_Square-New_York_City_New_York.html';
const url = 'https://www.tripadvisor.com/Restaurant_Review-g60763-d12425739-Reviews-Piccola_Cucina_Estiatorio-New_York_City_New_York.html';

(async () => {
  try {
    const reviews = await scrapeTripAdvisorReviews(url);
    console.log('Total des avis récupérés:', reviews.length);
    
    // Convertir les avis en format JSON
    const reviewsJSON = JSON.stringify(reviews, null, 2);
    
    // Créer un tableau pour stocker les avis avec leurs catégories
    const resultat_reviews = [];

    // Fonction asynchrone pour obtenir la catégorie de chaque avis
    async function processReviews() {
      for (const review of reviews) {
        // console.log(review.reviewText);
        const category = await categorizeReview(review.reviewText);
        const text = review.reviewText;
        // console.log(category);
        resultat_reviews.push({ text, category });
      }
    }

    // Appel de la fonction pour traiter les avis avec leurs catégories
    await processReviews();

    // Affichage des avis au format JSON

    // console.log('Avis au format JSON:', resultat_reviews);

    // Écriture des avis au format JSON dans un fichier
    fs.writeFileSync('resultat_reviews.json', JSON.stringify(resultat_reviews, null, 2));
    
    // Retourner les avis au besoin (non utilisé ici)
    return reviewsJSON;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des avis:', error);
  }
})();
