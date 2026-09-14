/**
 * A drop-in replacement for `Array.isArray` that keeps the element type of a readonly array.
 *
 * The lib declaration is `isArray(arg: any): arg is any[]`, and `readonly T[]` is not assignable to
 * `any[]`, so narrowing a readonly array with `Array.isArray` collapses it to `any[]` and every access
 * on it becomes an unsafe-`any` lint error. Extracting the array member of the union instead keeps
 * `readonly T[]` (and a mutable `T[]`) intact. Needed wherever an Onyx read is typed `ReadonlyDeep`.
 */
function isArray<T>(value: T): value is Extract<T, readonly unknown[]> {
    return Array.isArray(value);
}

export default isArray;
