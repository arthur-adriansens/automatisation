// SETUP
import puppeteer from "puppeteer-core";
import prompt from "prompt-sync";

const ask = prompt();

const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
});

try {
    console.log("Browser started.");

    const page = await browser.newPage();
    await page.setViewport({ deviceScaleFactor: 2, width: 1920, height: 1080 });
    await page.goto("file:///C:/Users/arthu/Documents/projects/git%20clones/automatisation/replica.html", { waitUntil: "networkidle0" });

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
            console.log("Found comment, skipping...");
            continue;
        }

        // Check if invoice has a €0,00 value
        const prices = await page.$$("table.invoicedetail tr.invoiceline :last-child");
        let hasZeroPrice = false;

        for (let price of prices) {
            hasZeroPrice = await page.evaluate((cell) => cell.innerHTML == "0,00 €", price);

            if (hasZeroPrice) {
                console.log("Found zero/empty invoice, skipping...");
                break;
            }

            await price.dispose();
        }

        if (!hasZeroPrice && !comments) {
            console.log("No issues found, clicking button...");
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
