import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import DomainNameOrNotFoundWrapper from '@pages/domain/DomainNameOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DOMAIN_ACCOUNT_ID = 123456;
const DOMAIN_EMAIL = 'user@test.com';
const DOMAIN_NAME = 'test.com';

const mockOnLinkPress = jest.fn();

const mockIsLoadingOnyxValue = jest.fn<ReturnType<typeof isLoadingOnyxValue>, Parameters<typeof isLoadingOnyxValue>>(() => false);
jest.mock('@src/types/utils/isLoadingOnyxValue', () => ({
    __esModule: true,
    default: (...args: Parameters<typeof isLoadingOnyxValue>) => mockIsLoadingOnyxValue(...args),
}));

// Swaps in a simple, easy-to-query stand-in so the loading state can be asserted without racing real Onyx timing.
jest.mock('@components/FullscreenLoadingIndicator', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ReactNative = require('react-native');
    return () => <ReactNative.View testID="FullScreenLoadingIndicator" />;
});

type TestScreenProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED>;

function TestScreen({route}: TestScreenProps) {
    return (
        <DomainNameOrNotFoundWrapper
            domainAccountID={route.params.domainAccountID}
            onLinkPress={mockOnLinkPress}
        >
            {(domainName) => <Text testID="wrapped-children">{domainName}</Text>}
        </DomainNameOrNotFoundWrapper>
    );
}

const Stack = createPlatformStackNavigator<WorkspacesDomainModalNavigatorParamList>();

function renderWrapper() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED}
                            component={TestScreen}
                            initialParams={{domainAccountID: DOMAIN_ACCOUNT_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('DomainNameOrNotFoundWrapper', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        mockIsLoadingOnyxValue.mockReturnValue(false);
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows a full-screen loading indicator while the domain name is loading', async () => {
        // Given the domain name Onyx connection is still loading
        mockIsLoadingOnyxValue.mockReturnValue(true);

        // When the wrapper is rendered
        renderWrapper();
        await waitForBatchedUpdatesWithAct();

        // Then the loading indicator is shown instead of NotFoundPage or the children
        expect(screen.getByTestId('FullScreenLoadingIndicator')).toBeTruthy();
        expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();
        expect(screen.queryByTestId('wrapped-children')).toBeNull();
    });

    it('renders NotFoundPage and forwards onLinkPress when the domain has no name', async () => {
        // Given no domain data has loaded for this domainAccountID
        renderWrapper();
        await waitForBatchedUpdatesWithAct();

        // Then NotFoundPage is shown instead of the children
        expect(screen.getByTestId('FullPageNotFoundView')).toBeTruthy();
        expect(screen.queryByTestId('wrapped-children')).toBeNull();

        // When its link is pressed
        // TextLink's tap handler calls event.preventDefault(), so pass a minimal synthetic event.
        fireEvent.press(screen.getByText(TestHelper.translateLocal('notFound.goBackHome')), {preventDefault: () => {}});

        // Then the provided onLinkPress callback is called
        expect(mockOnLinkPress).toHaveBeenCalledTimes(1);
    });

    it('renders its children with the resolved domain name once loaded', async () => {
        // Given a domain that has finished loading with an email set
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {accountID: DOMAIN_ACCOUNT_ID, email: DOMAIN_EMAIL});
        });

        // When the wrapper is rendered
        renderWrapper();
        await waitForBatchedUpdatesWithAct();

        // Then the children are rendered and handed the resolved domain name, instead of NotFoundPage
        expect(screen.getByTestId('wrapped-children')).toHaveTextContent(DOMAIN_NAME);
        expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();
    });
});
