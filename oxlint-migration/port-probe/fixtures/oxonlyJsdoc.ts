// Parity fixture for the jsdoc population production enables through oxlint's native `jsdoc`
// plugin while the production ESLint config leaves off: check-tag-names, require-param and
// require-param-type. One violation per rule. `constant()` below is the control -- a block that
// satisfies all three, so the rows cannot be pinned by a fixture that would pass even if the
// rules never ran.

/**
 * The answer, carrying a tag no parser or tool defines.
 *
 * @foo not a real tag
 */
export const ANSWER = 42;

/**
 * Doubles a number, documenting nothing about its only parameter.
 */
export function double(value: number): number {
    return value * 2;
}

/**
 * Halves a number.
 *
 * @param value the number
 */
export function halve(value: number): number {
    return value / 2;
}

/**
 * A control: no parameters to document, and every tag it uses is a real one.
 *
 * @returns a constant
 */
export function constant(): number {
    return 1;
}
