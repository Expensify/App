import type {FP} from 'group-ib-fp';
import {Platform} from 'react-native';

let impl: (fp: FP) => void = () => {};

if (Platform.OS === 'android') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    impl = require('./index.android').default;
} else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    impl = require('./index.ios').default;
}

export default function enableCapabilities(fp: FP): void {
    impl(fp);
}

