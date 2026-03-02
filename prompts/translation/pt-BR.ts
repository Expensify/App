import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const brazilianPortugueseGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Cartão Expensify', usage: 'Branded Expensify payment card'},
]);

export default dedent(`
    When translating to Brazilian Portuguese, follow these rules:

    - Use informal "você" for user-facing text to match the existing tone of the app.
    - Keep UI labels concise and follow standard Brazilian Portuguese capitalization rules.
    - Use Brazilian Portuguese conventions rather than European Portuguese.

    Use the following glossary for canonical Brazilian Portuguese translations of common terms:

    ${brazilianPortugueseGlossary.toXML()}
`);
