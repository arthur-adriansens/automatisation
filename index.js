// SETUP
import puppeteer from "puppeteer-core";
import prompt from "prompt-sync";
import "dotenv/config";

const ask = prompt();

const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.CHROME_PATH,
});

try {
    console.log("Browser started.");

    const page = await browser.newPage();
    await page.setViewport({ deviceScaleFactor: 2, width: 1920, height: 1080 });
    await page.goto(process.env.URL, { waitUntil: "networkidle0" });

    ask("Click on an invoice and press Enter to start...");
    await main(page);
} catch (e) {
    console.error("Error while running bot:", e);
} finally {
    await browser.close();
    console.log("closed");
}

async function main(page) {
    while (true) {
        console.log("");
        let answer = ask("Press Enter to continue (type anything else to stop)...");
        if (answer !== "") break;

        // Check if invoice has comments
        const comments = await page.$("table.comment_section tbody[ng-hide]");
        if (comments) {
            console.log("\x1b[31m%s\x1b[0m", "Found comment, manual editing required...");
            continue;
        }

        // Check if invoice has a €0,00 value
        const prices = await page.$$("table.invoicedetail tr.invoiceline :last-child");
        let hasZeroPrice = false;

        for (let price of prices) {
            hasZeroPrice = await page.evaluate((cell) => cell.innerHTML == "0,00 €", price);

            if (hasZeroPrice) {
                console.log("\x1b[31m%s\x1b[0m", "Found zero/empty invoice, manual editing required...");
                break;
            }

            await price.dispose();
        }

        if (!hasZeroPrice && !comments) {
            console.log("\x1b[32m%s\x1b[0m", "No issues found, clicking button...");
            await page.locator("table.invoicedetail tr[ng-show] button").click();
        }
    }
}

// table.comment_section
// "".tbody has "ng-hide"

// table.invoicedetail
// "" loop over tr met .invoiceline
//  laatste element in tr =>> td innerhtml == "0,00 €"
// tr met ng-show="..." ==> button clicken, dan stoppen, want daarna nog een ng-show
