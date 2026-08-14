import type {ApiRequestCommandParameters, WriteCommand} from '@libs/API/types';
import type * as writeImport from '@libs/API/write';
import type {WriteReadyBarrier} from '@libs/API/writeWhenReady';

import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

const write = jest.requireActual<typeof writeImport>('@libs/API/write').default;

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
 */
const writeWhenReady = jest.fn(
    <TCommand extends WriteCommand, TKey extends OnyxKey>(command: TCommand, apiCommandParameters: ApiRequestCommandParameters[TCommand], onyxData?: OnyxData<TKey>) =>
        write(command, apiCommandParameters, onyxData),
);

/**
 * Returns a barrier that never settles. `writeWhenReady` above has already written by the time this is handed
 * back, so a barrier that resolved would run the write a second time.
 */
const createTransitionBarrier = jest.fn((): WriteReadyBarrier => () => new Promise(() => {}));

export {writeWhenReady, createTransitionBarrier};
