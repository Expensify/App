import type {SecurityGroup} from '../../src/types/onyx';

import getUserSecurityGroup from '../../src/libs/getUserSecurityGroup';
import ONYXKEYS from '../../src/ONYXKEYS';

const EMAIL = 'employee@example.com';
const DOMAIN = 'example.com';
const GROUP_ID = '123456';
const OWNER_ACCOUNT_ID = 42;

const newGroup: SecurityGroup = {enableRestrictedPolicyCreation: true, enableRestrictedPrimaryLogin: false};
const legacyGroup: SecurityGroup = {enableRestrictedPolicyCreation: false, enableRestrictedPrimaryLogin: false};

const sharedNVPCollection = {[`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}${GROUP_ID}_${OWNER_ACCOUNT_ID}`]: newGroup};
const legacyCollection = {[`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${GROUP_ID}`]: legacyGroup};

describe('getUserSecurityGroup', () => {
    it('returns the sharedNVP group for an object membership', () => {
        const membership = {[DOMAIN]: {securityGroupID: GROUP_ID, ownerAccountID: OWNER_ACCOUNT_ID}};
        expect(getUserSecurityGroup(EMAIL, membership, sharedNVPCollection, legacyCollection)).toBe(newGroup);
    });

    it('returns undefined for an object membership when the sharedNVP group is missing', () => {
        const membership = {[DOMAIN]: {securityGroupID: GROUP_ID, ownerAccountID: OWNER_ACCOUNT_ID}};
        expect(getUserSecurityGroup(EMAIL, membership, {}, legacyCollection)).toBeUndefined();
    });

    it('returns the legacy group for a string membership', () => {
        const membership = {[DOMAIN]: GROUP_ID};
        expect(getUserSecurityGroup(EMAIL, membership, sharedNVPCollection, legacyCollection)).toBe(legacyGroup);
    });

    it('returns undefined when the user has no membership for their domain', () => {
        expect(getUserSecurityGroup(EMAIL, {}, sharedNVPCollection, legacyCollection)).toBeUndefined();
    });

    it('returns undefined when there is no email', () => {
        const membership = {[DOMAIN]: {securityGroupID: GROUP_ID, ownerAccountID: OWNER_ACCOUNT_ID}};
        expect(getUserSecurityGroup(undefined, membership, sharedNVPCollection, legacyCollection)).toBeUndefined();
    });
});
