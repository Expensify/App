import type {PartialDeep} from 'type-fest';

/**
 * Builds a typed mock object from a partial shape for use in tests. The partial is type-checked against the
 * real type, so typos and wrong value types are caught at the call site. The single unavoidable assertion to
 * the full type is isolated here, instead of being repeated as `as SomeType` at every mock in every test.
 */
function createMock<T>(value: PartialDeep<T, {recurseIntoArrays: true}>): T {
    return value as T;
}

export default createMock;
