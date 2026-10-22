/** Defines the shared-file contract implemented by both native platforms. */
import type {HybridObject} from 'react-native-nitro-modules';

type SharedFile = {
    id: string;
    /** File URL, or the actual content for a plain-text share. */
    content: string;
    mimeType: string;
    /** Milliseconds since the Unix epoch, matching the persisted ShareTempFile format. */
    processedAt: string;
    aspectRatio?: number;
};

interface ShareActionHandler extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    /** Returns an empty array when no share is pending. Rejects if pending data cannot be read. */
    processFiles(): Promise<SharedFile[]>;
}

export type {ShareActionHandler, SharedFile};
