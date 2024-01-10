const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const keywords = require('./keywords.json');

const lang = process.env.LANG
console.log(lang);


(async () => {

    let numberOfReviews = 0;
    const start = performance.now();

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.google.com/search?hl=en&q=mcdo+new+york+160+broadway');

    const acceptButton = await page.$x("//button[contains(., 'Accept all')]");

    if (acceptButton.length > 0) {
        await acceptButton[0].click();
        console.log("Bouton 'Accept All' cliqué avec succès.");

        const googleReviewsLink = await page.$x("//a[contains(., 'Google reviews')]");

        if (googleReviewsLink.length > 0) {
            await googleReviewsLink[0].click();
            console.log("Lien 'Google reviews' cliqué avec succès.");

            await page.waitForTimeout(1500);

            const scrollAndCheckReviews = async () => {

                await page.$eval(`.review-dialog-list`,
                    e => {
                    e.scrollTop = e.scrollTop + 5000;
                    return e
                    }
                )

                await page.waitForFunction(() => {
                    const loaderElement = document.querySelector('.Opirzb.yf.yl');
                    return !loaderElement; // Le chargement est terminé lorsque cet élément n'existe pas
                }, { polling: 'mutation' });
                await page.waitForTimeout(750);

                const googleReviewElements = await page.$$('.gws-localreviews__google-review');

                const reviewsCount = googleReviewElements.length;
                const result = reviewsCount !== numberOfReviews;

                numberOfReviews = reviewsCount;

                console.log(`Nombre d'avis collectés : ${numberOfReviews}`)

                return result;
            };

            do {
                const hasChanged = await scrollAndCheckReviews();

                if (hasChanged || numberOfReviews >= 1500) {
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
                    const allReviews = [];

                    for (const reviewElement of googleReviewElements) {
                        const reviewData = await reviewElement.evaluate(async element => {

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

                            
                            const keywords = {
                                "organic": [
                                    "pesticide",
                                    "herbicide",
                                    "toxic",
                                    "non-toxic",
                                    "regenerative",
                                    "agroecology",
                                    "biodynamic",
                                    "biological",
                                    "permaculture",
                                    "holistic farming",
                                    "sustainable soil",
                                    "natural fertilizers",
                                    "biodiversity-friendly"
                                ],
                                "climate": [
                                    "plant-based",
                                    "eco-conscious",
                                    "wildlife-friendly",
                                    "wildlife",
                                    "carbon footprint",
                                    "carbon offset",
                                    "green energy",
                                    "transportation",
                                    "energy-efficient appliances",
                                    "climate-positive",
                                    "forestry"
                                ],
                                "water": [
                                    "water",
                                    "water quality",
                                    "water efficiency",
                                    "rainwater",
                                    "watershed",
                                    "wetland",
                                    "irrigation",
                                    "water recycling",
                                    "eco-friendly water",
                                    "pollution prevention",
                                    "water stewardship"
                                ],
                                "social": [
                                    "community empowerment",
                                    "inclusive",
                                    "supply chain",
                                    "human rights",
                                    "stakeholder",
                                    "fair labor",
                                    "social justice",
                                    "social injustice",
                                    "cultural diversity",
                                    "consumer education",
                                    "cultural",
                                    "beggars",
                                    "homeless",
                                    "drug deal",
                                    "drugs deal"
                                ],
                                "governance": [
                                    "ethical",
                                    "corporate",
                                    "corruption",
                                    "stakeholder",
                                    "lobbying",
                                    "fair competition",
                                    "transparent reporting",
                                    "business innovation"
                                ],
                                "waste": [
                                    "packaging",
                                    "life extension",
                                    "cradle-to-cradle",
                                    "closed-loop",
                                    "waste",
                                    "waste-to-energy",
                                    "repurposing",
                                    "landfill",
                                    "green practices",
                                    "sustainable packaging",
                                    "waste auditing",
                                    "environmental policy"
                                ],
                                "adverse": [
                                    "greenwashing",
                                    "eco-friendly",
                                    "sustainability",
                                    "environmental impact",
                                    "ethical",
                                    "certifications",
                                    "green labels",
                                    "labels",
                                    "corporate",
                                    "insincere"
                                ],
                                "collector": [
                                    "nature",
                                    "ecological",
                                    "ecologic",
                                    "ecology",
                                    "environment",
                                    "environmental"
                                ]
                            }

                            let category = "uncategorized";
                            
                            for (const categoryK in keywords) {
                                const categoryKeywords = keywords[categoryK];
                                if (categoryKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
                                    category = categoryK;
                                }
                            }
                
                            return {
                                text,
                                category
                            };
                        });

                        allReviews.push(reviewData);

                        if(reviewData.text === "" || reviewData.category === "uncategorized") {
                            continue;
                        }
                
                        reviewsList.push(reviewData);
                    }
                    const end = performance.now();

                    console.log(`Time taken to execute add function is ${end - start}ms.`);
                    
                    await browser.close();
                
                    let jsonResult = JSON.stringify(reviewsList, null, 2);
                    fs.writeFileSync('resultat_reviews.json', jsonResult);

                    let jsonResult2 = JSON.stringify(allReviews, null, 2);
                    fs.writeFileSync('all_reviews.json', jsonResult2);

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