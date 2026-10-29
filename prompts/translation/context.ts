import {Str} from 'expensify-common';

export default function (context?: string) {
    if (!context) {
        return '';
    }
    return Str.dedent(`
        When translating this phrase, consider this additional context which clarifies the intended meaning:

        ${context}
    `);
}
