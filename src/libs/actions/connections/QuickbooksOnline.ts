import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToAccountingIntegrationParams} from '@libs/API/parameters';
import type UpdateQuickbooksOnlineEnableNewCategoriesParams from '@libs/API/parameters/UpdateQuickbooksOnlineEnableNewCategoriesParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getQuickbooksOnlineSetupLink(policyID: string) {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function updateQuickbooksOnlineEnableNewCategories(policyID: string, settingValue: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineEnableNewCategoriesParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES, parameters, {optimisticData, failureData, successData});
}

export {getQuickbooksOnlineSetupLink, updateQuickbooksOnlineEnableNewCategories};
