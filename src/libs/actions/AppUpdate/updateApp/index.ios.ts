import {Linking} from 'react-native';
import CONST from '@src/CONST';

export default function updateApp() {
    Linking.openURL(CONST.APP_DOWNLOAD_LINKS.IOS);
}
