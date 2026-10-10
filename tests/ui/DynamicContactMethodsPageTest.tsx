import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import DynamicContactMethodsPage from '@pages/settings/Profile/Contacts/DynamicContactMethodsPage';

import DelegateNoAccessModalProvider from '@src/components/DelegateNoAccessModalProvider';
import LockedAccountModalProvider from '@src/components/LockedAccountModalProvider';
import type CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';
import type ReactNative from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock navigation used by the page
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));

jest.mock('@components/HeaderWithBackButton', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    return ({onBackButtonPress}: {onBackButtonPress: () => void}) => ReactMock.createElement(Pressable, {testID: 'backButton', onPress: onBackButtonPress});
});

// Mock RenderHTML component
jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

// Replace MenuItem with a simple test double that exposes props in the tree
jest.mock('@components/MenuItem', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({title, brickRoadIndicator}: {title: string; brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>}) =>
        ReactMock.createElement(Text, {testID: `menu-${String(title)}`}, `${brickRoadIndicator ?? 'none'}-brickRoadIndicator`);
});

function buildNavigationState(routes: Array<{name: string; params?: Record<string, unknown>; state?: NavigationState}>): NavigationState {
    return {
        stale: false,
        type: 'stack',
        key: 'test-stack',
        index: routes.length - 1,
        routeNames: routes.map((route) => route.name),
        routes: routes.map((route, index) => ({...route, key: `test-route-${index}`})),
    };
}

describe('DynamicContactMethodsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useDynamicBackPath).mockReturnValue(ROUTES.SETTINGS_PROFILE.route);
        return Onyx.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function renderPage() {
        return render(
            <ComposeProviders components={[LockedAccountModalProvider, DelegateNoAccessModalProvider]}>
                <DynamicContactMethodsPage />
            </ComposeProviders>,
        );
    }

    it('sets error indicator when login has error fields', async () => {
        // Given a login list entry with errorFields set
        const defaultEmail = 'default@example.com';
        const otherEmail = 'other@example.com';
        Onyx.merge(ONYXKEYS.SESSION, {email: defaultEmail});
        Onyx.merge(ONYXKEYS.LOGINS, {
            [`1_${defaultEmail}`]: {
                partnerID: 1,
                partnerUserID: defaultEmail,
                validatedDate: '2024-01-01',
            },
            [`1_${otherEmail}`]: {
                partnerID: 1,
                partnerUserID: otherEmail,
                validatedDate: '',
                errorFields: {
                    addedLogin: {field: 'dummy'},
                },
            },
        });
        await waitForBatchedUpdates();

        renderPage();

        let node = screen.getByTestId(`menu-${defaultEmail}`);

        // DynamicContactMethodsPage doesn't set any BR for validated logins
        expect(node).toHaveTextContent('none-brickRoadIndicator');

        node = screen.getByTestId(`menu-${otherEmail}`);

        // DynamicContactMethodsPage sets brickRoadIndicator to 'error' when any errorFields are present
        expect(node).toHaveTextContent('error-brickRoadIndicator');

        // Verify that RBR disappears
        await Onyx.merge(ONYXKEYS.LOGINS, {
            [`1_${otherEmail}`]: {
                partnerID: 1,
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
                errorFields: null,
            },
        });

        // Wait for Onyx to notify the component's useOnyx subscriber before asserting
        await waitForBatchedUpdates();

        await waitFor(() => {
            node = screen.getByTestId(`menu-${otherEmail}`);

            // DynamicContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });

    it('sets info indicator when login is unvalidated and not default', async () => {
        // Given two logins: default (session email) validated, and another unvalidated
        const defaultEmail = 'default@example.com';
        const otherEmail = 'other@example.com';
        Onyx.merge(ONYXKEYS.SESSION, {email: defaultEmail});
        Onyx.merge(ONYXKEYS.LOGINS, {
            [`1_${defaultEmail}`]: {
                partnerID: 1,
                partnerUserID: defaultEmail,
                validatedDate: '2024-01-01',
            },
            [`1_${otherEmail}`]: {
                partnerID: 1,
                partnerUserID: otherEmail,
                validatedDate: '',
            },
        });
        await waitForBatchedUpdates();

        renderPage();
        let node = screen.getByTestId(`menu-${defaultEmail}`);

        // DynamicContactMethodsPage doesn't set any BR for validated logins
        expect(node).toHaveTextContent('none-brickRoadIndicator');

        node = screen.getByTestId(`menu-${otherEmail}`);

        // DynamicContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
        expect(node).toHaveTextContent('info-brickRoadIndicator');

        // Verify that GBR disappears
        await Onyx.merge(ONYXKEYS.LOGINS, {
            [`1_${otherEmail}`]: {
                partnerID: 1,
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
            },
        });

        // Wait for Onyx to notify the component's useOnyx subscriber before asserting
        await waitForBatchedUpdates();

        await waitFor(() => {
            node = screen.getByTestId(`menu-${otherEmail}`);

            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });

    it.each([
        {
            selector: SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED,
            prompt: SCREENS.WORKSPACE.COMPANY_CARD_ADD_WORK_EMAIL,
            destination: ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute('1'),
        },
        {
            selector: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SELECT_FEED,
            prompt: SCREENS.WORKSPACE.EXPENSIFY_CARD_ADD_WORK_EMAIL,
            destination: `${ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute('1')}/select-feed`,
        },
    ])('returns to Select Cards from the $prompt flow after adding a contact method', ({selector, prompt, destination}) => {
        // Given Select Cards and Add Work Email are in the workspace stack, while Contact Methods is on top
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(
            buildNavigationState([
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: buildNavigationState([
                        {name: SCREENS.WORKSPACE.COMPANY_CARDS, params: {policyID: '1'}},
                        {name: selector, params: {policyID: '1'}},
                        {name: prompt, params: {policyID: '1'}},
                    ]),
                },
                {name: NAVIGATORS.TAB_NAVIGATOR, state: buildNavigationState([{name: SCREENS.SETTINGS.PROFILE.DYNAMIC_CONTACT_METHODS}])},
            ]),
        );

        // When the user goes back from Contact Methods
        renderPage();
        fireEvent.press(screen.getByTestId('backButton'));

        // Then the earlier Select Cards route is targeted rather than the intervening prompt
        expect(Navigation.goBack).toHaveBeenCalledWith(destination);
    });

    it('uses the normal back path when Select Cards is not in the stack', () => {
        // Given Contact Methods was opened without a card feed selector in the stack
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(buildNavigationState([{name: SCREENS.SETTINGS.PROFILE.DYNAMIC_CONTACT_METHODS}]));

        // When the user goes back from Contact Methods
        renderPage();
        fireEvent.press(screen.getByTestId('backButton'));

        // Then the usual Contact Methods back path is used
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.route);
    });
});
