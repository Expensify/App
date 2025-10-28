import {Linking} from 'react-native';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

export default function updateApp(isProduction: boolean) {
    if (isProduction) {
        void Linking.openURL(CONST.APP_DOWNLOAD_LINKS.OLD_DOT_IOS);
        return;
    }
    void Linking.openURL(CONFIG.IS_HYBRID_APP ? CONST.APP_DOWNLOAD_LINKS.OLD_DOT_IOS : CONST.APP_DOWNLOAD_LINKS.IOS);
}
