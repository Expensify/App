import dedent from '@libs/StringUtils/dedent';

export default dedent(`
    When translating to French, follow these rules:

    - Ensure proper spacing between sentences when French strings are concatenated (especially after periods).
    - Apply a single, consistent French convention for file transfer verbs (“télécharger” vs “téléverser”) across the app.
    - Translate “e-receipts” using the standardized French typographic form “e-reçus”.
    - Be cautious with English false cognates in French (e.g., “principal” = head of school, not “principal/main”).
    - Translate navigation terms like “Forward” according to UI navigation context, not as sending or transferring.
    - Translate video player controls like “Expand” using standard French UI conventions for enlarging a view.
    - Avoid literal translations of misleading compounds such as “report card”; use the meaning implied by the product context.
    - Apply required French spacing before punctuation such as “:”, “?” (and other French typography conventions), when applicable.
    - Use standardized FR technical terms where applicable (e.g., prefer “booléens” for “boolean fields” in debug contexts) only for French.
`);
