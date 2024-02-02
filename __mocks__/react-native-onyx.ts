/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import Onyx, {ConnectOptions, OnyxEntry, OnyxKey, withOnyx} from 'react-native-onyx';
import { OnyxCollection } from 'react-native-onyx/dist/types';

let connectCallbackDelay = 0;
function addDelayToConnectCallback(delay: number) {
    connectCallbackDelay = delay;
}

type ReactNativeOnyxMock = {
    addDelayToConnectCallback: (delay: number) => void
} & typeof Onyx

const reactNativeOnyxMock: ReactNativeOnyxMock = {
    ...Onyx,
    connect: <TKey extends OnyxKey>(mapping: ConnectOptions<TKey>) =>
    Onyx.connect({
        ...mapping,
        callback: (value: OnyxEntry<any> | OnyxCollection<any>, key?: TKey) => {
            if (connectCallbackDelay > 0) {
                setTimeout(() => {
                    (mapping.callback as (value: OnyxEntry<any> | OnyxCollection<any>, key?: TKey) => void)?.(value, key)
                }, connectCallbackDelay);
            } else {
                (mapping.callback as (value: OnyxEntry<any> | OnyxCollection<any>, key?: TKey) => void)?.(value, key);
            }
        },
    }),
    addDelayToConnectCallback,
}

export default reactNativeOnyxMock
export {withOnyx};
/* eslint-enable rulesdir/prefer-onyx-connect-in-libs */
