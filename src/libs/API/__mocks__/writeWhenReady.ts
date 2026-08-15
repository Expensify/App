import type {ApiRequestCommandParameters, WriteCommand} from '@libs/API/types';
import type baseWrite from '@libs/API/write';
import type {WriteReadyBarrier} from '@libs/API/writeWhenReady';

import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

const write = jest.requireActual<{default: typeof baseWrite}>('@libs/API/write').default;

/**
 * Jest manual mock for `writeWhenReady`, enabled by a bare `jest.mock('@libs/API/writeWhenReady')`.
 *
 * The real `writeWhenReady` holds its write — optimistic data included — until a transition barrier resolves.
 * No screen transition ever starts in a unit test, so the barrier never opens, and because Jest fake timers are
 * enabled globally (see `fakeTimers` in jest.config.js) the `SAFETY_TIMEOUT_MS` fallback that would otherwise
 * release it never fires either. Left unmocked, every assertion that reads deferred optimistic data back out of
 * Onyx sees `undefined`.
 *
 * This runs the write inline through the same `write()` the real implementation delegates to, so a test observes
 * the Onyx state the flow settles on once its barrier resolves. Both exports stay `jest.fn`s, so a suite that
 * cares about the deferral itself can still assert on the recorded command and barrier.
 *
 * Opting in is suite-wide, not per-flow: `jest.mock('@libs/API/writeWhenReady')` un-defers every caller in the
 * suite. Today `SplitTransactionUpdate.ts` is the only production caller, but `deferOrExecuteWrite` is being
 * migrated onto this module - once those flows land, this mock will silently un-defer them and no test will fail.
 */
const writeWhenReady = jest.fn(
    <TCommand extends WriteCommand, TKey extends OnyxKey>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData?: OnyxData<TKey>) =>
        write(command, apiCommandParameters, onyxData),
);

/**
 * Returns a barrier that never settles. Nothing invokes it in a mocked suite - the `writeWhenReady` above
 * writes inline and ignores its barrier argument. It stays a `jest.fn` so suites can still assert which
 * barrier kind the production code asked for.
 */
const createTransitionBarrier = jest.fn((): WriteReadyBarrier => () => new Promise(() => {}));

/**
 * Re-exported from the real module so the mock matches its full surface. A suite that mocks this module and
 * also feeds this constant into timer control (as `tests/unit/APIWriteWhenReadyTest.ts` does) would otherwise
 * read `undefined` and fail somewhere that points nowhere near this file.
 */
const {SAFETY_TIMEOUT_MS} = jest.requireActual<{SAFETY_TIMEOUT_MS: number}>('@libs/API/writeWhenReady');

export {writeWhenReady, createTransitionBarrier, SAFETY_TIMEOUT_MS};
