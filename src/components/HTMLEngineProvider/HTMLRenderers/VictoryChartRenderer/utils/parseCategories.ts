import lodashIsObject from 'lodash/isObject';
import parseAttribute from './parseAttribute';

/**
 * Translate VictoryChart's `categories` attribute into string[].
 */
function parseCategories(attribute: string): string[] | undefined {
    const categories = parseAttribute(attribute);
    if (lodashIsObject(categories)) {
        if ('x' in categories && Array.isArray(categories.x)) {
            return categories.x.map(String);
        }
    }
    return undefined;
}

export default parseCategories;
