/** Lays a typed answer out in the field's display format, so `231470` reads `23-14-70`. An answer that does not fit the format, or that the field would reject once laid out, is returned as typed. */
import type {DynamicFormTextField} from '@src/types/onyx';

import {matchesRegex} from './getDynamicFieldErrors';

const CHARACTER_PLACEHOLDER = '*';

function formatWithDisplayFormat(answer: string, field: Pick<DynamicFormTextField, 'key' | 'displayFormat' | 'regex' | 'maxLength'>): string {
    if (!field.displayFormat || !answer) {
        return answer;
    }
    const separators = new Set(field.displayFormat.replaceAll(CHARACTER_PLACEHOLDER, ''));
    const characters = [...answer].filter((character) => !separators.has(character));
    let formatted = '';
    let placedCount = 0;
    for (const symbol of field.displayFormat) {
        if (placedCount === characters.length) {
            break;
        }
        if (symbol === CHARACTER_PLACEHOLDER) {
            formatted += characters.at(placedCount);
            placedCount++;
        } else {
            formatted += symbol;
        }
    }
    const isTooLong = placedCount < characters.length || (field.maxLength !== undefined && formatted.length > field.maxLength);
    if (isTooLong || (field.regex && !matchesRegex(formatted, field.regex, field.key))) {
        return answer;
    }
    return formatted;
}

export default formatWithDisplayFormat;
