import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';

function getEnvironment() {
    return lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);
}

function setEnvironment() {
}

export default {
    getEnvironment,
    setEnvironment,
};
