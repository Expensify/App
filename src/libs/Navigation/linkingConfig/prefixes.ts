import type {LinkingOptions} from '@react-navigation/native';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';

const prefixes: LinkingOptions<RootNavigatorParamList>['prefixes'] = [
    'app://-/',
    'new-expensify://',
    'https://www.expensify.cash',
    'https://staging.expensify.cash',
    'https://dev.new.expensify.com',
    'https://new.expensify.com',
    CONST.NEW_EXPENSIFY_URL,
    CONST.STAGING_NEW_EXPENSIFY_URL,
    CONST.PR_TESTING_NEW_EXPENSIFY_URL,
    // Old Dot URLs - needed to ensure OD Report links open in the app instead of browser
    'https://www.expensify.com',
    'https://staging.expensify.com',
    CONST.EXPENSIFY_URL,
    CONST.STAGING_EXPENSIFY_URL,
];

export default prefixes;
