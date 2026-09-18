import projectAddress, {WISE_UBO_ADDRESS_PROJECTION} from '@libs/KYB/projectAddress';
import {buildWiseUBOPayload, buildWiseUSUBOSSNPayload} from '@libs/KYB/submitters';

describe('Wise submitters', () => {
    const owner = {
        name: 'Alex Rivera',
        dateOfBirth: '1980-04-12',
        address: {
            line1: '88 Pine St',
            line2: 'Suite 4',
            city: 'New York',
            state: 'NY',
            postCode: '10005',
            country: 'USA',
        },
        ssn: '123-45-6789',
    };

    test('UBO payload drops city and state', () => {
        // Given a full US address on file
        // When projecting it for POST /ubos
        const projected = projectAddress(owner.address, WISE_UBO_ADDRESS_PROJECTION);
        const payload = buildWiseUBOPayload(owner);

        // Then only line1, postCode, and country survive. City and state would be silently wrong if we reused the business address shape.
        expect(projected).toEqual({
            line1: '88 Pine St',
            postCode: '10005',
            country: 'USA',
        });
        expect(payload).not.toHaveProperty('city');
        expect(payload).not.toHaveProperty('state');
        expect(payload.addressFirstLine).toBe('88 Pine St');
        expect(payload.countryOfResidenceIso3Code).toBe('usa');
    });

    test('US owner SSN is unformatted and keyed by shareholderID not uboID', () => {
        // Given a hyphenated SSN and separate Wise ids
        // When building BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID
        const payload = buildWiseUSUBOSSNPayload(owner, {
            localID: 'owner-1',
            providerReferences: {
                wise: {
                    uboID: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    shareholderID: '489209',
                },
            },
        });

        // Then we send the documented shareholderId and a 9-digit SSN
        expect(payload.data.ssn).toBe('123456789');
        expect(payload.data.shareholderId).toBe('489209');
        expect(payload.data.documentType).toBe('SSN');
    });
});
