import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import {version} from '../../../package.json';

const storeUrl = 'https://play.google.com/store/apps/details?id=com.expensify.chat&hl=en';

export default function getEnvironment() {
    if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
        Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.DEV);
        return;
    }

    // Since we promote staging builds to production without creating a new build, check the google play listing to
    // see if the current version is greater than the production one
    try {
        fetch(storeUrl)
            .then(res => res.text())
            .then((text) => {
                const match = text.match(/regex_for_monday/);
                if (!match) {
                    return;
                }

                const storeVersion = match[1].trim();
                if (storeVersion === version) {
                    return;
                }

                // If the version we're on isn't the same as the store version, and we aren't on dev, this is a beta build
                Onyx.set(ONYXKEYS.ENVIRONMENT, CONST.ENVIRONMENT.STAGING);
            });
    // eslint-disable-next-line no-empty
    } catch (e) {}
}
