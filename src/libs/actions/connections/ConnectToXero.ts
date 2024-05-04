import type {ConnectPolicyToAccountingIntegrationParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import CONST from '@src/CONST';
import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

const getXeroSetupLink = (policyID: string) => {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({command: READ_COMMANDS.CONNECT_POLICY_TO_XERO, shouldSkipWebProxy: true});
    return commandURL + new URLSearchParams(params).toString();
};

const getTrackingCategory = (policy: OnyxEntry<OnyxTypes.Policy>, key: string) => {
    const { trackingCategories } = policy?.connections?.xero?.data ?? {};
    const { mappings } = policy?.connections?.xero?.config ?? {};

    const category = trackingCategories?.find((currentCategory) => currentCategory.name.toLowerCase() === key.toLowerCase());
    if (!category) {
        return undefined;
    }

    return {
        ...category,
        value: mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`] ?? ""
    };
}

export {getXeroSetupLink, getTrackingCategory};
