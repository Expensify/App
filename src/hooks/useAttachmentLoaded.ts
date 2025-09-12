import {useCallback, useState} from 'react';
import type {AttachmentSource} from '@components/Attachments/types';

function convertSourceToString(source: AttachmentSource) {
    if (typeof source === 'string' || typeof source === 'number') {
        return source.toString();
    }
    if (Array.isArray(source)) {
        return source.map((src) => src.uri).join(', ');
    }
    if ('uri' in source) {
        return source.uri ?? '';
    }
    return '';
}

/**
 * Custom hook for tracking whether an attachment has successfully loaded.
 */
function useAttachmentLoaded() {
    const [attachmentLoaded, setAttachmentLoaded] = useState<Record<string, boolean>>({});

    const setAttachmentLoadedState = useCallback((key: AttachmentSource, state = true) => {
        const url = convertSourceToString(key);
        if (!url) {
            return;
        }
        setAttachmentLoaded((prevState) => ({
            ...prevState,
            [url]: state,
        }));
    }, []);

    const clearAttachmentLoaded = useCallback(() => {
        setAttachmentLoaded({});
    }, []);

    const isAttachmentLoaded = useCallback((key: AttachmentSource) => !!attachmentLoaded?.[convertSourceToString(key)], [attachmentLoaded]);

    return {
        setAttachmentLoaded: setAttachmentLoadedState,
        clearAttachmentLoaded,
        isAttachmentLoaded,
    };
}

export default useAttachmentLoaded;
