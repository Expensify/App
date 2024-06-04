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

const getTrackingCategories = (policy: OnyxEntry<OnyxTypes.Policy>): Array<XeroTrackingCategory & {value: string}> => {
    const {trackingCategories} = policy?.connections?.xero?.data ?? {};
    const {mappings} = policy?.connections?.xero?.config ?? {};

    if (!trackingCategories) {
        return [];
    }

    return trackingCategories.map((category) => ({
        ...category,
        value: mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`] ?? '',
    }));
};

export {getXeroSetupLink, getTrackingCategories};
