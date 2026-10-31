import type {AttachmentSource} from '@components/Attachments/types';
import type {BaseImageProps} from '@components/Image/types';

import React, {createContext, useState} from 'react';

type AttachmentLoadSource = AttachmentSource | BaseImageProps['source'];

function convertSourceToString(source: AttachmentLoadSource) {
    if (source == null) {
        return '';
    }
    if (typeof source === 'string' || typeof source === 'number') {
        return source.toString();
    }
    if (Array.isArray(source)) {
        return source.map((src) => src.uri).join(', ');
    }
    if (typeof source === 'object' && 'uri' in source) {
        return source.uri ?? '';
    }
    return '';
}

type AttachmentStateContextType = {
    setAttachmentLoaded: (key: AttachmentLoadSource, state?: boolean) => void;
    clearAttachmentLoaded: () => void;
    isAttachmentLoaded: (key: AttachmentLoadSource) => boolean;
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
    const setAttachmentLoaded = (key: AttachmentLoadSource, state = true) => {
        const url = convertSourceToString(key);
        if (!url) {
            return;
        }
        setAttachmentLoadedState((prevState) => ({
            ...prevState,
            [url]: state,
        }));
    };

    const clearAttachmentLoaded = () => {
        setAttachmentLoadedState({});
    };

    const isAttachmentLoaded = (key: AttachmentLoadSource) => attachmentLoaded?.[convertSourceToString(key)] === true;
    const value = {setAttachmentLoaded, clearAttachmentLoaded, isAttachmentLoaded};
    return <AttachmentStateContext.Provider value={value}>{children}</AttachmentStateContext.Provider>;
}

export default AttachmentStateContextProvider;
export {AttachmentStateContext};
