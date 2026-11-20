import type {HybridObject} from 'react-native-nitro-modules';

/** A file or a piece of text that the user shared into the app from another app. */
type SharedFile = {
    id: string;

    /** A file:// URL, or the shared text itself when mimeType is 'txt' */
    content: string;

    /** 'txt' for shared text. An unknown type is an empty string on Android and 'application/octet-stream' on iOS */
    mimeType: string;

    /** Milliseconds since the Unix epoch, as a string so it matches ShareTempFile */
    processedAt: string;

    /** Width divided by height for images and videos, and 1 for anything else or when it can't be read */
    aspectRatio: number;
};

interface ShareActionHandler extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    /** Resolves with an empty array when nothing was shared, and rejects when the shared data can't be read */
    processFiles(): Promise<SharedFile[]>;
}

export type {SharedFile, ShareActionHandler};
