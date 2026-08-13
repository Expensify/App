import {render, screen} from '@testing-library/react-native';

import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

import React from 'react';
import Onyx from 'react-native-onyx';

// RenderHTML needs a TRenderEngineProvider that unit tests don't set up, and the two agreement labels that use it aren't
// what these assertions are about.
jest.mock('@components/RenderHTML', () => () => null);

// Without a LocaleContextProvider every translate() call resolves to an empty string, which would make text queries
// pass or fail regardless of what rendered. Returning the key keeps the assertions about rendering, not translation.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

const inputIDs = {
    provideTruthfulInformation: INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};

const defaultValues = {
    provideTruthfulInformation: true,
    agreeToTermsAndConditions: true,
    consentToPrivacyNotice: true,
    authorizedToBindClientToAgreement: true,
};

function renderStep(bankStatementInputID?: typeof INPUT_IDS.BANK_STATEMENT) {
    return render(
        <AgreementsFullStep
            defaultValues={defaultValues}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            inputIDs={inputIDs}
            isLoading={false}
            onBackButtonPress={jest.fn()}
            onSubmit={jest.fn()}
            currency={CONST.CURRENCY.USD}
            startStepIndex={1}
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_INDEX_LIST}
            bankStatementInputID={bankStatementInputID}
            bankStatementDefaultValue={[]}
        />,
    );
}

describe('AgreementsFullStep', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('renders the bank statement upload when bankStatementInputID is passed', () => {
        renderStep(INPUT_IDS.BANK_STATEMENT);
        expect(screen.getByText('agreementsStep.bankStatement')).toBeOnTheScreen();
    });

    it('omits the bank statement upload when bankStatementInputID is not passed', () => {
        renderStep(undefined);
        expect(screen.queryByText('agreementsStep.bankStatement')).not.toBeOnTheScreen();
    });
});
