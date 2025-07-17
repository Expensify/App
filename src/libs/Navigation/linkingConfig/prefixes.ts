import type {LinkingOptions} from '@react-navigation/native';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import HybridAppModule from '@expensify/react-native-hybrid-app';

HybridAppModule.nativeLog(`linkingConfig/prefixes.ts: prefix ${CONST.NEW_EXPENSIFY_URL}`);

const prefixes: LinkingOptions<RootNavigatorParamList>['prefixes'] = [
    'app://-/',
    'new-expensify://',
    'https://www.expensify.cash',
    'https://staging.expensify.cash',
    'https://dev.new.expensify.com',
    CONST.NEW_EXPENSIFY_URL,
    CONST.STAGING_NEW_EXPENSIFY_URL,
    CONST.PR_TESTING_NEW_EXPENSIFY_URL,
    'https://new.expensify.com',
];

export default prefixes;
