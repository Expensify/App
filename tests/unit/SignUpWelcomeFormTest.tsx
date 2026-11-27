import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as Session from '@libs/actions/Session';

import SignUpWelcomeForm from '@pages/signin/SignUpWelcomeForm';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const SMS_CONSENT_INTRO = 'By providing my phone number:';
const TRANSACTIONAL_CONSENT_LABEL = 'I agree to receive transactional account alerts from Expensify.';
const TERMS_WITH_SMS_RATES =
    'By logging in, you agree to the Terms of Service and Privacy. Standard message and data rates may apply. Message frequency varies. Reply HELP for help. Reply STOP to opt out.';
const MARKETING_CONSENT_LABEL = 'I agree to receive marketing texts from Expensify';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => {
            if (key === 'welcomeSignUpForm.smsConsentIntro') {
                return SMS_CONSENT_INTRO;
            }
            if (key === 'welcomeSignUpForm.transactionalSMSConsent') {
                return TRANSACTIONAL_CONSENT_LABEL;
            }
            if (key === 'welcomeSignUpForm.termsWithSMSRates') {
                return TERMS_WITH_SMS_RATES;
            }
            if (key === 'welcomeSignUpForm.marketingSMSConsent') {
                return MARKETING_CONSENT_LABEL;
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

jest.mock('@components/RenderHTML', () => {
    const {Text} = jest.requireActual<{Text: React.ComponentType<React.PropsWithChildren>}>('react-native');
    return ({html}: {html: string}) => <Text>{html}</Text>;
});

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

    it('shows both SMS consent checkboxes when login is a phone number', async () => {
        // Given a sign-up with a phone number, which is the only kind we text
        await setCredentialsLogin(PHONE_LOGIN);

        // When the welcome form renders
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        // Then both SMS consent checkboxes are shown under the phone number intro, and the terms below Join include the SMS rates and STOP instructions
        expect(screen.getByText(SMS_CONSENT_INTRO)).toBeOnTheScreen();
        expect(screen.getByLabelText(TRANSACTIONAL_CONSENT_LABEL)).toBeOnTheScreen();
        expect(screen.getByLabelText(MARKETING_CONSENT_LABEL)).toBeOnTheScreen();
        expect(screen.getByText(TERMS_WITH_SMS_RATES)).toBeOnTheScreen();
    });

    it('hides the SMS consent checkboxes when login is an email', async () => {
        // Given a sign-up with an email address
        await setCredentialsLogin(EMAIL_LOGIN);

        // When the welcome form renders
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        // Then no SMS consent intro, checkboxes or SMS rates are shown, because we don't text email sign-ups
        expect(screen.queryByText(SMS_CONSENT_INTRO)).toBeNull();
        expect(screen.queryByLabelText(TRANSACTIONAL_CONSENT_LABEL)).toBeNull();
        expect(screen.queryByLabelText(MARKETING_CONSENT_LABEL)).toBeNull();
        expect(screen.queryByText(TERMS_WITH_SMS_RATES)).toBeNull();
    });

    it('does not sign up with a phone number until the transactional consent is checked', async () => {
        // Given a phone sign-up where only the optional marketing consent is checked
        await setCredentialsLogin(PHONE_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(MARKETING_CONSENT_LABEL));

        // When the user presses Join
        fireEvent.press(screen.getByText('Join'));

        // Then no account is created, because transactional texts are required for phone sign-ups
        expect(signUpUserSpy).not.toHaveBeenCalled();
    });

    it('passes both consents to signUpUser when both checkboxes are checked', async () => {
        // Given a phone sign-up that agrees to transactional and marketing texts
        await setCredentialsLogin(PHONE_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(TRANSACTIONAL_CONSENT_LABEL));
        fireEvent.press(screen.getByLabelText(MARKETING_CONSENT_LABEL));

        // When the user presses Join
        fireEvent.press(screen.getByText('Join'));

        // Then both consents are sent, so each one is stored
        expect(signUpUserSpy).toHaveBeenCalledWith(PHONE_LOGIN, undefined, {hasSMSTransactionalConsent: true, hasSMSMarketingConsent: true}, undefined, undefined);
    });

    it('passes hasSMSMarketingConsent=false when only the transactional consent is checked', async () => {
        // Given a phone sign-up that agrees to transactional texts and checks then unchecks marketing texts
        await setCredentialsLogin(PHONE_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(TRANSACTIONAL_CONSENT_LABEL));
        fireEvent.press(screen.getByLabelText(MARKETING_CONSENT_LABEL));
        fireEvent.press(screen.getByLabelText(MARKETING_CONSENT_LABEL));

        // When the user presses Join
        fireEvent.press(screen.getByText('Join'));

        // Then marketing consent is recorded as declined
        expect(signUpUserSpy).toHaveBeenCalledWith(PHONE_LOGIN, undefined, {hasSMSTransactionalConsent: true, hasSMSMarketingConsent: false}, undefined, undefined);
    });

    it('omits the consent param when signing up with an email', async () => {
        await setCredentialsLogin(EMAIL_LOGIN);
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('Join'));

        expect(signUpUserSpy).toHaveBeenCalledWith(EMAIL_LOGIN, undefined, undefined, undefined, undefined);
    });

    it('passes the stored marketing attribution to signUpUser', async () => {
        // Given marketing attribution captured from a Google ad
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const attribution = {utm_source: 'google', gclid: 'testGclid'};
        await setCredentialsLogin(EMAIL_LOGIN);
        await act(async () => {
            await Onyx.set(ONYXKEYS.MARKETING_ATTRIBUTION, attribution);
        });
        await renderForm();
        await waitForBatchedUpdatesWithAct();

        // When the user presses Join
        fireEvent.press(screen.getByText('Join'));

        // Then the attribution is passed to signUpUser
        expect(signUpUserSpy).toHaveBeenCalledWith(EMAIL_LOGIN, undefined, undefined, attribution, undefined);
    });
});
