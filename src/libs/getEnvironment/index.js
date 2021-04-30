import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';

export default function getEnvironment() {
    return lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);
}
