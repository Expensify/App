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
    // OldDot report deep links (e.g. https://expensify.com/r/<reportID>)
    'https://expensify.com',
    'https://www.expensify.com',
];

export default prefixes;
