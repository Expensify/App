import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const japaneseGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Expensify カード', usage: 'Branded Expensify payment card'},
]);

export default dedent(`
    When translating to Japanese, follow these rules:

    - Use polite form (です/ます) for user-facing text.
    - Keep UI labels concise; prefer katakana for common English loanwords used in tech/finance contexts.
    - Use standard Japanese punctuation conventions (full-width characters where appropriate).

    Use the following glossary for canonical Japanese translations of common terms:

    ${japaneseGlossary.toXML()}
`);
