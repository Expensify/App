import {Linking} from 'react-native';

export default function asyncOpenURL(promise, url) {
    if (!url) {
        return;
    }

    promise.then(() => {
        Linking.openURL(url);
    });
}
