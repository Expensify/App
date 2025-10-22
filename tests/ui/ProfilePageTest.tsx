import {NavigationContainer} from '@react-navigation/native';
import type * as ReactNavigation from '@react-navigation/native';
import {render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ComposeProviders from '@components/ComposeProviders';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import ProfilePage from '@pages/settings/Profile/ProfilePage';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getShouldPopToSidebar: jest.fn(() => false),
    popToSidebar: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
        usePreventRemove: jest.fn(),
    };
});

// Replace MenuItemWithTopDescription with a simple test double that exposes props in the tree
jest.mock('@components/MenuItemWithTopDescription', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{testID: string; children?: React.ReactNode}>};
    return ({pressableTestID, brickRoadIndicator}: {pressableTestID: string; brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>}) =>
        ReactMock.createElement(Text, {testID: pressableTestID}, `${brickRoadIndicator ?? 'none'}-brickRoadIndicator`);
});

describe('ProfilePage contact method indicator', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear();
    });

    function renderPage() {
        return render(
            <NavigationContainer>
                <ComposeProviders components={[DelegateNoAccessModalProvider]}>
                    <ProfilePage
                        // @ts-expect-error - route typing is not necessary for this test
                        route={{}}
                        navigation={{}}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
    }

    it('shows error when login list has errors', async () => {
        const email = 'user@example.com';

        // Current user provided by mocked hook uses the same email
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [email]: {
                partnerUserID: email,
                validatedDate: '',
                errorFields: {anyError: {message: 'oops'}},
            },
        });
        await waitForBatchedUpdates();

        renderPage();

        // Description for contact method is 'contacts.contactMethod' via mocked translate
        let node = screen.getByText('error-brickRoadIndicator');
        expect(node).toBeDefined();

        // Verify that RBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [email]: {
                partnerUserID: email,
                validatedDate: '2024-02-02',
                errorFields: null,
            },
        });

        await waitFor(() => {
            node = screen.getByTestId('contact-method-menu-item');

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });

    it('shows info when there is an unvalidated secondary login', async () => {
        const defaultEmail = 'user@example.com';
        const otherEmail = 'other@example.com';
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

        let node = screen.getByText('info-brickRoadIndicator');
        expect(node).toBeDefined();

        // Verify that GBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
            },
        });

        await waitFor(() => {
            node = screen.getByTestId('contact-method-menu-item');

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });
});
