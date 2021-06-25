import {Linking} from 'react-native';

export default function asyncOpenURL(promise) {
    promise.then((url) => {
        if (!url) {
            return;
        }
        Linking.openURL(url);
    });
}
