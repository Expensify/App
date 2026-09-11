import type {ApiRequestCommandParameters, WriteCommand} from '@libs/API/types';
import type baseWrite from '@libs/API/write';
import type {WriteReadyBarrier} from '@libs/API/writeWhenReady';

import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

const write = jest.requireActual<{default: typeof baseWrite}>('@libs/API/write').default;

/**
 * Runs the write inline instead of holding it until its barrier resolves, so a suite sees the Onyx state the flow
 * settles on. In a test that barrier usually never resolves - a transition barrier has no transition to wait on, and
 * the `SAFETY_TIMEOUT_MS` fallback does not fire under the globally enabled fake timers - so deferred optimistic data
 * would otherwise read back as `undefined`. Stays a `jest.fn`, so suites can still assert the command and barrier.
 */
const writeWhenReady = jest.fn(
    <TCommand extends WriteCommand, TKey extends OnyxKey>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData?: OnyxData<TKey>) =>
        write(command, apiCommandParameters, onyxData),
);

/** Never settles - the `writeWhenReady` above writes inline and ignores it. A `jest.fn` so suites can assert the barrier kind. */
const createTransitionBarrier = jest.fn((): WriteReadyBarrier => () => new Promise(() => {}));

/** Re-exported from the real module so suites that feed it into timer control still read a number. */
const {SAFETY_TIMEOUT_MS} = jest.requireActual<{SAFETY_TIMEOUT_MS: number}>('@libs/API/writeWhenReady');

export {writeWhenReady, createTransitionBarrier, SAFETY_TIMEOUT_MS};
