import StringUtils from '../../src/libs/StringUtils';

export default function (context?: string) {
    if (!context) {
        return '';
    }
    return StringUtils.dedent(`
        When translating this phrase, consider this additional context which clarifies the intended meaning:

        ${context}
    `);
}
