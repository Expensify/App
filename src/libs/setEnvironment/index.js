import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';

export default function setEnvironment() {
    Onyx.set(ONYXKEYS.ENVIRONMENT, lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV));
}
