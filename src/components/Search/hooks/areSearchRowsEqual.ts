import {deepEqual} from 'fast-equals';

/**
 * The participant fields a Search row renders. A personal-details record also carries pronouns, timezone, phone number
 * and validation state, which the OpenReport response adds and the next Search response drops again, so comparing the
 * whole record would make every row of that participant look changed twice per report open.
 */
const RENDERED_PARTICIPANT_KEYS = ['accountID', 'displayName', 'avatar', 'login'] as const;

const PARTICIPANT_KEYS = new Set(['from', 'to']);

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value) as unknown;
    return prototype === Object.prototype || prototype === null;
}

function isParticipant(value: unknown): value is PlainObject {
    return isPlainObject(value) && 'accountID' in value;
}

function areParticipantsEqual(a: PlainObject, b: PlainObject): boolean {
    return RENDERED_PARTICIPANT_KEYS.every((key) => areRowValuesEqual(a[key], b[key]));
}

/**
 * Keys holding `undefined` count as absent. The snapshot and the row projection produce both shapes for the same state
 * (a field written as `undefined` by one response and left out by the next), and fast-equals treats them as different.
 */
function arePlainObjectsEqual(a: PlainObject, b: PlainObject): boolean {
    for (const key of Object.keys(a)) {
        const valueA = a[key];
        const valueB = b[key];
        if (valueA === undefined && valueB === undefined) {
            continue;
        }
        if (valueA === undefined || valueB === undefined) {
            return false;
        }
        if (PARTICIPANT_KEYS.has(key) && isParticipant(valueA) && isParticipant(valueB)) {
            if (!areParticipantsEqual(valueA, valueB)) {
                return false;
            }
            continue;
        }
        if (!areRowValuesEqual(valueA, valueB)) {
            return false;
        }
    }
    for (const key of Object.keys(b)) {
        if (b[key] !== undefined && a[key] === undefined) {
            return false;
        }
    }
    return true;
}

function areRowValuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        return a.every((value, index) => areRowValuesEqual(value, b.at(index)));
    }
    if (isPlainObject(a) && isPlainObject(b)) {
        return arePlainObjectsEqual(a, b);
    }
    // Anything else (Date, Map, Set, class instances, primitives that failed the identity check) gets the library's answer.
    return deepEqual(a, b);
}

/**
 * Deep equality for Search rows, tuned to what a row renders: `undefined`-valued keys count as absent, and participants
 * (`from` / `to` at any depth, including a group's nested transactions) compare by their rendered fields only. A row
 * that is equal under this check can keep its previous object, and FlashList skips re-rendering it.
 */
function areSearchRowsEqual(a: unknown, b: unknown): boolean {
    return areRowValuesEqual(a, b);
}

export default areSearchRowsEqual;
export {RENDERED_PARTICIPANT_KEYS};
