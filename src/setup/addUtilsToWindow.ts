import Onyx from 'react-native-onyx';
import {isProduction as isProductionLib} from '@libs/Environment/Environment';
import {setSupportAuthToken} from '@userActions/Session';
import type {OnyxKey} from '@src/ONYXKEYS';

/**
 * This is used to inject development/debugging utilities into the window object on web and desktop.
 * We do this only on non-production builds - these should not be used in any application code.
 */
export default function addUtilsToWindow() {
    if (!window) {
        return;
    }

    isProductionLib().then((isProduction) => {
        if (isProduction) {
            return;
        }

        window.Onyx = Onyx as typeof Onyx & {get: (key: OnyxKey) => Promise<unknown>; log: (key: OnyxKey) => void};

        // We intentionally do not offer an Onyx.get API because we believe it will lead to code patterns we don't want to use in this repo, but we can offer a workaround for the sake of debugging
        window.Onyx.get = function (key) {
            return new Promise((resolve) => {
                // We have opted for `connectWithoutView` here as this is a debugging utility and does not relate to any view.
                const connection = Onyx.connectWithoutView({
                    key,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                    waitForCollectionCallback: true,
                });
            });
        };

        window.Onyx.log = function (key) {
            window.Onyx.get(key).then((value) => {
                /* eslint-disable-next-line no-console */
                console.log(value);
            });
        };

        window.setSupportToken = setSupportAuthToken;
    });
}
