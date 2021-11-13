import {Linking} from 'react-native';

export default function asyncOpenURL(promise, url) {
    if (!url) {
        return;
    }

    promise.then((params) => {
        Linking.openURL(typeof url === 'string' ? url : url(params));
    });
}
