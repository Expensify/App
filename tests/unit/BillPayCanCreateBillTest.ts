import {canCreateBill} from '@libs/BillPayUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createMock from '../utils/createMock';

const email = 'admin@receiver.com';
const adminPolicy = createMock<Policy>({id: 'A1', name: 'Receiver', type: CONST.POLICY.TYPE.CORPORATE, role: CONST.POLICY.ROLE.ADMIN});
const policies: OnyxCollection<Policy> = {[`${ONYXKEYS.COLLECTION.POLICY}A1`]: adminPolicy};
const receiverDomain = createMock<Domain>({accountID: 99, email: '+@receiver.com', validated: true, technicalContactEmail: 'receiver@receiver.com'});
const domains: OnyxCollection<Domain> = {[`${ONYXKEYS.COLLECTION.DOMAIN}99`]: receiverDomain};

describe('canCreateBill', () => {
    it('lets a group workspace admin create a bill when their private domain has a technical contact', () => {
        expect(canCreateBill(policies, domains, email, false)).toBe(true);
    });

    it('hides Create bill when the domain has no technical contact, as Classic does', () => {
        // Given the user's domain without a technical contact to receive the bill
        const domainsWithoutContact = {[`${ONYXKEYS.COLLECTION.DOMAIN}99`]: {...receiverDomain, technicalContactEmail: ''}};

        // Then the user can't create a bill
        expect(canCreateBill(policies, domainsWithoutContact, email, false)).toBe(false);
    });

    it('only counts the domain of the user email', () => {
        // Given a technical contact on a different domain than the user's email
        const otherDomain = {[`${ONYXKEYS.COLLECTION.DOMAIN}99`]: {...receiverDomain, email: '+@other.com'}};

        // Then the user can't create a bill
        expect(canCreateBill(policies, otherDomain, email, false)).toBe(false);
    });

    it('needs the user to be an admin of a group workspace', () => {
        const memberPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}A1`]: {...adminPolicy, role: CONST.POLICY.ROLE.USER}};
        const personalPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}A1`]: {...adminPolicy, type: CONST.POLICY.TYPE.PERSONAL}};

        expect(canCreateBill(memberPolicies, domains, email, false)).toBe(false);
        expect(canCreateBill(personalPolicies, domains, email, false)).toBe(false);
    });

    it('hides Create bill for public email domains', () => {
        expect(canCreateBill(policies, domains, email, true)).toBe(false);
    });
});
