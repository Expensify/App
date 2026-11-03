import {getAssignableOfficeLocations, getMemberOfficeLocation, hasOfficeLocations} from '@libs/OfficeLocationUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';
import type {CompanyAddress, OfficeLocation} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';

const companyAddress: CompanyAddress = {addressStreet: '1 Market St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'US'};
const headquarters: OfficeLocation = {name: 'Headquarters', address: {addressStreet: '88 Kearny St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'US'}};
const newJerseyOffice: OfficeLocation = {name: 'New Jersey Office', address: {addressStreet: '900 Asbury Ave', city: 'Ocean City', state: 'NJ', zipCode: '08226', country: 'US'}};
const austinOffice: OfficeLocation = {name: 'Austin Office', address: {addressStreet: '500 Congress Ave', city: 'Austin', state: 'TX', zipCode: '78701', country: 'US'}};

const localeCompare = (a: string, b: string) => a.localeCompare(b);

function buildPolicy(policy: Partial<Policy>): Policy {
    return {...createRandomPolicy(1), address: undefined, officeLocations: undefined, ...policy};
}

describe('OfficeLocationUtils', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.DEFAULT));

    describe('hasOfficeLocations', () => {
        it('counts the company address and the offices that are not being deleted', () => {
            // Given workspaces with no office at all, with only an office pending deletion, with only a company address, and with an office
            const withoutOffices = buildPolicy({});
            const withDeletedOffice = buildPolicy({officeLocations: {OFFICE1: {...headquarters, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}});
            const withCompanyAddress = buildPolicy({address: companyAddress});
            const withOffice = buildPolicy({officeLocations: {OFFICE1: headquarters}});

            // When checking whether members can be assigned to an office
            // Then the company address counts as an office, the same as on the workspace overview
            expect(hasOfficeLocations(withoutOffices)).toBe(false);
            expect(hasOfficeLocations(withDeletedOffice)).toBe(false);
            expect(hasOfficeLocations(withCompanyAddress)).toBe(true);
            expect(hasOfficeLocations(withOffice)).toBe(true);
        });
    });

    describe('getAssignableOfficeLocations', () => {
        it('lists the company address first, then the primary office and the rest by name', () => {
            // Given a workspace with a company address and three offices, one of them primary and one being deleted
            const policy = buildPolicy({
                address: companyAddress,
                officeLocations: {
                    OFFICE1: newJerseyOffice,
                    OFFICE2: {...headquarters, isDefault: true},
                    OFFICE3: austinOffice,
                    OFFICE4: {...austinOffice, name: 'Closed Office', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                },
            });

            // When the offices members can be assigned to are listed
            const officeLocations = getAssignableOfficeLocations(policy, translateLocal, localeCompare);

            // Then the company address leads under its own officeID, and only the flagged office is primary
            expect(officeLocations).toEqual([
                {officeID: CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID, name: 'Company address', address: '1 Market St, San Francisco, CA 94105', isPrimary: false},
                {officeID: 'OFFICE2', name: 'Headquarters', address: '88 Kearny St, San Francisco, CA 94108', isPrimary: true},
                {officeID: 'OFFICE3', name: 'Austin Office', address: '500 Congress Ave, Austin, TX 78701', isPrimary: false},
                {officeID: 'OFFICE1', name: 'New Jersey Office', address: '900 Asbury Ave, Ocean City, NJ 08226', isPrimary: false},
            ]);
        });

        it('makes the company address primary while no office is', () => {
            // Given a workspace with a company address and no primary office
            const policy = buildPolicy({address: companyAddress, officeLocations: {OFFICE1: headquarters}});

            // When the offices members can be assigned to are listed
            const officeLocations = getAssignableOfficeLocations(policy, translateLocal, localeCompare);

            // Then the company address is the primary office
            expect(officeLocations.map(({officeID, isPrimary}) => ({officeID, isPrimary}))).toEqual([
                {officeID: CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID, isPrimary: true},
                {officeID: 'OFFICE1', isPrimary: false},
            ]);
        });

        it('leaves out the company address when the workspace has none', () => {
            // Given a workspace without a company address
            const policy = buildPolicy({officeLocations: {OFFICE1: {...headquarters, isDefault: true}}});

            // When the offices members can be assigned to are listed
            // Then only the offices are listed
            expect(getAssignableOfficeLocations(policy, translateLocal, localeCompare).map(({officeID}) => officeID)).toEqual(['OFFICE1']);
        });
    });

    describe('getMemberOfficeLocation', () => {
        const policy = buildPolicy({address: companyAddress, officeLocations: {OFFICE1: {...headquarters, isDefault: true}, OFFICE2: newJerseyOffice}});
        const officeLocations = getAssignableOfficeLocations(policy, translateLocal, localeCompare);

        it.each([
            ['the office assigned to the member', 'OFFICE2', 'OFFICE2'],
            ['the company address when the member is assigned to it', CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID, CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID],
            ['the primary office when the member has no office', undefined, 'OFFICE1'],
            ['the primary office when the assigned office was removed', 'OFFICE9', 'OFFICE1'],
        ])('returns %s', (_description, assignedOfficeID, expectedOfficeID) => {
            // Given a member with the assigned officeID
            // When their office is resolved
            // Then it is the expected office
            expect(getMemberOfficeLocation(officeLocations, assignedOfficeID)?.officeID).toBe(expectedOfficeID);
        });
    });
});
