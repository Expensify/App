import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import CONST from '../../CONST';

/**
 * Determine if we are in development or not. This method can be synchronous (as opposed to getEnvironment),
 * because getEnvironment needs to check betas for native, which is async.
 * @return {boolean}
 */
export default function isDevelopment() {
    return lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV;
}
