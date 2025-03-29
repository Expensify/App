import type {Entries} from 'type-fest';

/**
 * This utility is a simple wrapped around Object.entries that preserves key specificity. For example, if you do:
 *
 * const myThing = Object.entries({
 *    a: 1,
 *    b: 2,
 * });
 *
 * Then myThing will have type `[string, number][]`. If you do then do this:
 *
 * for (const [key, value] of myThing) {
 * }
 *
 * then `key` will have type `string`, and `value` will have type `number`.
 *
 * Meanwhile, if you do:
 *
 * const myBetterThing = Object.entries({
 *     a: 1,
 *     b: 2,
 * });
 *
 * Then myBetterThing will have type `Entries<{a: number, b: number}>`.
 * Thanks to the magic in type-fest's Entries utility, if you then do this:
 *
 * for (const [key, value] of myBetterThing) {
 * }
 *
 * Then `key` will have type `'a' | 'b'`, and `value` will have type `number`.
 * So the specific keys of your object were preserved.
 *
 * Note: We disable the @typescript-eslint/ban-types lint rule for object specifically because this is a utility wrapper
 *       around Object.entries, so a generic object is actually a 100% correct representation of the type we want.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function typedEntries<T extends object>(obj: T): Entries<T> {
    return Object.entries(obj) as Entries<T>;
}

export default {
    typedEntries,
};
