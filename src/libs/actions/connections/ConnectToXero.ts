import type {OnyxEntry} from 'react-native-onyx';
import type {ConnectPolicyToAccountingIntegrationParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {XeroTrackingCategory} from '@src/types/onyx/Policy';

const getXeroSetupLink = (policyID: string) => {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_XERO, shouldSkipWebProxy: true});
    return commandURL + new URLSearchParams(params).toString();
};

/**
 * Fetches the category object from the xero.data.trackingCategories based on the category name.
 * This is required to get Xero category object with current value stored in the xero.config.mappings
 * @param policy
 * @param key
 * @returns Filtered category matching the category name or undefined.
 */
const getTrackingCategory = (policy: OnyxEntry<OnyxTypes.Policy>, categoryName: string): (XeroTrackingCategory & {value: string}) | undefined => {
    const {trackingCategories} = policy?.connections?.xero?.data ?? {};
    const {mappings} = policy?.connections?.xero?.config ?? {};

    const category = trackingCategories?.find((currentCategory) => currentCategory.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) {
        return undefined;
    }

    return {
        ...category,
        value: mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`] ?? '',
    };
};

export {getXeroSetupLink, getTrackingCategory};
