import type {IsEqual} from 'type-fest';

type MatchError = 'Error: Types do match';

/**
 * The 'AssertTypesNotEqual' type here enforces that `T1` and `T2` do not match.
 * If `T1` or `T2` are the same this type will cause a compile-time error.
 */
type AssertTypesNotEqual<T1, T2 extends IsEqual<T1, T2> extends false ? T1 : TMatchError, TMatchError = MatchError> = T1 & T2;

export default AssertTypesNotEqual;
