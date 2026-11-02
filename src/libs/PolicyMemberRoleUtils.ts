/**
 * Authorized Payer role restrictions for workspace members.
 * Shared by the member details pages and inline role editing so both offer the same roles.
 */
import type CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {getReimburserEmail, PAYER_ROLES} from './PolicyUtils';

function isPolicyReimburser(policy: OnyxEntry<Policy>, memberLogin: string | undefined): boolean {
    const reimburserEmail = getReimburserEmail(policy);
    return !!reimburserEmail && reimburserEmail === memberLogin;
}

/**
 * Roles the member may be assigned. Restricted to payer roles when they are the Authorized Payer, otherwise undefined so the full assignable list is used.
 */
function getAllowedRolesForMember(policy: OnyxEntry<Policy>, memberLogin: string | undefined): Array<ValueOf<typeof CONST.POLICY.ROLE>> | undefined {
    return isPolicyReimburser(policy, memberLogin) ? [...PAYER_ROLES] : undefined;
}

export {getAllowedRolesForMember, isPolicyReimburser};
