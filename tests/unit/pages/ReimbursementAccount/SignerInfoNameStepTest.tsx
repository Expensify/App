import {render} from '@testing-library/react-native';

import type {FormOnyxValues} from '@components/Form/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';

import EnterSignerInfoName from '@pages/ReimbursementAccount/EnterSignerInfo/subSteps/Name';
import NonUSDSignerInfoName from '@pages/ReimbursementAccount/NonUSD/SignerInfo/subSteps/Name';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import {translateLocal} from '../../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

// The steps hand their validation to SingleFieldStep, which is all these tests need from it
jest.mock('@components/SubStepForms/SingleFieldStep', () => jest.fn(() => null));

async function renderStepAndGetValidate<TFormID extends keyof OnyxFormValuesMapping>(step: React.ReactElement) {
    render(<LocaleContextProvider>{step}</LocaleContextProvider>);
    await waitForBatchedUpdatesWithAct();

    const validate = jest.mocked(SingleFieldStep<TFormID>).mock.calls.at(-1)?.[0].validate;
    if (!validate) {
        throw new Error('The name step must pass its validation to SingleFieldStep');
    }
    return validate;
}

describe('Signer info name steps', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('EnterSignerInfo', () => {
        it('accepts a hyphenated full name', async () => {
            // Given a signer whose legal name is hyphenated, as on their identity documents
            const validate = await renderStepAndGetValidate<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>(
                <EnterSignerInfoName
                    onNext={jest.fn()}
                    onMove={jest.fn()}
                    isEditing={false}
                />,
            );

            // When the name step validates the name
            const errors = validate(createMock<FormOnyxValues<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>>({signerFullName: 'Mary-Kate Smith-Jones'}));

            // Then there are no errors, so the signer can enter their name exactly as it is registered
            expect(errors).toEqual({});
        });

        it('rejects a full name with a comma', async () => {
            // Given a signer who typed a comma into their full name
            const validate = await renderStepAndGetValidate<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>(
                <EnterSignerInfoName
                    onNext={jest.fn()}
                    onMove={jest.fn()}
                    isEditing={false}
                />,
            );

            // When the name step validates the name
            const errors = validate(createMock<FormOnyxValues<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>>({signerFullName: 'Smith, Jane'}));

            // Then the name gets the error, since commas and semicolons are the only characters that names cannot contain
            expect(errors).toEqual({signerFullName: translateLocal('privatePersonalDetails.error.cannotIncludeCommaOrSemicolon')});
        });
    });

    describe('NonUSD SignerInfo', () => {
        it('accepts a hyphenated full name', async () => {
            // Given a signer whose legal name is hyphenated, as on their identity documents
            const validate = await renderStepAndGetValidate<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>(
                <NonUSDSignerInfoName
                    onNext={jest.fn()}
                    onMove={jest.fn()}
                    isEditing={false}
                />,
            );

            // When the name step validates the name
            const errors = validate(createMock<FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>>({signerFullName: 'Mary-Kate Smith-Jones'}));

            // Then there are no errors, so the signer can enter their name exactly as it is registered
            expect(errors).toEqual({});
        });

        it('rejects a full name with a comma', async () => {
            // Given a signer who typed a comma into their full name
            const validate = await renderStepAndGetValidate<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>(
                <NonUSDSignerInfoName
                    onNext={jest.fn()}
                    onMove={jest.fn()}
                    isEditing={false}
                />,
            );

            // When the name step validates the name
            const errors = validate(createMock<FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>>({signerFullName: 'Smith, Jane'}));

            // Then the name gets the error, since commas and semicolons are the only characters that names cannot contain
            expect(errors).toEqual({signerFullName: translateLocal('privatePersonalDetails.error.cannotIncludeCommaOrSemicolon')});
        });
    });
});
