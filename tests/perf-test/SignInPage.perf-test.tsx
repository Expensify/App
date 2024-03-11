import type * as NativeNavigation from '@react-navigation/native';
import {fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {WindowDimensionsProvider} from '@components/withWindowDimensions';
import * as Localize from '@libs/Localize';
import type * as Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import SignInPage from '@src/pages/signin/SignInPage';
import getValidCodeCredentials from '../utils/collections/getValidCodeCredentials';
import userAccount, {getValidAccount} from '../utils/collections/userAccount';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('../../src/libs/Log');

jest.mock('../../src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => ({
            navigate: mockedNavigate,
        }),
        useRoute: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
        }),
    } as typeof NativeNavigation;
});

type Props = Partial<typeof SignInPage> & {navigation: Partial<typeof Navigation.navigationRef>};

function SignInPageWrapper(args: Props) {
    return (
        <ComposeProviders components={[OnyxProvider, WindowDimensionsProvider, LocaleContextProvider]}>
            <SignInPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...args}
                // @ts-expect-error Navigation prop is only used within this test
                navigation={args.navigation}
            />
        </ComposeProviders>
    );
}

const login = 'test@mail.com';

describe('SignInPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    // Initialize the network key for OfflineWithFeedback
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock() as typeof fetch;
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean state
    afterEach(() => {
        Onyx.clear();
        PusherHelper.teardown();
    });

    test('[SignInPage] should add username and click continue button', () => {
        const addListener = jest.fn();
        const scenario = async () => {
            // Checking the SignInPage is mounted
            await screen.findByTestId('SignInPage');

            const usernameInput = screen.getByTestId('username');

            fireEvent.changeText(usernameInput, login);

            const hintContinueButtonText = Localize.translateLocal('common.continue');

            const continueButton = await screen.findByText(hintContinueButtonText);

            fireEvent.press(continueButton);
        };

        const navigation = {addListener};

        return waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    [ONYXKEYS.ACCOUNT]: userAccount,
                    [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
                }),
            )
            .then(() => measurePerformance(<SignInPageWrapper navigation={navigation} />, {scenario}));
    });

    test('[SignInPage] should add magic code and click Sign In button', () => {
        const addListener = jest.fn();
        const scenario = async () => {
            // Checking the SignInPage is mounted
            await screen.findByTestId('SignInPage');

            const welcomeBackText = Localize.translateLocal('welcomeText.welcomeBack');
            const enterMagicCodeText = Localize.translateLocal('welcomeText.welcomeEnterMagicCode', {login});

            await screen.findByText(`${welcomeBackText} ${enterMagicCodeText}`);
            const magicCodeInput = screen.getByTestId('validateCode');

            fireEvent.changeText(magicCodeInput, '123456');

            const signInButtonText = Localize.translateLocal('common.signIn');
            const signInButton = await screen.findByText(signInButtonText);

            fireEvent.press(signInButton);
        };

        const navigation = {addListener};

        return waitForBatchedUpdates()
            .then(() =>
                Onyx.multiSet({
                    [ONYXKEYS.ACCOUNT]: getValidAccount(login),
                    [ONYXKEYS.CREDENTIALS]: getValidCodeCredentials(login),
                    [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
                }),
            )
            .then(() => measurePerformance(<SignInPageWrapper navigation={navigation} />, {scenario}));
    });
});
