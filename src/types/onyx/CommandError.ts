/**
 * Payload stored under ONYXKEYS.COMMAND_ERROR when the backend rejects an API command that opted into
 * user-facing error surfacing. Used to trigger a global modal, so the error still reaches the user when the
 * screen that started the request has already been dismissed.
 */
type CommandError = {
    /** API command the backend rejected */
    command: string;

    /** The user-facing message the backend returned, if it sent one */
    message?: string;

    /** The jsonCode the backend rejected with, kept for logging and debugging */
    jsonCode?: number | string;
};

export default CommandError;
