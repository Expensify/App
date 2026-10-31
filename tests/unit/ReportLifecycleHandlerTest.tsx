import {render} from '@testing-library/react-native';

import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import {IsHiddenWideTabPreMountContext} from '@hooks/useIsHiddenWideTabPreMount';
import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';

import clearReportNotifications from '@libs/Notification/clearReportNotifications';

import ReportLifecycleHandler from '@pages/inbox/ReportLifecycleHandler';

import React from 'react';

jest.mock('@hooks/useCurrentReportID', () => ({useCurrentReportIDState: jest.fn()}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useBankAccountUnlockEffect', () => jest.fn());
jest.mock('@hooks/useAppFocusEvent', () => jest.fn());
jest.mock('@libs/Notification/clearReportNotifications', () => jest.fn());
jest.mock('@react-navigation/native', () => ({useIsFocused: () => true}));

const mockClearReportNotifications = jest.mocked(clearReportNotifications);

type HandlerProps = {isInPreloadedTab: boolean; isHiddenPreMount: boolean};

function Handler({isInPreloadedTab, isHiddenPreMount}: HandlerProps) {
    return (
        <IsInPreloadedTabContext.Provider value={isInPreloadedTab}>
            <IsHiddenWideTabPreMountContext.Provider value={isHiddenPreMount}>
                <ReportLifecycleHandler reportID="1" />
            </IsHiddenWideTabPreMountContext.Provider>
        </IsInPreloadedTabContext.Provider>
    );
}

describe('ReportLifecycleHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useCurrentReportIDState).mockReturnValue({currentReportID: '1', currentRHPReportID: undefined});
    });

    it('clears the notifications of the topmost report the user is looking at', () => {
        // Given the topmost report rendered in sight
        render(
            <Handler
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );

        // Then its notifications are cleared, because the user is reading it
        expect(mockClearReportNotifications).toHaveBeenCalledWith('1');
    });

    it('keeps the notifications of a topmost report pre-mounted in a background tab until it is revealed', () => {
        // Given a wide submit pre-mount in a background preloaded tab, which the topmost report lookup counts as topmost
        const {rerender} = render(
            <Handler
                isInPreloadedTab
                isHiddenPreMount={false}
            />,
        );

        // Then nothing is cleared, because the user never opened that report and may still cancel
        expect(mockClearReportNotifications).not.toHaveBeenCalled();

        // When the reveal focuses its tab
        rerender(
            <Handler
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );

        // Then the notifications are cleared, because the report is now on screen
        expect(mockClearReportNotifications).toHaveBeenCalledWith('1');
    });

    it('keeps the notifications of a hidden wide submit pre-mount', () => {
        // Given a report pre-mounted hidden under the current screen of the focused tab
        render(
            <Handler
                isInPreloadedTab={false}
                isHiddenPreMount
            />,
        );

        // Then nothing is cleared, because the screen is not visible
        expect(mockClearReportNotifications).not.toHaveBeenCalled();
    });
});
