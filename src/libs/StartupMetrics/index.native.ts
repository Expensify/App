import {NativeModules} from 'react-native';

function reportFullyDrawn(): void {
    NativeModules.BootSplash.reportFullyDrawn?.();
}

export default {reportFullyDrawn};
