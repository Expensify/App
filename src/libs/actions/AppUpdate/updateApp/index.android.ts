import HybridAppModule from '@expensify/react-native-hybrid-app';
import {Linking} from 'react-native';
import CONST from '@src/CONST';

export default function updateApp(isProduction: boolean) {
    if (isProduction) {
        Linking.openURL(CONST.APP_DOWNLOAD_LINKS.OLD_DOT_ANDROID);
        return;
    }
    Linking.openURL(HybridAppModule.isHybridApp() ? CONST.APP_DOWNLOAD_LINKS.OLD_DOT_ANDROID : CONST.APP_DOWNLOAD_LINKS.ANDROID);
}
