import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const italianGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Carta Expensify', usage: 'Branded Expensify payment card'},
]);

export default dedent(`
    When translating to Italian, follow these rules:

    - Use informal "tu" for user-facing text to match the existing tone of the app.
    - Keep UI labels concise and follow standard Italian capitalization rules.
    - Use standard Italian financial and technical terminology.

    Use the following glossary for canonical Italian translations of common terms:

    ${italianGlossary.toXML()}
`);
