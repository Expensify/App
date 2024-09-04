import {Linking, NativeModules} from 'react-native';
import CONST from '@src/CONST';

export default function updateApp() {
    Linking.openURL(NativeModules.HybridAppModule ? CONST.APP_DOWNLOAD_LINKS.OLD_DOT_IOS : CONST.APP_DOWNLOAD_LINKS.IOS);
}
