import Onyx from 'react-native-onyx';
import * as Environment from '@libs/Environment/Environment';
import markAllPolicyReportsAsRead from '@libs/markAllPolicyReportsAsRead';
import * as Session from '@userActions/Session';
import type {OnyxKey} from '@src/ONYXKEYS';

/**
 * This is used to inject development/debugging utilities into the window object on web and desktop.
 * We do this only on non-production builds - these should not be used in any application code.
 */
export default function addUtilsToWindow() {
    if (!window) {
        return;
    }

    Environment.isProduction().then((isProduction) => {
        if (isProduction) {
            return;
        }

        window.Onyx = Onyx as typeof Onyx & {get: (key: OnyxKey) => Promise<unknown>; log: (key: OnyxKey) => void};

        // We intentionally do not offer an Onyx.get API because we believe it will lead to code patterns we don't want to use in this repo, but we can offer a workaround for the sake of debugging
        window.Onyx.get = function (key) {
            return new Promise((resolve) => {
                // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
                const connection = Onyx.connect({
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

        window.setSupportToken = Session.setSupportAuthToken;

        // Workaround to give employees the ability to mark reports as read via the JS console
        window.markAllPolicyReportsAsRead = markAllPolicyReportsAsRead;
    });
}
