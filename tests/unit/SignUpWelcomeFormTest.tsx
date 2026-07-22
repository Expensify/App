import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as Session from '@libs/actions/Session';

import SignUpWelcomeForm from '@pages/signin/SignUpWelcomeForm';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => {
            if (key === 'welcomeSignUpForm.marketingSMSConsent') {
                return 'I agree to receive marketing texts from Expensify';
            }
            if (key === 'welcomeSignUpForm.join') {
                return 'Join';
            }
            return key;
        }),
    })),
);

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@userActions/HybridApp', () => ({
    setReadyToShowAuthScreens: jest.fn(),
}));

jest.mock('@pages/signin/Terms', () => () => null);

jest.mock('@pages/signin/ChangeExpensifyLoginLink', () => () => null);

const PHONE_LOGIN = '+15555550100@expensify.sms';
const EMAIL_LOGIN = 'test@expensify.com';

async function setCredentialsLogin(login: string) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.CREDENTIALS, {login});
        await Onyx.set(ONYXKEYS.ACCOUNT, {});
    });
    await waitForBatchedUpdatesWithAct();
}

async function renderForm() {
    return render(
        <OnyxListItemProvider>
            <SignUpWelcomeForm />
        </OnyxListItemProvider>,
    );
}

describe('SignUpWelcomeForm', () => {
    let signUpUserSpy: jest.SpyInstance;

    beforeEach(() => {
        signUpUserSpy = jest.spyOn(Session, 'signUpUser').mockImplementation(jest.fn());
    });

    afterEach(async () => {
        signUpUserSpy.mockRestore();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows marketing consent checkbox when login is a phone number', async () => {
        await setCredentialsLogin(PHONE_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByLabelText('I agree to receive marketing texts from Expensify')).toBeOnTheScreen();
    });

    it('hides the marketing consent checkbox when login is an email', async () => {
        await setCredentialsLogin(EMAIL_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByLabelText('I agree to receive marketing texts from Expensify')).toBeNull();
    });

    it('passes hasSMSMarketingConsent=true to signUpUser when checkbox is checked and Join is pressed', async () => {
        await setCredentialsLogin(PHONE_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText('I agree to receive marketing texts from Expensify'));
        fireEvent.press(screen.getByText('Join'));

        expect(signUpUserSpy).toHaveBeenCalledWith(undefined, true);
    });

    it('passes hasSMSMarketingConsent=false to signUpUser when checkbox is unchecked and Join is pressed', async () => {
        await setCredentialsLogin(PHONE_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('Join'));

        expect(signUpUserSpy).toHaveBeenCalledWith(undefined, false);
    });

    it('passes hasSMSMarketingConsent=false when checkbox is checked then unchecked', async () => {
        await setCredentialsLogin(PHONE_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText('I agree to receive marketing texts from Expensify'));
        fireEvent.press(screen.getByLabelText('I agree to receive marketing texts from Expensify'));
        fireEvent.press(screen.getByText('Join'));

        expect(signUpUserSpy).toHaveBeenCalledWith(undefined, false);
    });

    it('omits the consent param when signing up with an email', async () => {
        await setCredentialsLogin(EMAIL_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('Join'));

        expect(signUpUserSpy).toHaveBeenCalledWith(undefined, undefined);
    });
});
