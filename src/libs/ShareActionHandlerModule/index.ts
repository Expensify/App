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
    // iOS passes the processed files as an array, Android as a JSON string
    processFiles(callback: (processedFiles: ShareActionContent[] | string) => void): void;
};

export default ShareActionHandler;
export type {ShareActionContent, ShareActionHandlerModule};
