import type {AttachmentSource} from '@components/Attachments/types';
import type {BaseImageProps} from '@components/Image/types';

import React, {createContext, useCallback, useMemo, useState} from 'react';

type AttachmentStateSource = AttachmentSource | BaseImageProps['source'];

function convertSourceToString(source: AttachmentStateSource) {
    if (source === undefined) {
        return '';
    }
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

type AttachmentStateContextType = {
    setAttachmentLoaded: (key: AttachmentStateSource, state?: boolean) => void;
    clearAttachmentLoaded: () => void;
    isAttachmentLoaded: (key: AttachmentStateSource) => boolean;
};

const AttachmentStateContext = createContext<AttachmentStateContextType>({
    setAttachmentLoaded: () => {},
    clearAttachmentLoaded: () => {},
    isAttachmentLoaded: () => false,
});

type Props = {
    children: React.ReactNode;
};

function AttachmentStateContextProvider({children}: Props) {
    const [attachmentLoaded, setAttachmentLoadedState] = useState<Record<string, boolean>>({});
    const setAttachmentLoaded = useCallback((key: AttachmentStateSource, state = true) => {
        const url = convertSourceToString(key);
        if (!url) {
            return;
        }
        setAttachmentLoadedState((prevState) => ({
            ...prevState,
            [url]: state,
        }));
    }, []);

    const clearAttachmentLoaded = useCallback(() => {
        setAttachmentLoadedState({});
    }, []);

    const isAttachmentLoaded = useCallback((key: AttachmentStateSource) => attachmentLoaded?.[convertSourceToString(key)] === true, [attachmentLoaded]);
    const value = useMemo(() => ({setAttachmentLoaded, clearAttachmentLoaded, isAttachmentLoaded}), [setAttachmentLoaded, clearAttachmentLoaded, isAttachmentLoaded]);
    return <AttachmentStateContext.Provider value={value}>{children}</AttachmentStateContext.Provider>;
}

export default AttachmentStateContextProvider;
export {AttachmentStateContext};
