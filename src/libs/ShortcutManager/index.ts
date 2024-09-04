import {NativeModules} from 'react-native';

type ShortcutManagerModule = {
    removeAllDynamicShortcuts: () => void;
};

const {ShortcutManager} = NativeModules;

export type {ShortcutManagerModule};

export default ShortcutManager ||
    ({
        removeAllDynamicShortcuts: () => {},
    } as ShortcutManagerModule);
