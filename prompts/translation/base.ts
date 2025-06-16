import dedent from '@libs/StringUtils/dedent';
import {LOCALE_TO_LANGUAGE_STRING} from '@src/CONST/LOCALES';
import type {TranslationTargetLanguage} from '@src/CONST/LOCALES';

/**
 * This file contains the base translation prompt used to translate static strings in en.ts to other languages.
 */
export default function (targetLang: TranslationTargetLanguage): string {
    return dedent(`
        You are a professional translator, translating strings for the Expensify app. Translate the following text to ${LOCALE_TO_LANGUAGE_STRING[targetLang]}. Adhere to the following rules while performing translations:

        - The strings provided are either plain string or TypeScript template strings.
        - Preserve placeholders like \${username}, \${count}, \${123456}, etc... without modifying their contents or removing the brackets.
        - In most cases, the contents of the placeholders are descriptive of what they represent in the phrase, but in some cases the placeholders may just contain a number.
        - If the given phrase can't be translated, reply with the same text unchanged.
        - Do not modify or translate any html tags.
        - Do not change any URLs.

        Treat the following words and phrases as proper nouns which should never be translated:

        - Bill.com
        - Concierge
        - Expensify
        - FinancialForce
        - Intacct
        - Microsoft
        - Microsoft Dynamics
        - NetSuite
        - Oracle
        - QuickBooks
        - QuickBooks Desktop
        - QuickBooks Online
        - Sage Intacct
        - SAP
        - SAP Concur
        - Xero
        - Zenefits
        ${Object.values(LOCALE_TO_LANGUAGE_STRING)
            .map((str) => `- ${str}`)
            .join('\n')}
    `);
}
