const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

const url = "https://www.leetchi.com/fr/c/apolline-le-traitement-de-la-derniere-chance-2756879"; // Lien à scraper

puppeteer.use(StealthPlugin());

async function scrapeWithPuppeteer(url) {
    console.log("🔄 Scraping en cours...");

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        // Augmenter le timeout et éviter les erreurs de navigation
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Vérifier si l'élément du montant existe avant de l'extraire
        const amountExists = await page.$('span[data-testid="MoneyPotAmount-CollectedAmount"]');
        
        if (amountExists) {
            const amount = await page.$eval('span[data-testid="MoneyPotAmount-CollectedAmount"]', el => el.textContent.trim());
            console.log("💰 Montant récupéré:", amount);
            fs.writeFileSync('amount.txt', amount, 'utf8');
            console.log("✅ Le montant a été sauvegardé dans amount.txt");
        } else {
            console.log("⚠️ L'élément du montant n'a pas été trouvé !");
        }

        // Récupérer le nom du dernier donateur
        const donorSelector = 'p[data-testid="LtContribution-Item-Name"]';
        const donorExists = await page.$(donorSelector);

        if (donorExists) {
            const lastDonor = await page.$eval(donorSelector, el => el.textContent.trim());

            console.log(`🧑 Dernier donateur: ${lastDonor}`)
            console.log("✅ Le donateur a été sauvegardé dans lastdonator.txt");
            fs.writeFileSync('lastdonation.txt', lastDonor, 'utf8');

            // Récupérer le montant si disponible
            const amountSelector = 'span[data-testid="LtContribution-Item-Amount"]';
            let lastDonationAmount = "Montant non affiché"; // Valeur par défaut

            const amountExists = await page.$(amountSelector);
            if (amountExists) {
                lastDonationAmount = await page.$eval(amountSelector, el => el.textContent.trim());
                console.log(`💰 Montant du don: ${lastDonationAmount}`);
                fs.writeFileSync('lastdonation.txt', lastDonationAmount, 'utf8');
            } else {
                console.log(`💰❌ Le don n'est pas visible !`);
                fs.writeFileSync('lastdonation.txt', "", 'utf8');
            }
            console.log("✅ Le montant du donateur a été sauvegardé dans lastdonation.txt");
        } else {
            console.log("⚠️ Aucun donateur trouvé !");
        }

    } catch (error) {
        console.error("❌ Erreur lors du scraping :", error.message);
    } finally {
        await browser.close(); // S'assurer que le navigateur est toujours fermé
    }
}

// Exécuter le scraping toutes les 10 secondes avec une meilleure gestion des erreurs
setInterval(() => {
    scrapeWithPuppeteer(url);
}, 10000);

// Exécuter immédiatement au démarrage
scrapeWithPuppeteer(url);