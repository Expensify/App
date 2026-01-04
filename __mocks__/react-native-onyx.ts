/**
 * We are disabling the lint rule that doesn't allow the usage of Onyx.connect outside libs
 * because the intent of this file is to mock the usage of react-native-onyx so we will have to mock the connect function
 */
/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import type {ConnectOptions, OnyxKey} from 'react-native-onyx';
// eslint-disable-next-line no-restricted-imports
import Onyx, {useOnyx} from 'react-native-onyx';

let connectCallbackDelay = 0;
function addDelayToConnectCallback(delay: number) {
    connectCallbackDelay = delay;
}

type ReactNativeOnyxMock = {
    addDelayToConnectCallback: (delay: number) => void;
} & typeof Onyx;

type ConnectionCallback<TKey extends OnyxKey> = NonNullable<ConnectOptions<TKey>['callback']>;
type ConnectionCallbackParams<TKey extends OnyxKey> = Parameters<ConnectionCallback<TKey>>;

const reactNativeOnyxMock: ReactNativeOnyxMock = {
    ...Onyx,
    connectWithoutView: <TKey extends OnyxKey>(mapping: ConnectOptions<TKey>) => {
        const callback = (...params: ConnectionCallbackParams<TKey>) => {
            if (connectCallbackDelay > 0) {
                setTimeout(() => {
                    (mapping.callback as (...args: ConnectionCallbackParams<TKey>) => void)?.(...params);
                }, connectCallbackDelay);
            } else {
                (mapping.callback as (...args: ConnectionCallbackParams<TKey>) => void)?.(...params);
            }
        };
        return Onyx.connectWithoutView({
            ...mapping,
            callback,
        });
    },
    addDelayToConnectCallback,
};

export default reactNativeOnyxMock;
// eslint-disable-next-line
export {useOnyx};
