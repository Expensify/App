import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const dutchGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Expensify Kaart', usage: 'Branded Expensify payment card'},
]);

export default dedent(`
    When translating to Dutch, follow these rules:

    - Use informal "je/jij" for user-facing text to match the existing tone of the app.
    - Keep UI labels concise and follow standard Dutch capitalization rules.
    - Use standard Dutch financial and technical terminology.

    Use the following glossary for canonical Dutch translations of common terms:

    ${dutchGlossary.toXML()}
`);
