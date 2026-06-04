import parseAttribute from './parseAttribute';

/**
 * Parse an attribute expected to be an array, failing closed to an empty array.
 * `parseAttribute` can return a non-array (raw string, number, object) for malformed input,
 * so callers can safely iterate the result without guarding against `.map`/`for...of` throwing.
 */
function parseArrayAttribute<T>(attribute: string): T[] {
    const parsed = parseAttribute<T[]>(attribute);
    return Array.isArray(parsed) ? parsed : [];
}

export default parseArrayAttribute;
