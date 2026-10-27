import {act, render} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';

import Navigation from '@libs/Navigation/Navigation';

import TalkToHumanPage from '@pages/TalkToHumanPage';

import ROUTES from '@src/ROUTES';

import React from 'react';

const mockOpenSupportTicketOrConcierge = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    setShouldPopToSidebar: jest.fn(),
    getShouldPopToSidebar: jest.fn(() => false),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (effect: () => void) => jest.requireActual<typeof React>('react').useEffect(effect, [effect]),
}));
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useThemeStyles', () => () => ({borderBottom: {}}));
jest.mock('@hooks/useOpenSupportTicket', () => () => ({openSupportTicketOrConcierge: mockOpenSupportTicketOrConcierge}));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/ReportHeaderSkeletonView', () => () => null);
jest.mock('@components/ReportActionsSkeletonView', () => () => null);

const mockUseNetwork = jest.mocked(useNetwork);
const mockGoBack = jest.mocked(Navigation.goBack);
const mockSetShouldPopToSidebar = jest.mocked(Navigation.setShouldPopToSidebar);
const mockGetShouldPopToSidebar = jest.mocked(Navigation.getShouldPopToSidebar);
const mockNavigate = jest.mocked(Navigation.navigate);

async function renderPage() {
    const view = render(<TalkToHumanPage />);
    await act(async () => {
        await Promise.resolve();
    });
    return view;
}

describe('TalkToHumanPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        mockGetShouldPopToSidebar.mockReturnValue(false);
    });

    it('goes back and then opens a support ticket', async () => {
        // Given the link is opened while online
        // When the page opens
        await renderPage();

        // Then it leaves the page first and opens the ticket from the page the link was pressed on
        expect(mockGoBack).toHaveBeenCalledTimes(1);

        // And a pending pop to the sidebar is cleared first, or goBack would consume it and leave this page open
        expect(mockSetShouldPopToSidebar).toHaveBeenCalledWith(false);
        expect(mockSetShouldPopToSidebar.mock.invocationCallOrder.at(0)).toBeLessThan(mockGoBack.mock.invocationCallOrder.at(0) ?? 0);
        expect(mockOpenSupportTicketOrConcierge).toHaveBeenCalledTimes(1);
        expect(mockGoBack.mock.invocationCallOrder.at(0)).toBeLessThan(mockOpenSupportTicketOrConcierge.mock.invocationCallOrder.at(0) ?? 0);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('hands a pending pop to the sidebar back after it leaves, so the next Back still pops to the sidebar', async () => {
        // Given a wide to narrow resize left a pending pop to the sidebar
        mockGetShouldPopToSidebar.mockReturnValue(true);

        // When the page opens
        await renderPage();

        // Then the flag is cleared while the page pops, and set again afterwards
        expect(mockSetShouldPopToSidebar.mock.calls).toEqual([[false], [true]]);
        const [clearCall, restoreCall] = mockSetShouldPopToSidebar.mock.invocationCallOrder;
        const goBackCall = mockGoBack.mock.invocationCallOrder.at(0) ?? 0;
        expect(clearCall).toBeLessThan(goBackCall);
        expect(restoreCall).toBeGreaterThan(goBackCall);
    });

    it('does not arm a pop to the sidebar when none was pending', async () => {
        // Given no pending pop to the sidebar
        mockGetShouldPopToSidebar.mockReturnValue(false);

        // When the page opens
        await renderPage();

        // Then nothing is armed after the page leaves
        expect(mockSetShouldPopToSidebar).not.toHaveBeenCalledWith(true);
    });

    it('goes back and shows the Help page without creating a ticket when offline', async () => {
        // Given the link is opened while the device is offline
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);

        // When the page opens
        await renderPage();

        // Then it leaves the page and shows the Help page, where the Talk to a human row is disabled
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_HELP);
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
    });

    it('does nothing when the customer leaves before navigation is ready', async () => {
        // Given navigation that is not ready yet
        let resolveNavigationReady = () => {};
        jest.mocked(Navigation.isNavigationReady).mockReturnValue(
            new Promise<void>((resolve) => {
                resolveNavigationReady = resolve;
            }),
        );
        const {unmount} = render(<TalkToHumanPage />);

        // When the customer leaves the page and navigation becomes ready afterwards
        unmount();
        await act(async () => {
            resolveNavigationReady();
            await Promise.resolve();
        });

        // Then no ticket is opened and nothing navigates behind them
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
    });

    it('does not open a second ticket when it re-renders before it is removed', async () => {
        // Given the page has already handled the link
        const {rerender} = await renderPage();

        // When it re-renders, for example because the network state changed
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
        rerender(<TalkToHumanPage />);
        await act(async () => {
            await Promise.resolve();
        });

        // Then the link is only handled once
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockOpenSupportTicketOrConcierge).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
