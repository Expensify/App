/** Verifies Search defers the shared default-workspace travel explanation until its dismissal completes. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {GetAdditionalSectionsCallback} from '@components/Search/SearchAutocompleteList';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';

import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import type * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockReanimatedModalModule from '../utils/mockReanimatedModal';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockGetAdditionalSections: GetAdditionalSectionsCallback | undefined;
let mockOnListItemPress: ((item: SearchQueryItem) => void) | undefined;

jest.mock('@components/Search/DeferredSearchAutocompleteList', () => ({
    __esModule: true,
    default: ({getAdditionalSections, onListItemPress}: {getAdditionalSections?: GetAdditionalSectionsCallback; onListItemPress: (item: SearchQueryItem) => void}) => {
        mockGetAdditionalSections = getAdditionalSections;
        mockOnListItemPress = onListItemPress;
        return null;
    },
}));

jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});
jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@src/libs/Log');
jest.mock('@libs/openTravelDotLink', () => ({openTravelDotLink: jest.fn()}));
jest.mock('@src/libs/API', () => ({write: jest.fn(), makeRequestWithSideEffects: jest.fn(), read: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    isTopmostRouteModalScreen: jest.fn(() => false),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
jest.mock('@src/hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => ({isSearchRouterScreen: false}),
}));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => ({}),
        usePreventRemove: jest.fn(),
        useNavigation: () => ({navigate: jest.fn(), addListener: () => jest.fn()}),
        useNavigationState: () => ({routes: []}),
    };
});

describe('SearchRouter Book travel', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it.each([false, true])('shows the shared blocking modal only after Search and any underlying RHP dismiss (RHP: %s)', async (hasUnderlyingModal) => {
        // Given Travel is disabled on the default workspace but enabled and provisioned on another accessible workspace
        const email = 'traveler@example.com';
        const defaultPolicy = {id: 'default', type: CONST.POLICY.TYPE.CORPORATE, role: CONST.POLICY.ROLE.ADMIN, owner: email, isTravelEnabled: false};
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: 1, email},
            [ONYXKEYS.ACCOUNT]: {primaryLogin: email},
            [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: defaultPolicy.id,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${defaultPolicy.id}`, defaultPolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}travel`, {
            ...defaultPolicy,
            id: 'travel',
            isTravelEnabled: true,
            travelSettings: {spotnanaCompanyID: 'company', associatedTravelDomainAccountID: 'entity', hasAcceptedTerms: true},
        });
        const onRouterClose = jest.fn<void, [afterClose?: () => void]>();
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(hasUnderlyingModal);
        const view = render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <PortalProvider>
                    <ModalProvider>
                        <SearchRouter
                            onRouterClose={onRouterClose}
                            isSearchRouterDisplayed
                        />
                    </ModalProvider>
                </PortalProvider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user searches for Book travel and selects the generated navigation suggestion
        fireEvent.changeText(screen.getByTestId('search-autocomplete-text-input'), 'book travel');
        await waitForBatchedUpdatesWithAct();
        const sections = mockGetAdditionalSections?.({recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null}, 0);
        const travelItem = sections?.flatMap((section) => section.data).find((item) => item.keyForList === 'create_travel');
        expect(travelItem).toBeDefined();
        if (!travelItem) {
            throw new Error('Book travel suggestion is missing');
        }
        act(() => mockOnListItemPress?.(travelItem));

        // Then Search queues the action instead of stacking the explanation on the still-visible Search flow
        const title = translateLocal('travel.defaultWorkspaceTravelDisabled.title');
        expect(onRouterClose).toHaveBeenCalledWith(expect.any(Function));
        expect(screen.queryByText(title)).toBeNull();
        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        act(() => onRouterClose.mock.lastCall?.[0]?.());
        if (hasUnderlyingModal) {
            expect(screen.queryByText(title)).toBeNull();
            expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
            const afterTransition = jest.mocked(Navigation.dismissModal).mock.lastCall?.[0]?.afterTransition;
            expect(afterTransition).toEqual(expect.any(Function));
            act(() => afterTransition?.());
        }
        await waitForBatchedUpdatesWithAct();

        // The real shared guard renders the same title, explanation and single confirmation button as the + menu
        expect(screen.getByText(title)).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('travel.defaultWorkspaceTravelDisabled.message'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('common.buttonConfirm'))).toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('common.cancel'))).toBeNull();
        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        view.unmount();
    });
});
