import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const polishGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Karta Expensify', usage: 'Branded Expensify payment card'},
]);

export default dedent(`
    When translating to Polish, follow these rules:

    - Use informal tone for user-facing text to match the existing tone of the app.
    - Keep UI labels concise and follow standard Polish capitalization and grammar rules.
    - Pay attention to Polish declension when branded terms appear in different grammatical cases.

    Use the following glossary for canonical Polish translations of common terms:

    ${polishGlossary.toXML()}
`);
