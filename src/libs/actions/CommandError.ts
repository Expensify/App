import ONYXKEYS from '@src/ONYXKEYS';
import type {CommandError} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

/**
 * Stores the backend rejection of an API command so `CommandErrorModal` can surface it. Only commands that
 * opted in through the `SurfaceCommandError` middleware reach this.
 */
function showCommandError(payload: CommandError) {
    Onyx.set(ONYXKEYS.RAM_ONLY_COMMAND_ERROR, payload);
}

/** Clears the stored rejection once the user has seen it, so the next failure of the same command surfaces again. */
function clearCommandError() {
    Onyx.set(ONYXKEYS.RAM_ONLY_COMMAND_ERROR, null);
}

export {showCommandError, clearCommandError};
