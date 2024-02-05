import type {IsEqual} from 'type-fest';

/**
 * The 'AssertTypesEqual' type here enforces that `T1` and `T2` match exactly.
 * If `T1` or `T2` are different this type will cause a compile-time error
 */
type AssertTypesEqual<T1, T2 extends IsEqual<T1, T2> extends true ? T1 : never> = T1 & T2;

export default AssertTypesEqual;
