import lodashDeepClone from 'lodash/cloneDeep';

import type {ReadonlyOnyx} from '@src/types/onyx';

/**
 * Deep-clones a readonly Onyx value into a mutable one.
 *
 * `lodash/cloneDeep` is typed `<T>(value: T) => T`, so cloning a `ReadonlyOnyx<T>` returns a
 * `ReadonlyOnyx<T>` even though the clone is a fresh object no one else holds. The assertion restores
 * the mutability the clone actually has, and lives here so the codebase has exactly one of them.
 */
function cloneMutable<T>(value: ReadonlyOnyx<T>): T {
    return lodashDeepClone(value) as T;
}

export default cloneMutable;
