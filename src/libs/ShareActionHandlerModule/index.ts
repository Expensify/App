import {NativeModules} from 'react-native';

const {ShareActionHandler} = NativeModules;

// Type for the content of a share action
type ShareActionContent = {
    id: string;
    content: string;
    mimeType: string;
    processedAt: string;
    aspectRatio: number;
};

// Type for the ShareActionHandler module
type ShareActionHandlerModule = {
    // Method to process files, which takes a callback function
    processFiles(callback: (files: ShareActionContent[] | string | ShareActionContent | null | undefined) => void): void;
};

export default ShareActionHandler;
export type {ShareActionHandlerModule};
