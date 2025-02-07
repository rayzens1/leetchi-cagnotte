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
        // Charger la page et attendre que les éléments soient présents
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Vérifier si l'élément du montant existe avant de l'extraire
        const amountExists = await page.$('span[data-testid="MoneyPotAmount-CollectedAmount"]');
                
        if (amountExists) {
            const amount = await page.$eval('span[data-testid="MoneyPotAmount-CollectedAmount"]', el => el.textContent.trim());
            console.log("\n💰 Montant récupéré:", amount);
            fs.writeFileSync('amount.txt', amount, 'utf8');
            console.log("✅ Le montant a été sauvegardé dans amount.txt\n");
        } else {
            console.log("⚠️ L'élément du montant n'a pas été trouvé !");
        }

        // Récupérer la liste des contributions
        const contributions = await page.$$('div[data-testid="LtContribution-Item"]');

        if (contributions.length > 0) {
            // Récupérer le dernier donateur (le premier dans la liste des contributions)
            const lastContribution = contributions[0]; // Le plus récent est en haut

            // Extraire le nom du donateur
            const donorExists = await lastContribution.$('p[data-testid="LtContribution-Item-Name"]');
            let lastDonor = "Inconnu";
            
            if (donorExists) {
                lastDonor = await lastContribution.$eval('p[data-testid="LtContribution-Item-Name"]', el => el.textContent.trim());
            }

            // Extraire le montant si disponible
            const amountExists = await lastContribution.$('span[data-testid="LtContribution-Item-Amount"]');
            let lastDonationAmount = "Montant non affiché";
            
            if (amountExists) {
                lastDonationAmount = await lastContribution.$eval('span[data-testid="LtContribution-Item-Amount"]', el => el.textContent.trim());
                fs.writeFileSync('lastdonation.txt', `${lastDonationAmount}\n`, 'utf8');
            } else {
                fs.writeFileSync('lastdonation.txt', ``, 'utf8');
            }

            console.log(`🧑 Dernier donateur: ${lastDonor}`);
            console.log(`💰 Montant du don: ${lastDonationAmount}`);

            // Sauvegarder dans lastdonator.txt et lastdonation.txt
            fs.writeFileSync('lastdonator.txt', `${lastDonor}`, 'utf8');

            console.log("✅ Informations sauvegardées.\n");
        } else {
            console.log("⚠️ Aucun donateur trouvé !");
        }

    } catch (error) {
        console.error("❌ Erreur lors du scraping :", error.message);
    } finally {
        await browser.close(); // Fermer le navigateur
    }
}

// Exécuter le scraping toutes les 10 secondes
setInterval(() => {
    scrapeWithPuppeteer(url);
}, 30000);

// Exécuter immédiatement au démarrage
scrapeWithPuppeteer(url);
