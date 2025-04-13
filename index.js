// SETUP
puppeteer = require("puppeteer");
require("dotenv").config();

const browser = await puppeteer.launch({
    headless: false,
    args: ["--user-data-dir=/user/data/directory/profile_n"],
});

table.comment_section
"".tbody has "ng-hide"

table.invoicedetail
"" loop over tr met .invoiceline
 laatste element in tr =>> td innerhtml == "0,00 €"
tr met ng-show="..." ==> button clicken, dan stoppen, want daarna nog een ng-show