import getUserSecurityGroup from '@libs/getUserSecurityGroup';

import ONYXKEYS from '@src/ONYXKEYS';
import type {SecurityGroup} from '@src/types/onyx';

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
        // Given an object membership, which carries the owner account ID
        const membership = {[DOMAIN]: {securityGroupID: GROUP_ID, ownerAccountID: OWNER_ACCOUNT_ID}};

        // When both collections hold a group
        const securityGroup = getUserSecurityGroup(EMAIL, membership, sharedNVPCollection, legacyCollection);

        // Then the sharedNVP group is preferred
        expect(securityGroup).toBe(newGroup);
    });

    it('falls back to the legacy group for an object membership when the sharedNVP group is missing', () => {
        // Given an object membership
        const membership = {[DOMAIN]: {securityGroupID: GROUP_ID, ownerAccountID: OWNER_ACCOUNT_ID}};

        // When only the legacy collection holds a group
        const securityGroup = getUserSecurityGroup(EMAIL, membership, {}, legacyCollection);

        // Then the legacy group is used
        expect(securityGroup).toBe(legacyGroup);
    });

    it('returns undefined when neither collection holds the group', () => {
        // Given an object membership
        const membership = {[DOMAIN]: {securityGroupID: GROUP_ID, ownerAccountID: OWNER_ACCOUNT_ID}};

        // When neither collection holds a group
        const securityGroup = getUserSecurityGroup(EMAIL, membership, {}, {});

        // Then no group is returned
        expect(securityGroup).toBeUndefined();
    });

    it('returns the legacy group for a string membership', () => {
        // Given a legacy string membership, which carries no owner account ID
        const membership = {[DOMAIN]: GROUP_ID};

        // When both collections hold a group
        const securityGroup = getUserSecurityGroup(EMAIL, membership, sharedNVPCollection, legacyCollection);

        // Then the legacy group is used, since a string membership has no owner account ID
        expect(securityGroup).toBe(legacyGroup);
    });

    it('returns undefined when the user has no membership for their domain', () => {
        // Given a user with no membership for their domain
        // When the group is resolved
        const securityGroup = getUserSecurityGroup(EMAIL, {}, sharedNVPCollection, legacyCollection);

        // Then no group is returned, even though the collections hold one
        expect(securityGroup).toBeUndefined();
    });

    it('returns undefined when there is no email', () => {
        // Given an object membership but no email to take the domain from
        const membership = {[DOMAIN]: {securityGroupID: GROUP_ID, ownerAccountID: OWNER_ACCOUNT_ID}};

        // When the group is resolved
        const securityGroup = getUserSecurityGroup(undefined, membership, sharedNVPCollection, legacyCollection);

        // Then no group is returned
        expect(securityGroup).toBeUndefined();
    });
});
