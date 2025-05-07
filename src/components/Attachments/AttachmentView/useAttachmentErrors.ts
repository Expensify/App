import {useCallback, useState} from 'react';

type AttachmentErrors = Record<string, boolean> | Record<string, never>;

/**
 * A custom React hook that provides functionalities to manage attachment errors.
 * - `setAttachmentError(key, state)`: Sets or unsets an error for a given key.
 * - `clearAttachmentErrors()`: Clears all errors.
 * - `isErrorInAttachment(key)`: Checks if there is an error associated with a specific key.
 * Errors are indexed by a serialized key - for example url or source object.
 */
function useAttachmentErrors() {
    const [attachmentErrors, setAttachmentErrors] = useState<AttachmentErrors>({});

    const setAttachmentError = useCallback(
        (key: unknown, state = true) => {
            const url = JSON.stringify(key);
            const attachmentError = attachmentErrors[url];
            // eslint-disable-next-line eqeqeq
            if (attachmentError == state) {
                return;
            }

            setAttachmentErrors({
                ...attachmentErrors,
                [url]: state,
            });
        },
        [attachmentErrors],
    );

    const clearAttachmentErrors = useCallback(() => {
        setAttachmentErrors({});
    }, []);

    const isErrorInAttachment = useCallback((key: unknown) => attachmentErrors?.[JSON.stringify(key)], [attachmentErrors]);

    return {setAttachmentError, clearAttachmentErrors, isErrorInAttachment};
}

type UseAttachmentErrors = ReturnType<typeof useAttachmentErrors>;

export default useAttachmentErrors;
export type {UseAttachmentErrors};
