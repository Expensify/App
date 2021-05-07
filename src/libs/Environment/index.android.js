import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import CONST from '../../CONST';
import {version} from '../../../package.json';

let environment = CONST.ENVIRONMENT.PRODUCTION;
let isLoading = false;
let callback = null;

function getEnvironment(updateEnvCallback) {
    if (isLoading) {
        callback = updateEnvCallback;
    }

    return environment;
}

function setEnvironment() {
    if (lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV) {
        environment = CONST.ENVIRONMENT.DEV;
        return;
    }

    // Since we promote staging builds to production without creating a new build, check the google play listing to
    // see if the current version is greater than the production one
    try {
        isLoading = true;
        fetch(CONST.PLAY_STORE_URL)
            .then(res => res.text())
            .then((text) => {
                console.log('start sleep');
                setTimeout(() => {
                    console.log('done sleep');
                    const match = text.match(/<span[^>]+class="htlgb"[^>]*>([-\d.]+)<\/span>/);
                    if (!match) {
                        environment = CONST.ENVIRONMENT.PRODUCTION;
                        isLoading = false;
                        return;
                    }

                    const storeVersion = match[1].trim();
                    if (storeVersion === version) {
                        environment = CONST.ENVIRONMENT.PRODUCTION;
                        isLoading = false;
                        return;
                    }

                    // If the version isn't the same as the store version, and we aren't on dev, this is a beta build
                    environment = CONST.ENVIRONMENT.STAGING;
                    isLoading = false;

                    if (callback) {
                        callback(environment);
                    }
                }, 10000);
            })
            .catch(() => {
                environment = CONST.ENVIRONMENT.PRODUCTION;
                isLoading = false;
            });
    } catch (e) {
        environment = CONST.ENVIRONMENT.PRODUCTION;
        isLoading = false;
    }
}

export default {
    getEnvironment,
    setEnvironment,
};
