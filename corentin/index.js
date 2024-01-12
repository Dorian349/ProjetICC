
const puppeteer = require('puppeteer');
const keywords = require('./keywords.json');
const fs = require('fs');

// Fonction pour récupérer les avis sur TripAdvisor via une recherche Google
async function scrapeTripAdvisorReviewsBySearch(query) {
  const browser = await puppeteer.launch({
    headless: false // Utilisation du nouveau mode Headless 'new'
  });
  const page = await browser.newPage();

  // Effectuer une recherche sur Google
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle0', timeout: 60000 });
  const acceptButton = await page.$x("//button[contains(., 'Tout accepter')]");

  if (acceptButton.length > 0) {
    await acceptButton[0].click();
    console.log("Bouton 'Accept All' cliqué avec succès.");

    // Attendre que les résultats de la recherche soient chargés
    await page.waitForSelector('h3');

    // Cliquer sur le premier lien
    const firstLink = await page.$('h3');
    console.log('État de firstLink avant le clic :', !!firstLink);
    if (firstLink) {
      let reviews = [];
      try {
        console.log('Avant le clic sur le premier lien');
        await firstLink.click();
        console.log('Navigation après le clic sur le premier lien');

        // Attendre un court instant après la navigation (peut être ajusté)
        await page.waitForTimeout(2000);
        console.log('Attente de 2 secondes après le clic');
        console.log('Clic sur le premier lien avec succès.');
        // ... (suite du code)
        //Part PopUp Cookie
        // Attente du sélecteur du bouton "J'accepte" pour les cookies
        await page.waitForSelector('#onetrust-accept-btn-handler');

        // Clic sur le bouton "J'accepte" pour fermer la fenêtre pop-up des cookies
        await page.click('#onetrust-accept-btn-handler');

        await page.waitForTimeout(2000);
        // Fin Part PopUp Cookie

        // let reviews = [];

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
          if (reviews.length >= 150) {
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
      } catch (error) {
        console.error('Une erreur est survenue lors du clic:', error);
      }
      
      // Appeler la fonction de récupération des avis sur TripAdvisor
      // const reviews = await scrapeTripAdvisorReviews(page.url());

      await browser.close();
      console.log('Fermeture du navigateur.', reviews.length, 'avis récupérés.');
      return reviews;
    } else {
      console.error('Aucun lien trouvé dans les résultats de la recherche Google.');
      await browser.close();
      return [];
    }
  }else {
    console.error('Aucun bouton "Accept All" trouvé.');
    await browser.close();
    return [];
  }
}


// Fonction pour récupérer les avis sur TripAdvisor via l'URL
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


async function categorizeReview(reviewText) {
  for (const category in keywords) {
      const categoryKeywords = keywords[category];
      if (categoryKeywords.some(keyword => reviewText.toLowerCase().includes(keyword))) {
        // console.log("Category : ", category);
        // console.log(reviewText);
        return category;
      }
    }
    return "uncategorized";
}
  
  
  
const url = 'https://www.tripadvisor.com/Restaurant_Review-g60763-d8567192-Reviews-Dos_Caminos-New_York_City_New_York.html'; //1138 Dos Caminos Vegan  

const restaurantAddress = '463 7th Ave, New York City';
const query = `site:tripadvisor.com ${restaurantAddress}`;
(async () => {
  try {
    // Récupérer les avis sur TripAdvisor
    const reviews = await scrapeTripAdvisorReviews(url); // Version avec url TripAdvisor
    // const reviews = await scrapeTripAdvisorReviewsBySearch(query); // Version avec recherche Google
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
    let json_reviews = JSON.stringify(resultat_reviews, null, 2);
    
    const category_reviews = resultat_reviews.filter(review => review.category !== "uncategorized");
    console.log(category_reviews);
    // Écriture des avis au format JSON dans un fichier
    fs.writeFileSync('resultat_reviews.json', JSON.stringify(category_reviews, null, 2));
    
    // Retourner les avis au besoin (non utilisé ici)
    return reviewsJSON;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des avis:', error);
  }
})();

// const url = 'https://www.tripadvisor.com/Restaurant_Review-g187087-d10067617-Reviews-O_Petit_Pau-Pau_Communaute_d_Agglomeration_Pau_Pyrenees_Bearn_Basque_Country_Pyr.html';
// const url = 'https://www.tripadvisor.com/Restaurant_Review-g60763-d13504265-Reviews-Boucherie_Union_Square-New_York_City_New_York.html'; // 1465
// const url = 'https://www.tripadvisor.com/Restaurant_Review-g60763-d12425739-Reviews-Piccola_Cucina_Estiatorio-New_York_City_New_York.html'; //426
// const url = 'https://www.tripadvisor.com/Restaurant_Review-g60763-d878353-Reviews-McDonald_s-New_York_City_New_York.html'; //546 McDo 4 catégories
// const url = 'https://www.tripadvisor.com/Restaurant_Review-g60763-d13075165-Reviews-Beatnic_Vegan_Restaurant_Rock_Center-New_York_City_New_York.html'; //82 Beatnic Vegan Restaurant - Rock Center Vegan   