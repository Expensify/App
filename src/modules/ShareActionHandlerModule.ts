import {NativeModules} from 'react-native';

const {ShareActionHandlerModule} = NativeModules;

type ShareActionContent = {
    id: string;
    content: string;
    mimeType: string;
    processedAt: string;
};

type ShareActionHandlerType = {
    processFiles(callback: (array: ShareActionContent[]) => void): void;
};

export default ShareActionHandlerModule as ShareActionHandlerType;
