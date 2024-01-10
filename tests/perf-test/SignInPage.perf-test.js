import {fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import ComposeProviders from '../../src/components/ComposeProviders';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import OnyxProvider from '../../src/components/OnyxProvider';
import {WindowDimensionsProvider} from '../../src/components/withWindowDimensions';
import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';
import ONYXKEYS from '../../src/ONYXKEYS';
import SignInPage from '../../src/pages/signin/SignInPage';
import getValidCodeCredentials from '../utils/collections/getValidCodeCredentials';
import userAccount, {getValidAccount} from '../utils/collections/userAccount';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('../../src/libs/Navigation/Navigation', () => {
    const actualNav = jest.requireActual('../../src/libs/Navigation/Navigation');
    return {
        ...actualNav,
        navigationRef: {
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
        },
    };
});

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
        createNavigationContainerRef: jest.fn(),
    };
});

function SignInPageWrapper(args) {
    return (
        <ComposeProviders components={[OnyxProvider, WindowDimensionsProvider, LocaleContextProvider]}>
            <SignInPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...args}
                navigation={args.navigation}
            />
        </ComposeProviders>
    );
}

const runs = CONST.PERFORMANCE_TESTS.RUNS;
const login = 'test@mail.com';

describe('SignInPage', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
            registerStorageEventListener: () => {},
        }),
    );

    // Initialize the network key for OfflineWithFeedback
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
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
            /**
             * Checking the SignInPage is mounted
             */
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
            .then(() => measurePerformance(<SignInPageWrapper navigation={navigation} />, {scenario, runs}));
    });

    test('[SignInPage] should add magic code and click Sign In button', () => {
        const addListener = jest.fn();
        const scenario = async () => {
            /**
             * Checking the SignInPage is mounted
             */
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
            .then(() => measurePerformance(<SignInPageWrapper navigation={navigation} />, {scenario, runs}));
    });
});
