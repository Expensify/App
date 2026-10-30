import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {hasCompanyAddress} from './PolicyUtils';
import {formatAddressToString} from './ReportActionsUtils';

type AssignableOfficeLocation = {
    /** Key of the office in the workspace's officeLocations, or CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID for the company address */
    officeID: string;

    /** Nickname of the office */
    name: string;

    /** Address of the office on a single line */
    address: string;

    /** Whether members without an assigned office follow this one */
    isPrimary: boolean;
};

/**
 * Whether the workspace has an office its members can be assigned to. The company address counts as one, as it does on
 * the workspace overview.
 */
function hasOfficeLocations(policy: OnyxEntry<Policy>): boolean {
    return hasCompanyAddress(policy) || Object.values(policy?.officeLocations ?? {}).some((officeLocation) => officeLocation.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

/**
 * The offices a workspace member can be assigned to. The company address comes first, as on the workspace overview,
 * followed by the primary office and then the rest by name.
 */
function getAssignableOfficeLocations(policy: OnyxEntry<Policy>, translate: LocalizedTranslate, localeCompare: LocaleContextProps['localeCompare']): AssignableOfficeLocation[] {
    const officeLocations = Object.entries(policy?.officeLocations ?? {})
        .filter(([, officeLocation]) => officeLocation.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .sort(
            ([, officeLocation], [, otherOfficeLocation]) =>
                Number(!!otherOfficeLocation.isDefault) - Number(!!officeLocation.isDefault) || localeCompare(officeLocation.name, otherOfficeLocation.name),
        )
        .map(([officeID, officeLocation]) => ({officeID, name: officeLocation.name, address: formatAddressToString(officeLocation.address), isPrimary: !!officeLocation.isDefault}));
    if (!hasCompanyAddress(policy)) {
        return officeLocations;
    }

    // The company address is the primary office unless an office location is set as primary
    const companyAddress = {
        officeID: CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID,
        name: translate('common.companyAddress'),
        address: formatAddressToString(policy?.address),
        isPrimary: !officeLocations.some((officeLocation) => officeLocation.isPrimary),
    };
    return [companyAddress, ...officeLocations];
}

/**
 * The office a member commutes to: the one assigned to them, or the primary office when they have none or the assigned
 * office was removed
 */
function getMemberOfficeLocation(officeLocations: AssignableOfficeLocation[], officeID: string | undefined): AssignableOfficeLocation | undefined {
    return officeLocations.find((officeLocation) => officeLocation.officeID === officeID) ?? officeLocations.find((officeLocation) => officeLocation.isPrimary);
}

export {hasOfficeLocations, getAssignableOfficeLocations, getMemberOfficeLocation};
