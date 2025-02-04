const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

const url = "https://www.leetchi.com/fr/c/solidarite-cgt-mobilisation"

puppeteer.use(StealthPlugin());

async function scrapeWithPuppeteer(url) {
    console.log("Scraping en cours...");

    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Vérifier si l'élément existe avant de l'extraire
    const amountExists = await page.$('span[data-testid="MoneyPotAmount-CollectedAmount"]');
    if (amountExists) {
        const amount = await page.$eval('span[data-testid="MoneyPotAmount-CollectedAmount"]', el => el.textContent.trim());
        console.log("Montant:", amount);
        fs.writeFileSync('amount.txt', amount, 'utf8');
        console.log("Le montant a été sauvegardé dans amount.txt");
    } else {
        console.log("L'élément du montant n'a pas été trouvé !");
    }

    await browser.close();
}

setInterval(() => {
    scrapeWithPuppeteer(url);
}, 10000);

scrapeWithPuppeteer(url);
