import {useCallback, useState} from 'react';
import type {AttachmentSource} from '@components/Attachments/types';

function convertSourceToString(source: AttachmentSource) {
    if (typeof source === 'string' || typeof source === 'number') {
        return source.toString();
    }
    if (source instanceof Array) {
        return source.map((src) => src.uri).join(', ');
    }
    if ('uri' in source) {
        return source.uri ?? 'Unknown source';
    }

    return 'Unknown source';
}

/**
 * A custom React hook that provides functionalities to manage attachment errors.
 * - `setAttachmentError(key)`: Sets or unsets an error for a given key.
 * - `clearAttachmentErrors()`: Clears all errors.
 * - `isErrorInAttachment(key)`: Checks if there is an error associated with a specific key.
 * Errors are indexed by a serialized key - for example url or source object.
 */
function useAttachmentErrors() {
    const [attachmentErrors, setAttachmentErrors] = useState<Record<string, boolean>>({});

    const setAttachmentError = useCallback((key: AttachmentSource) => {
        if (key === 'Unknown source') {
            return;
        }
        setAttachmentErrors((prevState) => ({
            ...prevState,
            [convertSourceToString(key)]: true,
        }));
    }, []);

    const clearAttachmentErrors = useCallback(() => {
        setAttachmentErrors({});
    }, []);

    const isErrorInAttachment = useCallback((key: AttachmentSource) => attachmentErrors?.[convertSourceToString(key)], [attachmentErrors]);

    return {setAttachmentError, clearAttachmentErrors, isErrorInAttachment};
}

export default useAttachmentErrors;
