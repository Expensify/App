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
        return source.uri ?? '';
    }

    return '';
}

/**
 * A custom React hook that provides functionalities to manage attachment errors.
 * - `setAttachmentError(key)`: Set or unset an error for a given key.
 * - `clearAttachmentErrors()`: Clear all errors.
 * - `isErrorInAttachment(key)`: Check if there is an error associated with a specific key.
 * Errors are indexed by a serialized key - for example url or source object.
 */
function useAttachmentErrors() {
    const [attachmentErrors, setAttachmentErrors] = useState<Record<string, boolean>>({});

    const setAttachmentError = useCallback((key: AttachmentSource, state = true) => {
        const url = convertSourceToString(key);
        if (!url) {
            return;
        }
        setAttachmentErrors((prevState) => ({
            ...prevState,
            [url]: state,
        }));
    }, []);

    const clearAttachmentErrors = useCallback(() => {
        setAttachmentErrors({});
    }, []);

    const isErrorInAttachment = useCallback((key: AttachmentSource) => attachmentErrors?.[convertSourceToString(key)], [attachmentErrors]);

    return {setAttachmentError, clearAttachmentErrors, isErrorInAttachment};
}

export default useAttachmentErrors;
