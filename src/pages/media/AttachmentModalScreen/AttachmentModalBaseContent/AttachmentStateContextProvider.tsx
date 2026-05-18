import React, {createContext, useCallback, useMemo, useState} from 'react';
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

type AttachmentStateContextType = {
    setAttachmentLoaded: (key: AttachmentSource, state?: boolean) => void;
    clearAttachmentLoaded: () => void;
    isAttachmentLoaded: (key: AttachmentSource) => boolean;
    getAttachmentLoadedState: (key: AttachmentSource) => boolean | undefined;
};

const AttachmentStateContext = createContext<AttachmentStateContextType>({
    setAttachmentLoaded: () => {},
    clearAttachmentLoaded: () => {},
    isAttachmentLoaded: () => false,
    getAttachmentLoadedState: () => undefined,
});

type Props = {
    children: React.ReactNode;
};

function AttachmentStateContextProvider({children}: Props) {
    const [attachmentLoaded, setAttachmentLoadedState] = useState<Record<string, boolean>>({});
    const setAttachmentLoaded = useCallback((key: AttachmentSource, state = true) => {
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

    const isAttachmentLoaded = useCallback((key: AttachmentSource) => attachmentLoaded?.[convertSourceToString(key)] !== false, [attachmentLoaded]);
    const getAttachmentLoadedState = useCallback((key: AttachmentSource) => attachmentLoaded?.[convertSourceToString(key)], [attachmentLoaded]);
    const value = useMemo(
        () => ({setAttachmentLoaded, clearAttachmentLoaded, isAttachmentLoaded, getAttachmentLoadedState}),
        [setAttachmentLoaded, clearAttachmentLoaded, isAttachmentLoaded, getAttachmentLoadedState],
    );
    return <AttachmentStateContext.Provider value={value}>{children}</AttachmentStateContext.Provider>;
}

export default AttachmentStateContextProvider;
export {AttachmentStateContext};
