const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {

    let numberOfReviews = 0;
    const start = performance.now();

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.google.com/search?q=le+poulet+à+3+pattes+pau');

    const acceptButton = await page.$x("//button[contains(., 'Tout accepter')]");

    if (acceptButton.length > 0) {
        await acceptButton[0].click();
        console.log("Bouton 'Tout accepter' cliqué avec succès.");

        const googleReviewsLink = await page.$x("//a[contains(., 'avis Google')]");

        if (googleReviewsLink.length > 0) {
            await googleReviewsLink[0].click();
            console.log("Lien 'avis Google' cliqué avec succès.");

            await page.waitForTimeout(1500);

            const scrollAndCheckReviews = async () => {

                await page.$eval(`.review-dialog-list`,
                    e => {
                    e.scrollTop = e.scrollTop + 5000;
                    return e
                    }
                )

                await page.waitForTimeout(500);

                const googleReviewElements = await page.$$('.gws-localreviews__google-review');

                const reviewsCount = googleReviewElements.length;
                const result = reviewsCount !== numberOfReviews;

                numberOfReviews = reviewsCount;

                return result;
            };

            do {
                const hasChanged = await scrollAndCheckReviews();

                if (hasChanged) {
                    console.log("Le bloc de reviews a changé. Continuation du défilement...");
                } else {
                    console.log("Aucun changement dans le bloc de reviews. Arrêt du défilement.");

                    const moreButtons = await page.$$('.review-more-link');
                    for (const button of moreButtons) {
                        try {
                            await button.click();
                        } catch (error) {}
                    }

                    const googleReviewElements = await page.$$('.gws-localreviews__google-review');

                    const reviewsList = [];

                    for (const reviewElement of googleReviewElements) {
                        const reviewData = await reviewElement.evaluate(element => {

                            let text = "";

                            const reviewTextZone = element.querySelector('.review-full-text');

                            if(reviewTextZone) {
                                text = reviewTextZone.innerText;
                            } else {
                                const expandableSection = element.querySelector('[data-expandable-section]');
                                if(expandableSection) {
                                    text = expandableSection.innerText;
                                }
                            }
                
                            return {
                                text
                            };
                        });

                        if(reviewData.text === "") {
                            continue;
                        }
                
                        reviewsList.push(reviewData);
                    }
                    const end = performance.now();

                    console.log(`Time taken to execute add function is ${end - start}ms.`);
                
                    let jsonResult = JSON.stringify(reviewsList, null, 2);
                    fs.writeFileSync('resultat_reviews.json', jsonResult);
                    await browser.close();

                    break;
                }
            } while (true);

            console.log("Fin du défilement. Tous les avis ont été chargés.");

        } else {
            console.log("Aucun lien 'avis Google' trouvé sur la page.");
        }

    } else {
        console.log("Aucun bouton 'Tout accepter' trouvé sur la page.");
    }
    await browser.close();
})();