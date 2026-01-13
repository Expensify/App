import type * as ReactNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import ParentNavigationSubtitle from '../../src/components/ParentNavigationSubtitle';

jest.mock('@src/hooks/useRootNavigationState', () => {
    return jest.fn((selector?: (state: unknown) => unknown) => {
        const mockRoute = {name: 'ReportsSplitNavigator'};
        if (selector) {
            return selector({routes: [mockRoute]});
        }
        return mockRoute;
    });
});
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(() => ({name: 'SearchReport'})),
    };
});

describe('ParentNavigationSubtitle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call Navigation.dismissModal when conditions are met', () => {
        const parentReportID = '123';
        const reportName = 'Report Name';
        const workspaceName = 'Workspace Name';

        Navigation.getTopmostReportId = jest.fn(() => parentReportID);
        Navigation.dismissModal = jest.fn();

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID="456"
                openParentReportInCurrentTab={true}
            />,
        );

        const clickableElement = screen.getByTestId('parent-navigation-subtitle-link');

        // Create a mock event with preventDefault
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        };

        fireEvent(clickableElement, 'press', mockEvent);

        expect(Navigation.dismissModal).toHaveBeenCalled();
    });
});
