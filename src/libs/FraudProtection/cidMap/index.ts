import CONST from '@src/CONST';

export const cidMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-w-expensify',
    [CONST.ENVIRONMENT.STAGING]: 'gib-w-expensify-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-w-expensify-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-w-expensify-uat',
};
