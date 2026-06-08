import JSON5 from 'json5';

/**
 * Parse attribute as JSON or fallback to input as is.
 * Example: "20" -> 20
 *        : "[ {x: 'Jan', y: 3} ]" -> `[{"x": "Jan", "y": 3}]` (Valid RFC 8259)
 *        : "Green" -> "Green"
 */
function parseAttribute(attribute: string): unknown {
    if (!attribute) {
        return undefined;
    }
    try {
        // Using JSON5 instead of JSON because the former is not as strict as the later e.g. can parse objects with non-stringified fields `'{x: 100}'`
        return JSON5.parse(attribute);
    } catch {
        return attribute;
    }
}

function parseAttributeAsString(attribute: string): string | undefined {
    const parsedValue = parseAttribute(attribute);
    if (typeof parsedValue === 'string') {
        return parsedValue;
    }
    return undefined;
}

function parseAttributeAsStringArray(attribute: string): string[] | undefined {
    const parsedValue = parseAttribute(attribute);
    if (Array.isArray(parsedValue)) {
        return parsedValue.filter((element): element is string => typeof element === 'string');
    }
    return undefined;
}

function parseAttributeAsNumber(attribute: string): number | undefined {
    const parsedValue = parseAttribute(attribute);
    if (typeof parsedValue === 'number') {
        return parsedValue;
    }
    if (typeof parsedValue === 'string' && Number.isFinite(Number(parsedValue))) {
        return Number(parsedValue);
    }
    return undefined;
}

function parseAttributeAsNumberArray(attribute: string): number[] | undefined {
    const parsedValue = parseAttribute(attribute);
    if (Array.isArray(parsedValue)) {
        return parsedValue.filter((element): element is number => {
            if (typeof element === 'number') {
                return true;
            }
            if (typeof element === 'string' && Number.isFinite(Number(element))) {
                return true;
            }
            return false;
        });
    }
    return undefined;
}

export {parseAttributeAsString, parseAttributeAsStringArray, parseAttributeAsNumber, parseAttributeAsNumberArray};

export default parseAttribute;
