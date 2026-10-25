import {render} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';

import Navigation from '@libs/Navigation/Navigation';

import TalkToHumanPage from '@pages/settings/HelpPage/TalkToHumanPage';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

const mockOpenSupportTicketOrConcierge = jest.fn();
const mockGetRootState = jest.fn<{routes: Array<{name: string}>}, []>();
const mockGetNavigatorState = jest.fn<{routes: Array<{name: string}>}, []>();

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@libs/Navigation/navigationRef', () => ({
    current: {getRootState: () => mockGetRootState()},
}));
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({getState: () => mockGetNavigatorState()}),
}));
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOpenSupportTicket', () => () => ({openSupportTicketOrConcierge: mockOpenSupportTicketOrConcierge}));
jest.mock('@components/FullscreenLoadingIndicator', () => () => jest.requireActual<typeof React>('react').createElement('Text', null, 'Loading'));

const mockUseNetwork = jest.mocked(useNetwork);
const mockGoBack = jest.mocked(Navigation.goBack);
const mockNavigate = jest.mocked(Navigation.navigate);

function setRootRoutes(names: string[]) {
    mockGetRootState.mockReturnValue({routes: names.map((name) => ({name}))});
}

function setSettingsSplitRoutes(names: string[]) {
    mockGetNavigatorState.mockReturnValue({routes: names.map((name) => ({name}))});
}

function callAfterTransition() {
    const goBackOptions = mockGoBack.mock.calls.at(0)?.at(1);
    if (typeof goBackOptions !== 'object') {
        throw new Error('goBack should receive options with an afterTransition callback');
    }
    expect(goBackOptions.afterTransition).toEqual(expect.any(Function));
    goBackOptions.afterTransition?.();
}

function getGoBackFallbackRoute() {
    return mockGoBack.mock.calls.at(0)?.at(0);
}

describe('TalkToHumanPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        setSettingsSplitRoutes([SCREENS.SETTINGS.HELP_TALK_TO_HUMAN]);
    });

    it('goes back to the page the link was pressed on and opens the ticket after the transition', () => {
        // Given a link pressed in the app, which leaves a second full screen route under this one
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);

        // When the page opens
        render(<TalkToHumanPage />);

        // Then it leaves the loader without a fallback route
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(getGoBackFallbackRoute()).toBeUndefined();

        // And the ticket is only requested once the transition has finished
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
        callAfterTransition();
        expect(mockOpenSupportTicketOrConcierge).toHaveBeenCalledTimes(1);
    });

    it('falls back to the Help page for a direct link, where only the injected Settings sidebar sits behind it', () => {
        // Given a cold load with one full screen route and the Settings sidebar added under this page
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR]);
        setSettingsSplitRoutes([SCREENS.SETTINGS.ROOT, SCREENS.SETTINGS.HELP_TALK_TO_HUMAN]);

        // When the page opens
        render(<TalkToHumanPage />);

        // Then it falls back to the Help page
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(getGoBackFallbackRoute()).toBe(ROUTES.SETTINGS_HELP);
    });

    it('does not count a side modal as a page to return to', () => {
        // Given a direct link with a side modal open next to the only full screen route
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
        setSettingsSplitRoutes([SCREENS.SETTINGS.ROOT, SCREENS.SETTINGS.HELP_TALK_TO_HUMAN]);

        // When the page opens
        render(<TalkToHumanPage />);

        // Then it still falls back to the Help page
        expect(getGoBackFallbackRoute()).toBe(ROUTES.SETTINGS_HELP);
    });

    it('goes back to the earlier Settings page when the link was pressed from another page in the same Settings split', () => {
        // Given a single full screen route whose Settings split holds an earlier page under this one
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR]);
        setSettingsSplitRoutes([SCREENS.SETTINGS.ROOT, SCREENS.SETTINGS.PROFILE.ROOT, SCREENS.SETTINGS.HELP_TALK_TO_HUMAN]);

        // When the page opens
        render(<TalkToHumanPage />);

        // Then it leaves the loader without a fallback route
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(getGoBackFallbackRoute()).toBeUndefined();
    });

    it('leaves the loader and then shows the Help page, creating no ticket, when the link is opened offline', () => {
        // Given the link opens in the app while the device is offline
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);

        // When the page opens
        render(<TalkToHumanPage />);

        // Then it goes back to the page the link was pressed on
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(getGoBackFallbackRoute()).toBeUndefined();
        expect(mockNavigate).not.toHaveBeenCalled();

        // And once that transition has finished the Help page is shown, without replacing the route and without a ticket
        callAfterTransition();
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_HELP);
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
    });

    it('falls back to the Help page for a direct link opened offline', () => {
        // Given a cold load while the device is offline
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR]);
        setSettingsSplitRoutes([SCREENS.SETTINGS.ROOT, SCREENS.SETTINGS.HELP_TALK_TO_HUMAN]);

        // When the page opens
        render(<TalkToHumanPage />);

        // Then it falls back to the Help page and creates no ticket
        expect(getGoBackFallbackRoute()).toBe(ROUTES.SETTINGS_HELP);
        callAfterTransition();
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
    });

    it('does nothing more when the connection returns after an offline open', () => {
        // Given the link opened offline
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);
        const {rerender} = render(<TalkToHumanPage />);

        // When the connection comes back
        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        rerender(<TalkToHumanPage />);

        // Then it only went back once and no ticket is created
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
    });

    it('does not request a second ticket when it re-renders while mounted', () => {
        // Given the page has already left the loader
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);
        const {rerender} = render(<TalkToHumanPage />);

        // When it re-renders
        rerender(<TalkToHumanPage />);

        // Then it only went back once
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});
