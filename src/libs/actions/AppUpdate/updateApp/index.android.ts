import {Linking, NativeModules} from 'react-native';
import CONST from '@src/CONST';

export default function updateApp(isProduction: boolean) {
    if (isProduction) {
        Linking.openURL(CONST.APP_DOWNLOAD_LINKS.OLD_DOT_ANDROID);
        return;
    }
    Linking.openURL(NativeModules.HybridAppModule ? CONST.APP_DOWNLOAD_LINKS.OLD_DOT_ANDROID : CONST.APP_DOWNLOAD_LINKS.ANDROID);
}
