import CONST from '@src/CONST';

const cidMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-w-expensify-desk',
    [CONST.ENVIRONMENT.STAGING]: 'gib-w-expensify-desk-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-w-expensify-desk-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-w-expensify-desk-uat',
};

export default cidMap;
