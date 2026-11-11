import type {AttachmentSource} from '@components/Attachments/types';
import type {BaseImageProps} from '@components/Image/types';

import React, {createContext, useState} from 'react';

type AttachmentStateSource = AttachmentSource | BaseImageProps['source'];

function convertSourceToString(source: AttachmentStateSource) {
    // An image without a source threw here before (`'uri' in undefined`). Keep that error, because a shared '' key would mark every image without a source as loaded.
    if (source === undefined) {
        throw new TypeError('Cannot convert undefined attachment source');
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
    const setAttachmentLoaded = (key: AttachmentStateSource, state = true) => {
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

    const isAttachmentLoaded = (key: AttachmentStateSource) => attachmentLoaded?.[convertSourceToString(key)] === true;
    const value = {setAttachmentLoaded, clearAttachmentLoaded, isAttachmentLoaded};
    return <AttachmentStateContext.Provider value={value}>{children}</AttachmentStateContext.Provider>;
}

export default AttachmentStateContextProvider;
export {AttachmentStateContext};
