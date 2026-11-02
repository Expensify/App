import {Str} from 'expensify-common';
import Glossary from './Glossary';

const simplifiedChineseGlossary = new Glossary([
    // Branded product names
    {sourceTerm: 'Expensify Card', targetTerm: 'Expensify 卡', usage: 'Branded Expensify payment card'},
]);

export default Str.dedent(`
    When translating to Simplified Chinese, follow these rules:

    - Keep UI labels concise and follow standard Simplified Chinese conventions.
    - Use standard Simplified Chinese financial and technical terminology.
    - Use full-width punctuation where appropriate per Chinese typographic conventions.

    Use the following glossary for canonical Simplified Chinese translations of common terms:

    ${simplifiedChineseGlossary.toXML()}
`);
