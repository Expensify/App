import type Environment from '@libs/Environment/getEnvironment/types';

import CONST from '@src/CONST';

const cidMap: Record<Environment, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-w-expensify',
    [CONST.ENVIRONMENT.STAGING]: 'gib-w-expensify-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-w-expensify-uat',
    [CONST.ENVIRONMENT.QA]: 'gib-w-expensify-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-w-expensify-uat',
};

export default cidMap;
