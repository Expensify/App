import CONST from "@src/CONST";


export const cidMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-w-expensify-desk',
    [CONST.ENVIRONMENT.STAGING]: 'gib-w-expensify-desk-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-w-expensify-desk-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-w-expensify-desk-uat',
};