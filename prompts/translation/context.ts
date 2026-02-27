import dedent from '@libs/StringUtils/dedent';

export default function (context?: string) {
    if (!context) {
        return '';
    }
    return dedent(`
        When translating this phrase, consider this additional context which clarifies the intended meaning:

        ${context}
    `);
}
