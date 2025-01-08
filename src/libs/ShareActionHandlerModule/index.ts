import {NativeModules} from 'react-native';

const {ShareActionHandler} = NativeModules;

type ShareActionContent = {
    id: string;
    content: string;
    mimeType: string;
    processedAt: string;
    aspectRatio: number;
};

type ShareActionHandlerModule = {
    processFiles(callback: (array: ShareActionContent[]) => void): void;
};

export default ShareActionHandler;
export type {ShareActionHandlerModule};
