import {act, render} from '@testing-library/react-native';

import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import {validateSecondaryLogin} from '@libs/actions/User';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import CONST from '@src/CONST';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

import React from 'react';

const VALIDATE_CODE = '123456';
const PHONE_NUMBER = '+12025550123';
const FORMATTED_PHONE_NUMBER = '(202) 555-0123';

let mockAccount: Partial<Account> | undefined;

jest.mock('@components/ValidateCodeActionModal/ValidateCodeActionContent', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, ...params: unknown[]) => [key, ...params].join(' '),
        formatPhoneNumber: () => FORMATTED_PHONE_NUMBER,
    })),
);
jest.mock('@hooks/useOnyx', () => {
    const onyxKeys = jest.requireActual<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
    return jest.fn((key: string) => (key === onyxKeys.ACCOUNT ? [mockAccount] : [undefined]));
});
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn(), navigate: jest.fn()}));
jest.mock('@libs/actions/User', () => ({
    clearContactMethodErrors: jest.fn(),
    clearUnvalidatedNewContactMethodAction: jest.fn(),
    requestValidateCodeAction: jest.fn(),
    validateSecondaryLogin: jest.fn(),
}));

type MockValidateCodeActionContentProps = {
    descriptionSecondary: string;
    handleSubmitForm: (validateCode: string) => void;
};

function getContentProps() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the mock receives the page's real props
    return jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0] as unknown as MockValidateCodeActionContentProps;
}

describe('VerifyAccountPageBase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('validates a phone login with the SMS domain and shows the formatted number', () => {
        // Given a phone login account, whose primaryLogin comes back from the backend without the SMS domain
        mockAccount = {primaryLogin: PHONE_NUMBER, validated: false};
        render(<VerifyAccountPageBase />);

        // When the user submits the magic code
        const {descriptionSecondary, handleSubmitForm} = getContentProps();
        act(() => {
            handleSubmitForm(VALIDATE_CODE);
        });

        // Then the code is validated against the full login it was generated for, so the backend can match it
        expect(validateSecondaryLogin).toHaveBeenCalledWith(`${PHONE_NUMBER}${CONST.SMS.DOMAIN}`, VALIDATE_CODE);

        // And the user sees a readable phone number rather than the raw login
        expect(descriptionSecondary).toBe(`contacts.enterSecurityCode ${FORMATTED_PHONE_NUMBER}`);
    });

    it('validates an email login unchanged', () => {
        // Given an email login account
        mockAccount = {primaryLogin: 'user@example.com', validated: false};
        render(<VerifyAccountPageBase />);

        // When the user submits the magic code
        const {descriptionSecondary, handleSubmitForm} = getContentProps();
        act(() => {
            handleSubmitForm(VALIDATE_CODE);
        });

        // Then the email is sent and shown as is
        expect(validateSecondaryLogin).toHaveBeenCalledWith('user@example.com', VALIDATE_CODE);
        expect(descriptionSecondary).toBe('contacts.enterSecurityCode user@example.com');
    });
});
