import getPlaidInstitutionID from '@libs/PlaidUtils';

import type {LinkSuccessMetadata} from 'react-native-plaid-link-sdk';
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link';

describe('PlaidUtils', () => {
    describe('getPlaidInstitutionID', () => {
        it('returns the web institution ID', () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Plaid's web SDK defines this external field name.
            const institution = {institution_id: 'web-id', name: 'Web institution'} satisfies NonNullable<PlaidLinkOnSuccessMetadata['institution']>;

            expect(getPlaidInstitutionID(institution)).toBe('web-id');
        });

        it('returns the native institution ID', () => {
            const institution = {id: 'native-id', name: 'Native institution'} satisfies NonNullable<LinkSuccessMetadata['institution']>;

            expect(getPlaidInstitutionID(institution)).toBe('native-id');
        });

        it('preserves the distinct web null and native undefined absence cases', () => {
            const webInstitution: PlaidLinkOnSuccessMetadata['institution'] = null;
            const nativeInstitution: LinkSuccessMetadata['institution'] = undefined;

            expect(getPlaidInstitutionID(webInstitution)).toBeUndefined();
            expect(getPlaidInstitutionID(nativeInstitution)).toBeUndefined();
        });

        it('preserves empty web and native institution IDs', () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Plaid's web SDK defines this external field name.
            const webInstitution = {institution_id: '', name: 'Web institution'} satisfies NonNullable<PlaidLinkOnSuccessMetadata['institution']>;
            const nativeInstitution = {id: '', name: 'Native institution'} satisfies NonNullable<LinkSuccessMetadata['institution']>;

            expect(getPlaidInstitutionID(webInstitution)).toBe('');
            expect(getPlaidInstitutionID(nativeInstitution)).toBe('');
        });

        it('accepts readonly web and native institution values', () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Plaid's web SDK defines this external field name.
            const webInstitution = Object.freeze({institution_id: 'readonly-web-id', name: 'Readonly web institution'}) satisfies Readonly<
                NonNullable<PlaidLinkOnSuccessMetadata['institution']>
            >;
            const nativeInstitution = Object.freeze({id: 'readonly-native-id', name: 'Readonly native institution'}) satisfies Readonly<NonNullable<LinkSuccessMetadata['institution']>>;

            expect(getPlaidInstitutionID(webInstitution)).toBe('readonly-web-id');
            expect(getPlaidInstitutionID(nativeInstitution)).toBe('readonly-native-id');
        });

        it('prefers the web institution ID when both SDK keys are present', () => {
            const institution = {
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Plaid's web SDK defines this external field name.
                institution_id: 'web-id',
                id: 'native-id',
                name: 'Collision institution',
            } satisfies NonNullable<PlaidLinkOnSuccessMetadata['institution']> & NonNullable<LinkSuccessMetadata['institution']>;

            expect(getPlaidInstitutionID(institution)).toBe('web-id');
        });
    });
});
