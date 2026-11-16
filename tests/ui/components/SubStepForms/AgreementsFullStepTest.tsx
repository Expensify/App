import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import type FormWrapper from '@components/Form/FormWrapper';
import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';

import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';

import ONYXKEYS from '@src/ONYXKEYS';
import GLOBAL_INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';
import REIMBURSEMENT_INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {FileObject} from '@src/types/utils/Attachment';

import type HybridAppModuleType from '@expensify/react-native-hybrid-app/src/types';
import type ReactNative from 'react-native';

import React from 'react';

import * as TestHelper from '../../../utils/TestHelper';

type MockFormWrapperProps = React.ComponentProps<typeof FormWrapper>;
const mockTranslate = TestHelper.translateLocal;
jest.mock('@components/Form/FormWrapper', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({children, errors, onSubmit}: MockFormWrapperProps) => (
            <reactNative.View>
                <reactNative.Pressable
                    testID="submit"
                    onPress={onSubmit}
                />
                <reactNative.Text testID="form-errors">{JSON.stringify(errors)}</reactNative.Text>
                {children}
            </reactNative.View>
        ),
    };
});
jest.mock('@components/InteractiveStepWrapper', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {__esModule: true, default: ({children}: {children: React.ReactNode}) => <reactNative.View>{children}</reactNative.View>};
});
jest.mock('@components/CheckboxWithLabel', () => ({__esModule: true, default: () => null}));
jest.mock('@components/UploadFile', () => ({__esModule: true, default: () => null}));
jest.mock('@components/RenderHTML', () => ({__esModule: true, default: () => null}));
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn<ReturnType<HybridAppModuleType['isHybridApp']>, Parameters<HybridAppModuleType['isHybridApp']>>(() => false)},
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useIsFocusedRef', () => () => ({current: true}));
jest.mock('@hooks/usePressLoading', () => () => ({isLoading: false, startWithLoading: (callback: () => void) => callback()}));
jest.mock('@src/utils/keyboard', () => ({dismiss: () => Promise.resolve(), dismissKeyboardAndExecute: (callback: () => void) => callback()}));

const GLOBAL_FORM_ID = ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS;
const REIMBURSEMENT_FORM_ID = ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM;
const BANK_STATEMENT_INPUT_ID = REIMBURSEMENT_INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_STATEMENT;
const GLOBAL_AGREEMENT_INPUTS = {
    provideTruthfulInformation: GLOBAL_INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: GLOBAL_INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: GLOBAL_INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: GLOBAL_INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};
const REIMBURSEMENT_AGREEMENT_INPUTS = {
    provideTruthfulInformation: REIMBURSEMENT_INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: REIMBURSEMENT_INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: REIMBURSEMENT_INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: REIMBURSEMENT_INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};
type AgreementErrorInputID = (typeof GLOBAL_AGREEMENT_INPUTS | typeof REIMBURSEMENT_AGREEMENT_INPUTS)[keyof typeof GLOBAL_AGREEMENT_INPUTS] | typeof BANK_STATEMENT_INPUT_ID;
const ALL_GLOBAL_AGREEMENTS = {
    [GLOBAL_AGREEMENT_INPUTS.provideTruthfulInformation]: true,
    [GLOBAL_AGREEMENT_INPUTS.agreeToTermsAndConditions]: true,
    [GLOBAL_AGREEMENT_INPUTS.consentToPrivacyNotice]: true,
    [GLOBAL_AGREEMENT_INPUTS.authorizedToBindClientToAgreement]: true,
} satisfies React.ComponentProps<typeof AgreementsFullStep<typeof GLOBAL_FORM_ID>>['defaultValues'];
const ALL_REIMBURSEMENT_AGREEMENTS = {...ALL_GLOBAL_AGREEMENTS} satisfies React.ComponentProps<typeof AgreementsFullStep<typeof REIMBURSEMENT_FORM_ID>>['defaultValues'];
type AgreementsTestProps<TFormID extends typeof GLOBAL_FORM_ID | typeof REIMBURSEMENT_FORM_ID> = Pick<
    React.ComponentProps<typeof AgreementsFullStep<TFormID>>,
    'bankStatementDefaultValue' | 'bankStatementInputID' | 'defaultValues' | 'formID' | 'inputIDs'
>;

function renderAgreements<TFormID extends typeof GLOBAL_FORM_ID | typeof REIMBURSEMENT_FORM_ID>(props: AgreementsTestProps<TFormID>) {
    const onSubmit = jest.fn();
    render(
        <AgreementsFullStep<TFormID>
            {...props}
            isLoading={false}
            onBackButtonPress={() => {}}
            onSubmit={onSubmit}
            currency="USD"
            startStepIndex={1}
        />,
    );
    return onSubmit;
}

async function submitAgreementsAndExpectErrors(errors: Partial<Readonly<Record<AgreementErrorInputID, string>>>) {
    fireEvent.press(screen.getByTestId('submit'));
    await waitFor(() => expect(screen.getByTestId('form-errors')).toHaveTextContent(JSON.stringify(errors)));
}

describe('AgreementsFullStep validation', () => {
    it.each([
        [GLOBAL_AGREEMENT_INPUTS.authorizedToBindClientToAgreement, TestHelper.translateLocal('agreementsStep.error.authorized')],
        [GLOBAL_AGREEMENT_INPUTS.provideTruthfulInformation, TestHelper.translateLocal('agreementsStep.error.certify')],
        [GLOBAL_AGREEMENT_INPUTS.agreeToTermsAndConditions, TestHelper.translateLocal('common.error.acceptTerms')],
        [GLOBAL_AGREEMENT_INPUTS.consentToPrivacyNotice, TestHelper.translateLocal('agreementsStep.error.consent')],
    ])('returns the specific required message for %s', async (rejectedInput, message) => {
        renderAgreements({
            formID: GLOBAL_FORM_ID,
            inputIDs: GLOBAL_AGREEMENT_INPUTS,
            defaultValues: {...ALL_GLOBAL_AGREEMENTS, [rejectedInput]: false},
        });
        await submitAgreementsAndExpectErrors({[rejectedInput]: message});
    });

    it('submits when every global-reimbursements agreement is fulfilled', async () => {
        const onSubmit = renderAgreements({formID: GLOBAL_FORM_ID, inputIDs: GLOBAL_AGREEMENT_INPUTS, defaultValues: ALL_GLOBAL_AGREEMENTS});
        await submitAgreementsAndExpectErrors({});
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });

    it('returns all four specific messages for the real NonUSD absent-value producer', async () => {
        const absentValues = getSubStepValues(REIMBURSEMENT_AGREEMENT_INPUTS, undefined, undefined);
        renderAgreements({formID: REIMBURSEMENT_FORM_ID, inputIDs: REIMBURSEMENT_AGREEMENT_INPUTS, defaultValues: absentValues});
        await submitAgreementsAndExpectErrors({
            [REIMBURSEMENT_AGREEMENT_INPUTS.authorizedToBindClientToAgreement]: TestHelper.translateLocal('agreementsStep.error.authorized'),
            [REIMBURSEMENT_AGREEMENT_INPUTS.provideTruthfulInformation]: TestHelper.translateLocal('agreementsStep.error.certify'),
            [REIMBURSEMENT_AGREEMENT_INPUTS.agreeToTermsAndConditions]: TestHelper.translateLocal('common.error.acceptTerms'),
            [REIMBURSEMENT_AGREEMENT_INPUTS.consentToPrivacyNotice]: TestHelper.translateLocal('agreementsStep.error.consent'),
        });
    });

    it('keeps the generic required error for an empty bank statement', async () => {
        renderAgreements({
            formID: REIMBURSEMENT_FORM_ID,
            inputIDs: REIMBURSEMENT_AGREEMENT_INPUTS,
            defaultValues: ALL_REIMBURSEMENT_AGREEMENTS,
            bankStatementInputID: BANK_STATEMENT_INPUT_ID,
            bankStatementDefaultValue: [],
        });
        await submitAgreementsAndExpectErrors({[BANK_STATEMENT_INPUT_ID]: TestHelper.translateLocal('common.error.fieldRequired')});
    });

    it('submits when the required bank statement contains a production-typed file', async () => {
        const bankStatement: FileObject[] = [{name: 'statement.pdf', uri: 'file://statement.pdf', type: 'application/pdf'}];
        const onSubmit = renderAgreements({
            formID: REIMBURSEMENT_FORM_ID,
            inputIDs: REIMBURSEMENT_AGREEMENT_INPUTS,
            defaultValues: ALL_REIMBURSEMENT_AGREEMENTS,
            bankStatementInputID: BANK_STATEMENT_INPUT_ID,
            bankStatementDefaultValue: bankStatement,
        });
        await submitAgreementsAndExpectErrors({});
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });
});
