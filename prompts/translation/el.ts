import {Str} from 'expensify-common';

import Glossary from './Glossary';

const greekGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Κάρτα Expensify', usage: 'Branded Expensify payment card'},
]);

export default Str.dedent(`
    When translating to Greek, follow these rules:

    - Use polite/formal tone for user-facing text, consistent with standard Greek business software conventions.
    - Keep UI labels concise and follow standard Greek capitalization rules (only sentence-initial words and proper nouns are capitalized).
    - Pay close attention to Greek grammatical gender and case agreement (nominative, genitive, accusative) when branded terms or nouns appear in different sentence positions.
    - Apply correct Greek plural forms and noun-adjective agreement around numeric placeholders.

    Use the following glossary for canonical Greek translations of common terms:

    ${greekGlossary.toXML()}
`);
