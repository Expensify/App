import dedent from '@libs/StringUtils/dedent';
import Glossary from './Glossary';

const germanGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Expensify Karte', usage: 'Branded Expensify payment card'},
]);

export default dedent(`
    When translating to German, follow these rules:

    - Use formal "Sie" for user-facing text unless the source explicitly uses informal tone.
    - Keep UI labels concise and follow standard German capitalization rules (capitalize all nouns).
    - Use standard German compound word conventions for technical and financial terms.

    Use the following glossary for canonical German translations of common terms:

    ${germanGlossary.toXML()}
`);
