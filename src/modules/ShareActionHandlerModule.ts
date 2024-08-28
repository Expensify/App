import {NativeModules} from 'react-native';

const {ShareActionHandlerModule} = NativeModules;

type ShareActionHandlerType = {
    processFiles(callback: (array: string[]) => void): void;
};

export default ShareActionHandlerModule as ShareActionHandlerType;
