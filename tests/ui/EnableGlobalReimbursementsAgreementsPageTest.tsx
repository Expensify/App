import {render} from '@testing-library/react-native';

import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';

import EnableGlobalReimbursementsAgreementsPage from '@pages/settings/Wallet/EnableGlobalReimbursements/EnableGlobalReimbursementsAgreementsPage';

import type {EnableGlobalReimbursementsForm} from '@src/types/form/EnableGlobalReimbursementsForm';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';
import type {BankAccountList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

let mockDraft: Partial<EnableGlobalReimbursementsForm> | undefined;
const mockBankAccountList: BankAccountList = Object.fromEntries([['12', {bankCurrency: 'EUR', bankCountry: 'DE'}]]);
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector: (list: OnyxEntry<BankAccountList>) => string | undefined}) => {
        if (key === 'bankAccountList') {
            return [options?.selector(mockBankAccountList)];
        }
        return [key === 'enableGlobalReimbursementsFormDraft' ? mockDraft : undefined];
    },
}));
jest.mock('@hooks/useEnableGlobalReimbursementsNavigation', () => () => ({
    isDynamic: false,
    getBusinessRoute: () => 'business',
    getSignRoute: () => 'sign',
}));
jest.mock('@components/SubStepForms/AgreementsFullStep', () => jest.fn(() => null));
const step = jest.mocked(AgreementsFullStep);
const stepProps = () => {
    const value = step.mock.lastCall?.[0];
    if (!value) {
        throw new Error('Agreements step did not render');
    }
    return value;
};
function renderPage(bankCurrency?: string) {
    // The page reads these bank account params; the rest of the navigator route is outside this defaults test.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const route = {
        params: {bankAccountID: '12', bankCurrency, bankCountry: 'US'},
    } as React.ComponentProps<typeof EnableGlobalReimbursementsAgreementsPage>['route'];
    // This page test does not invoke navigation, so the platform navigator fixture is intentionally empty.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const navigation = {} as React.ComponentProps<typeof EnableGlobalReimbursementsAgreementsPage>['navigation'];
    render(
        <EnableGlobalReimbursementsAgreementsPage
            route={route}
            navigation={navigation}
        />,
    );
}
describe('EnableGlobalReimbursementsAgreementsPage', () => {
    beforeEach(() => {
        mockDraft = undefined;
        jest.clearAllMocks();
    });
    it('defaults four agreements to false while keeping bank statements separate', () => {
        // Given no saved agreement draft
        renderPage();
        // When the real page constructs its child props
        const props = stepProps();
        // Then each agreement is false and the file array is independent
        expect(props.defaultValues).toEqual({
            provideTruthfulInformation: false,
            agreeToTermsAndConditions: false,
            consentToPrivacyNotice: false,
            authorizedToBindClientToAgreement: false,
        });
        expect(props.bankStatementDefaultValue).toEqual([]);
    });
    it('preserves mixed draft values and a separate bank statement', () => {
        // Given a persisted mixed agreement draft with a bank statement
        mockDraft = {
            [INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION]: true,
            [INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE]: false,
            [INPUT_IDS.BANK_STATEMENT]: [{name: 'statement.pdf'}],
        };
        // When the real page constructs defaults from that draft
        renderPage();
        const props = stepProps();
        // Then each agreement retains its value and bank statements remain separate
        expect(props.defaultValues).toEqual({
            provideTruthfulInformation: true,
            agreeToTermsAndConditions: false,
            consentToPrivacyNotice: false,
            authorizedToBindClientToAgreement: false,
        });
        expect(props.bankStatementDefaultValue).toEqual([{name: 'statement.pdf'}]);
    });
    it('uses the selected bank currency unless the route supplies one', () => {
        // Given a selected bank account whose currency differs from the route override
        // When the page renders with no route currency and then an explicit route currency
        renderPage(undefined);
        expect(stepProps().currency).toBe('EUR');
        renderPage('USD');
        // Then the route currency takes precedence without changing the bank lookup
        expect(stepProps().currency).toBe('USD');
    });
});
