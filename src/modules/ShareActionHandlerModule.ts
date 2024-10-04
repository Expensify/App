import {NativeModules} from 'react-native';

const {ShareActionHandlerModule} = NativeModules;

type ShareActionContent = {
    content: string;
    mimeType: string;
};

type ShareActionHandlerType = {
    processFiles(callback: (array: ShareActionContent[]) => void): void;
};

export default ShareActionHandlerModule as ShareActionHandlerType;
