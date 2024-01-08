const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage();

    await page.goto('https://www.google.com/search?q=le+Comptoir+%C3%94+Petit+Pau');

    const acceptButton = await page.$x("//button[contains(., 'Tout accepter')]");

    if (acceptButton.length > 0) {
        // Cliquez sur le premier bouton trouvé
        await acceptButton[0].click();
        console.log("Bouton 'Tout accepter' cliqué avec succès.");

        const googleReviewsLink = await page.$x("//a[contains(., 'avis Google')]");

        if (googleReviewsLink.length > 0) {
            // Cliquez sur le premier lien <a> trouvé
            await googleReviewsLink[0].click();
            console.log("Lien 'avis Google' cliqué avec succès.");

            // Définir une fonction qui fait défiler la popup
            const scrollPopup = async () => {
                const popupHeight = await page.evaluate(() => {
                    const popup = document.querySelector('.review-dialog');
                    const height = popup.scrollHeight;
                    return height;
                });
        
                // Ajustez la valeur de scrollBy en fonction de votre cas
                await page.evaluate(scrollHeight => {
                    window.scrollBy(0, scrollHeight);
                }, popupHeight);
        
                // Attendez un certain temps pour que la popup charge les nouveaux avis
                await page.waitForTimeout(2000);
        
                // Vous pouvez ajouter une logique pour vérifier s'il y a de nouveaux avis ou non
                // Par exemple, vous pouvez comparer le nombre d'avis avant et après le défilement
            };
        
            // Faites défiler la popup jusqu'à ce qu'il n'y ait plus de nouveaux avis (ajustez si nécessaire)
            while (true) {
                await scrollPopup();
            }
        
            console.log("Fin du défilement. Tous les avis ont été chargés.");

        } else {
            console.log("Aucun lien 'avis Google' trouvé sur la page.");
        }

    } else {
        console.log("Aucun bouton 'Tout accepter' trouvé sur la page.");
    }

    await page.waitForSelector('SELECTEUR_DU_BOUTON');

    // Cliquez sur le bouton
    await page.click('SELECTEUR_DU_BOUTON');

    // Attendez que la page soit chargée ou que des éléments spécifiques soient modifiés
    await page.waitForNavigation();

    // let source = await page.content();
    // const $ = cheerio.load(source);
    // fs.writeFileSync('output.html', source, 'utf-8');
    // //const extractedDiv = $(`#${divIdToExtract}`);
    // console.log(source.includes("gws-localreviews__general-reviews-block"));
    // const elements = await page.$('.gws-localreviews__general-reviews-block');
    // console.log(elements);
    // for (const element of elements) {
    //     const title = await element.$eval('h3', node => node.innerText);
    //     const link = await element.$eval('a', node => node.getAttribute('href'));
    //     console.log('Title:', title);
    //     console.log('Link:', link);
    //     console.log('');
    // }
    await browser.close();
})();