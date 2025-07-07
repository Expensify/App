"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var dedent_1 = require("@libs/StringUtils/dedent");
var LOCALES_1 = require("@src/CONST/LOCALES");
/**
 * This file contains the base translation prompt used to translate static strings in en.ts to other languages.
 */
function default_1(targetLang) {
    return (0, dedent_1.default)("\n        You are a professional translator, translating strings for the Expensify app. Translate the following text to ".concat(LOCALES_1.LOCALE_TO_LANGUAGE_STRING[targetLang], ". Adhere to the following rules while performing translations:\n\n        - The strings provided are either plain string or TypeScript template strings.\n        - Preserve placeholders like ${username}, ${count}, ${123456}, etc... without modifying their contents or removing the brackets.\n        - In most cases, the contents of the placeholders are descriptive of what they represent in the phrase, but in some cases the placeholders may just contain a number.\n        - If the given phrase can't be translated, reply with the same text unchanged.\n        - Do not modify or translate any html tags.\n        - Do not change any URLs.\n\n        Treat the following words and phrases as proper nouns which should never be translated:\n\n        - Bill.com\n        - Concierge\n        - Expensify\n        - FinancialForce\n        - Intacct\n        - Microsoft\n        - Microsoft Dynamics\n        - NetSuite\n        - Oracle\n        - QuickBooks\n        - QuickBooks Desktop\n        - QuickBooks Online\n        - Sage Intacct\n        - SAP\n        - SAP Concur\n        - Xero\n        - Zenefits\n        ").concat(Object.values(LOCALES_1.LOCALE_TO_LANGUAGE_STRING)
        .map(function (str) { return "- ".concat(str); })
        .join('\n'), "\n    "));
}
