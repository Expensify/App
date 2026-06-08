import JSON5 from 'json5';

/**
 * Parse attribute as JSON or fallback to input as is.
 * Example: "20" -> 20
 *        : "[ {x: 'Jan', y: 3} ]" -> `[{"x": "Jan", "y": 3}]` (Valid RFC 8259)
 *        : "Green" -> "Green"
 */
function parseAttribute<T>(attribute: string): T | undefined {
    if (!attribute) {
        return undefined;
    }
    try {
        // Using JSON5 instead of JSON because the former is not as strict as the later e.g. can parse objects with non-stringified fields `'{x: 100}'`
        return JSON5.parse<T>(attribute);
    } catch {
        return attribute as T;
    }
}

export default parseAttribute;
