import type {RouteProp} from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import ParentNavigationSubtitle from '../../src/components/ParentNavigationSubtitle';

jest.mock('@libs/Navigation/Navigation');

const mockUseRootNavigationState = jest.fn();
jest.mock('@src/hooks/useRootNavigationState', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: (selector?: (state: unknown) => unknown) => mockUseRootNavigationState(selector) as unknown,
}));

type AnyRoute = RouteProp<Record<string, Record<string, unknown> | undefined>, string>;
const mockUseRoute = jest.fn<AnyRoute, []>();
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actualNav = jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockUseRoute(),
    };
});

describe('ParentNavigationSubtitle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Navigation.getTopmostReportId = jest.fn();
        Navigation.dismissModal = jest.fn();
    });

    it('if the parent report is already displayed underneath RHP, simply dismiss the modal', () => {
        const parentReportID = '123';
        const reportName = 'Report Name';
        const workspaceName = 'Workspace Name';
        Navigation.getTopmostReportId = jest.fn(() => parentReportID);
        mockUseRoute.mockReturnValue({name: 'SearchReport'} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockRoute = {name: 'ReportsSplitNavigator'};
            if (selector) {
                return selector({routes: [mockRoute]});
            }
            return mockRoute;
        });

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID="456"
                openParentReportInCurrentTab
            />,
        );

        const clickableElement = screen.getByTestId('parent-navigation-subtitle-link');
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        };

        fireEvent(clickableElement, 'press', mockEvent);

        expect(Navigation.dismissModal).toHaveBeenCalled();
    });

    it('if currentFullScreenRoute name is not REPORTS_SPLIT_NAVIGATOR, should NOT call Navigation.dismissModal', () => {
        const parentReportID = '123';
        const reportName = 'Report Name';
        const workspaceName = 'Workspace Name';
        Navigation.getTopmostReportId = jest.fn(() => parentReportID);
        mockUseRoute.mockReturnValue({name: 'SearchReport'} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockRoute = {name: 'SettingsSplitNavigator'};
            if (selector) {
                return selector({routes: [mockRoute]});
            }
            return mockRoute;
        });
        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID="456"
                openParentReportInCurrentTab
            />,
        );
        const clickableElement = screen.getByTestId('parent-navigation-subtitle-link');
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        };
        fireEvent(clickableElement, 'press', mockEvent);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('if getTopmostReportId does not match parentReportID, should NOT call Navigation.dismissModal', () => {
        const parentReportID = '123';
        const reportName = 'Report Name';
        const workspaceName = 'Workspace Name';
        Navigation.getTopmostReportId = jest.fn(() => '999');
        mockUseRoute.mockReturnValue({name: 'SearchReport'} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockRoute = {name: 'ReportsSplitNavigator'};
            if (selector) {
                return selector({routes: [mockRoute]});
            }
            return mockRoute;
        });

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID="456"
                openParentReportInCurrentTab
            />,
        );

        const clickableElement = screen.getByTestId('parent-navigation-subtitle-link');
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        };

        fireEvent(clickableElement, 'press', mockEvent);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });
});
