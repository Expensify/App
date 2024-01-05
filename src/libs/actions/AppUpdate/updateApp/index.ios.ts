import CONST from '@src/CONST';
import {Linking} from 'react-native';

export default function updateApp() {
    Linking.openURL(CONST.APP_DOWNLOAD_LINKS.IOS);
}
