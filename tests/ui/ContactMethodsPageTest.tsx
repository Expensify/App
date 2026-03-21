import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import ContactMethodsPage from '@pages/settings/Profile/Contacts/ContactMethodsPage';
import DelegateNoAccessModalProvider from '@src/components/DelegateNoAccessModalProvider';
import LockedAccountModalProvider from '@src/components/LockedAccountModalProvider';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock navigation used by the page
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

// Replace MenuItem with a simple test double that exposes props in the tree
jest.mock('@components/MenuItem', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{testID: string; children?: React.ReactNode}>};
    return ({title, brickRoadIndicator}: {title: string; brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>}) =>
        ReactMock.createElement(Text, {testID: `menu-${String(title)}`}, `${brickRoadIndicator ?? 'none'}-brickRoadIndicator`);
});

describe('ContactMethodsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.useRealTimers();
        await Onyx.clear();
        await setPreferredLocale(CONST.LOCALES.EN);
    });

    function renderPage() {
        return render(
            <ComposeProviders components={[LocaleContextProvider, LockedAccountModalProvider, DelegateNoAccessModalProvider]}>
                {/* @ts-expect-error - route typing is not necessary for this test */}
                <ContactMethodsPage route={{params: {}}} />
            </ComposeProviders>,
        );
    }

    async function setPreferredLocale(locale: ValueOf<typeof CONST.LOCALES>) {
        await IntlStore.load(locale);
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
        await waitForBatchedUpdatesWithAct();
    }

    it('sets error indicator when login has error fields', async () => {
        // Given a login list entry with errorFields set
        const defaultEmail = 'default@example.com';
        const otherEmail = 'other@example.com';
        Onyx.merge(ONYXKEYS.SESSION, {email: defaultEmail});
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [defaultEmail]: {
                partnerUserID: defaultEmail,
                validatedDate: '2024-01-01',
            },
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '',
                errorFields: {
                    error: {field: 'dummy'},
                },
            },
        });
        await waitForBatchedUpdates();

        renderPage();

        let node = screen.getByTestId(`menu-${defaultEmail}`);

        // ContactMethodsPage doesn't set any BR for validated logins
        expect(node).toHaveTextContent('none-brickRoadIndicator');

        node = screen.getByTestId(`menu-${otherEmail}`);

        // ContactMethodsPage sets brickRoadIndicator to 'error' when any errorFields are present
        expect(node).toHaveTextContent('error-brickRoadIndicator');

        // Verify that RBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
                errorFields: null,
            },
        });

        await waitFor(() => {
            node = screen.getByTestId(`menu-${otherEmail}`);

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });

    it('sets info indicator when login is unvalidated and not default', async () => {
        // Given two logins: default (session email) validated, and another unvalidated
        const defaultEmail = 'default@example.com';
        const otherEmail = 'other@example.com';
        Onyx.merge(ONYXKEYS.SESSION, {email: defaultEmail});
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [defaultEmail]: {
                partnerUserID: defaultEmail,
                validatedDate: '2024-01-01',
            },
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '',
            },
        });
        await waitForBatchedUpdates();

        renderPage();
        let node = screen.getByTestId(`menu-${defaultEmail}`);

        // ContactMethodsPage doesn't set any BR for validated logins
        expect(node).toHaveTextContent('none-brickRoadIndicator');

        node = screen.getByTestId(`menu-${otherEmail}`);

        // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
        expect(node).toHaveTextContent('info-brickRoadIndicator');

        // Verify that GBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
            },
        });

        await waitFor(() => {
            node = screen.getByTestId(`menu-${otherEmail}`);

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });

    it('renders a dedicated copy control for the receipts email, copies it to the clipboard, and does not navigate away', async () => {
        const setStringSpy = jest.spyOn(Clipboard, 'setString').mockImplementation(() => undefined);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Add more ways to log in and send receipts to Expensify.')).toBeOnTheScreen();

        const copyButton = screen.getByLabelText(`Copy email address, ${CONST.EMAIL.RECEIPTS}`);
        fireEvent.press(copyButton);

        expect(setStringSpy).toHaveBeenCalledWith(CONST.EMAIL.RECEIPTS);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('throttles repeated copy presses until the delay expires', async () => {
        jest.useFakeTimers();
        const setStringSpy = jest.spyOn(Clipboard, 'setString').mockImplementation(() => undefined);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText(`Copy email address, ${CONST.EMAIL.RECEIPTS}`));
        fireEvent.press(screen.getByLabelText(`Copy email address, ${CONST.EMAIL.RECEIPTS}`));

        expect(setStringSpy).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(1800);
        });

        fireEvent.press(screen.getByLabelText(`Copy email address, ${CONST.EMAIL.RECEIPTS}`));

        expect(setStringSpy).toHaveBeenCalledTimes(2);
    });

    it.each([
        {
            locale: CONST.LOCALES.JA,
            helpText: 'Expensify へのログイン方法とレシート送信方法をさらに追加しましょう。',
            helpTextBeforeEmail: 'レシートを',
            helpTextAfterEmail: `に転送するメールアドレスを追加するか、レシートを ${CONST.SMS.RECEIPTS_PHONE_NUMBER}（米国の電話番号のみ）宛てにテキスト送信する電話番号を追加してください。`,
            copyLabel: `メールアドレスをコピー、${CONST.EMAIL.RECEIPTS}`,
        },
        {
            locale: CONST.LOCALES.ZH_HANS,
            helpText: '添加更多登录方式并向 Expensify 发送收据。',
            helpTextBeforeEmail: '添加一个电子邮箱地址，以便将收据转发到',
            helpTextAfterEmail: `，或者添加一个电话号码，以短信方式将收据发送到 ${CONST.SMS.RECEIPTS_PHONE_NUMBER}（仅限美国号码）。`,
            copyLabel: `复制电子邮箱地址，${CONST.EMAIL.RECEIPTS}`,
        },
    ])('renders localized help copy for $locale', async ({locale, helpText, copyLabel}) => {
        await setPreferredLocale(locale);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(helpText)).toBeOnTheScreen();
        expect(screen.getByLabelText(copyLabel)).toBeOnTheScreen();
    });
});
