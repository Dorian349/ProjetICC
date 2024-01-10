const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

const CATEGORY = "vegan restaurants";
const LOCATION = "Orlando, United States";
const URL = "https://www.google.com/";

(async () => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage();
    await page.goto(URL);

    const acceptButton = await page.$x("//button[contains(., 'Tout accepter')]");
    if (acceptButton.length > 0) {
        await acceptButton[0].click();
        console.log("Bouton 'Tout accepter' cliqué avec succès.");
        await page.type("textarea", `${CATEGORY} near ${LOCATION}`);
    }
    await page.keyboard.press('Enter');
    await page.locator("text='Change to English'").click();
    await page.waitForTimeout(4000);
    await page.click('.GKS7s');
    await page.waitForTimeout(4000);

    for (let i = 0; i < 2; i++) {
        const html = await page.content();
        const $ = cheerio.load(html);
        const categories = $('.hfpxzc');
        const lastCategoryLabel = categories.last().attr('aria-label');
        await page.locator(`text=${lastCategoryLabel}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(4000);
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    const links = $('.hfpxzc').map((i, el) => $(el).attr('href')).get();
    const restaurants = $('.hfpxzc').map((i, el) => $(el).attr('aria-label')).get();

    let data = [];

    for (let i = 0; i < links.length; i++) {
        await page.goto(links[i]);
        await page.waitForTimeout(4000);
        await page.locator("text='Reviews'").first().click();
        await page.waitForTimeout(4000);
        const reviewHtml = await page.content();
        const review$ = cheerio.load(reviewHtml);
        const reviews = review$('.MyEned').map((i, el) => review$(el).find('span').text()).get();
        reviews.forEach(review => {
            console.log(restaurants[i]);
            console.log(review);
            console.log('\n');
            data.push([restaurants[i], review]);
        });
    }

    await writeFile('data.csv', data.map(row => row.join(',')).join('\n'));
    await browser.close();
})();
