import {getBillReceiverEmail, isBillCreatorPolicyAdmin} from '@libs/BillPayUtils';

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

describe('Create bill eligibility', () => {
    it('sends the bill to the technical contact of the user email domain', () => {
        // Given a user whose private domain has a technical contact
        // When the app looks up who receives the user's bills
        // Then it is the technical contact, as in Classic
        expect(getBillReceiverEmail(domains, email)).toBe('receiver@receiver.com');
    });

    it('has no receiver when the domain has no technical contact, as Classic does', () => {
        // Given the user's domain without a technical contact to receive the bill
        const domainsWithoutContact = {[`${ONYXKEYS.COLLECTION.DOMAIN}99`]: {...receiverDomain, technicalContactEmail: ''}};

        // When the app looks up the receiver
        // Then there is none, so the user can't create a bill
        expect(getBillReceiverEmail(domainsWithoutContact, email)).toBeUndefined();
    });

    it('only counts the domain of the user email', () => {
        // Given a technical contact on a different domain than the user's email
        const otherDomain = {[`${ONYXKEYS.COLLECTION.DOMAIN}99`]: {...receiverDomain, email: '+@other.com'}};

        // When the app looks up the receiver
        // Then there is none, because bills go to the user's own domain
        expect(getBillReceiverEmail(otherDomain, email)).toBeUndefined();
    });

    it('needs the user to be an admin of a group workspace', () => {
        // Given the same workspace with the user as a member, and as a personal workspace
        const memberPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}A1`]: {...adminPolicy, role: CONST.POLICY.ROLE.USER}};
        const personalPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}A1`]: {...adminPolicy, type: CONST.POLICY.TYPE.PERSONAL}};

        // When the app checks whether the user can create bills
        // Then only the admin of a group workspace can, as in Classic
        expect(isBillCreatorPolicyAdmin(policies, email)).toBe(true);
        expect(isBillCreatorPolicyAdmin(memberPolicies, email)).toBe(false);
        expect(isBillCreatorPolicyAdmin(personalPolicies, email)).toBe(false);
    });
});
