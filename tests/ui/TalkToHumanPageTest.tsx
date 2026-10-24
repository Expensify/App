import {render, screen} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';

import Navigation from '@libs/Navigation/Navigation';

import TalkToHumanPage from '@pages/settings/HelpPage/TalkToHumanPage';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

import type React from 'react';

const mockOpenSupportTicketOrConcierge = jest.fn();
const mockGetRootState = jest.fn<{routes: Array<{name: string}>}, []>();

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));
jest.mock('@libs/Navigation/navigationRef', () => ({
    current: {getRootState: () => mockGetRootState()},
}));
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOpenSupportTicket', () => () => ({openSupportTicketOrConcierge: mockOpenSupportTicketOrConcierge}));
jest.mock('@pages/settings/HelpPage/HelpPage', () => () => jest.requireActual<typeof React>('react').createElement('Text', null, 'Help page'));
jest.mock('@components/FullscreenLoadingIndicator', () => () => jest.requireActual<typeof React>('react').createElement('Text', null, 'Loading'));

const mockUseNetwork = jest.mocked(useNetwork);
const mockGoBack = jest.mocked(Navigation.goBack);

function setRootRoutes(names: string[]) {
    mockGetRootState.mockReturnValue({routes: names.map((name) => ({name}))});
}

describe('TalkToHumanPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
    });

    it('goes back to the page the link was pressed on and opens the ticket after the transition', () => {
        // Given a link pressed in the app, which leaves a second full screen route under this one
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);

        render(<TalkToHumanPage />);

        // Then it leaves the loader without a fallback route
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack.mock.calls.at(0)?.at(0)).toBeUndefined();

        // And the ticket is only requested once the transition has finished
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
        const goBackOptions: {afterTransition?: () => void} | undefined = mockGoBack.mock.calls.at(0)?.at(1);
        goBackOptions?.afterTransition?.();
        expect(mockOpenSupportTicketOrConcierge).toHaveBeenCalledTimes(1);
    });

    it('falls back to the Help page for a direct link, where only one full screen route exists', () => {
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR]);

        render(<TalkToHumanPage />);

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack.mock.calls.at(0)?.at(0)).toBe(ROUTES.SETTINGS_HELP);
    });

    it('does not count a side modal as a page to return to', () => {
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);

        render(<TalkToHumanPage />);

        expect(mockGoBack.mock.calls.at(0)?.at(0)).toBe(ROUTES.SETTINGS_HELP);
    });

    it('shows the Help page and creates no ticket when the link is opened offline', () => {
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);

        render(<TalkToHumanPage />);

        expect(screen.getByText('Help page')).toBeOnTheScreen();
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockOpenSupportTicketOrConcierge).not.toHaveBeenCalled();
    });

    it('keeps showing the Help page when the connection returns after an offline open', () => {
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);
        const {rerender} = render(<TalkToHumanPage />);

        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        rerender(<TalkToHumanPage />);

        expect(screen.getByText('Help page')).toBeOnTheScreen();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('does not request a second ticket when it re-renders while mounted', () => {
        setRootRoutes([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR]);
        const {rerender} = render(<TalkToHumanPage />);

        rerender(<TalkToHumanPage />);

        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});
