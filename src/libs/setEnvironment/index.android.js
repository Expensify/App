import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import {version} from '../../../package.json';

export default function setEnvironment() {
    if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
        Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.DEV);
        return;
    }

    // Since we promote staging builds to production without creating a new build, check the google play listing to
    // see if the current version is greater than the production one
    try {
        fetch(CONST.PLAY_STORE_URL)
            .then(res => res.text())
            .then((text) => {
                const match = text.match(/<span[^>]+class="htlgb"[^>]*>([-\d.]+)<\/span>/);
                if (!match) {
                    Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.PRODUCTION);
                    return;
                }

                const storeVersion = match[1].trim();
                if (storeVersion === version) {
                    Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.PRODUCTION);
                    return;
                }

                // If the version isn't the same as the store version, and we aren't on dev, this is a beta build
                Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.STAGING);
            })
            .catch(() => {
                Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.PRODUCTION);
            });
    } catch (e) {
        Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.PRODUCTION);
    }
}
