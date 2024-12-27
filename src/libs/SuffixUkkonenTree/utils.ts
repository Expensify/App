/* eslint-disable rulesdir/prefer-at */ // .at() has a performance overhead we explicitly want to avoid here
/* eslint-disable no-continue */

const CHAR_CODE_A = 'a'.charCodeAt(0);
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const LETTER_ALPHABET_SIZE = ALPHABET.length;
const ALPHABET_SIZE = LETTER_ALPHABET_SIZE + 3; // +3: special char, delimiter char, end char
const SPECIAL_CHAR_CODE = ALPHABET_SIZE - 3;
const DELIMITER_CHAR_CODE = ALPHABET_SIZE - 2;
const END_CHAR_CODE = ALPHABET_SIZE - 1;

// Store the results for a char code in a lookup table to avoid recalculating the same values (performance optimization)
const base26LookupTable = new Array<number[]>();

/**
 * Converts a number to a base26 representation.
 */
function convertToBase26(num: number): number[] {
    if (base26LookupTable[num]) {
        return base26LookupTable[num];
    }
    if (num < 0) {
        throw new Error('convertToBase26: Input must be a non-negative integer');
    }

    const result: number[] = [];

    do {
        // eslint-disable-next-line no-param-reassign
        num--;
        result.unshift(num % 26);
        // eslint-disable-next-line no-bitwise, no-param-reassign
        num >>= 5; // Equivalent to Math.floor(num / 26), but faster
    } while (num > 0);

    base26LookupTable[num] = result;
    return result;
}

/**
 * Converts a string to an array of numbers representing the characters of the string.
 * Every number in the array is in the range [0, ALPHABET_SIZE-1] (0-28).
 *
 * The numbers are offset by the character code of 'a' (97).
 * - This is so that the numbers from a-z are in the range 0-28.
 * - 26 is for encoding special characters. Character numbers that are not within the range of a-z will be encoded as "specialCharacter + base26(charCode)"
 * - 27 is for the delimiter character
 * - 28 is for the end character
 *
 * Note: The string should be converted to lowercase first (otherwise uppercase letters get base26'ed taking more space than necessary).
 */
function stringToNumeric(
    // The string we want to convert to a numeric representation
    input: string,
    options?: {
        // A set of characters that should be skipped and not included in the numeric representation
        charSetToSkip?: Set<string>;
        // When out is provided, the function will write the result to the provided arrays instead of creating new ones (performance)
        out?: {
            outArray: Uint8Array;
            // As outArray is a ArrayBuffer we need to keep track of the current offset
            offset: {value: number};
            // A map of <PositionInOutArray, IndexInOriginalData> to map the found occurrences to the correct data set
            // As the search string can be very long for high traffic accounts (500k+), this has to be big enough, thus its a Uint32Array
            outOccurrenceToIndex?: Uint32Array;
            // The index that will be used in the outOccurrenceToIndex array (this is the index of your original data position)
            index?: number;
        };
        // By default false. By default the outArray may be larger than necessary. If clamp is set to true the outArray will be clamped to the actual size.
        clamp?: boolean;
    },
): {
    numeric: Uint8Array;
    occurrenceToIndex: Uint32Array;
    offset: {value: number};
} {
    // The out array might be longer than our input string length, because we encode special characters as multiple numbers using the base26 encoding.
    // * 6 is because the upper limit of encoding any char in UTF-8 to base26 is at max 6 numbers.
    const outArray = options?.out?.outArray ?? new Uint8Array(input.length * 6);
    const offset = options?.out?.offset ?? {value: 0};
    const occurrenceToIndex = options?.out?.outOccurrenceToIndex ?? new Uint32Array(input.length * 16 * 4);
    const index = options?.out?.index ?? 0;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (options?.charSetToSkip?.has(char)) {
            continue;
        }

        if (char >= 'a' && char <= 'z') {
            // char is an alphabet character
            occurrenceToIndex[offset.value] = index;
            outArray[offset.value++] = char.charCodeAt(0) - CHAR_CODE_A;
        } else {
            const charCode = input.charCodeAt(i);
            occurrenceToIndex[offset.value] = index;
            outArray[offset.value++] = SPECIAL_CHAR_CODE;
            const asBase26Numeric = convertToBase26(charCode);
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let j = 0; j < asBase26Numeric.length; j++) {
                occurrenceToIndex[offset.value] = index;
                outArray[offset.value++] = asBase26Numeric[j];
            }
        }
    }

    return {
        numeric: options?.clamp ? outArray.slice(0, offset.value) : outArray,
        occurrenceToIndex,
        offset,
    };
}

export {stringToNumeric, ALPHABET, ALPHABET_SIZE, SPECIAL_CHAR_CODE, DELIMITER_CHAR_CODE, END_CHAR_CODE};
