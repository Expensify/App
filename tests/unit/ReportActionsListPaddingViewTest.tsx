import Text from '@components/Text';

import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';

import {canUserPerformWriteAction} from '@libs/ReportUtils';

import ReportActionsListPaddingView from '@pages/inbox/report/ReportActionsListPaddingView';
import useShouldShowComposerForActiveEditDraft from '@pages/inbox/report/useShouldShowComposerForActiveEditDraft';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

const PB4_PADDING_BOTTOM = 16;

jest.mock('@hooks/useReportRecipientLocalTime');
jest.mock('@pages/inbox/report/useShouldShowComposerForActiveEditDraft');

jest.mock('@libs/ReportUtils', () => ({
    parseReportRouteParams: jest.fn(() => ({})),
    canUserPerformWriteAction: jest.fn(),
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
    pb4: {paddingBottom: PB4_PADDING_BOTTOM},
}));

const mockUseReportRecipientLocalTime = useReportRecipientLocalTime as jest.MockedFunction<typeof useReportRecipientLocalTime>;
const mockUseShouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft as jest.MockedFunction<typeof useShouldShowComposerForActiveEditDraft>;
const mockCanUserPerformWriteAction = canUserPerformWriteAction as jest.MockedFunction<typeof canUserPerformWriteAction>;

const CURRENT_USER_ACCOUNT_ID = 1;

const REPORT = {
    reportID: '1',
    type: CONST.REPORT.TYPE.CHAT,
    participants: {
        [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    },
} as Report;

type PaddingScenario = {
    canShowRecipientLocalTime: boolean;
    canUserPerformWriteAction: boolean;
    shouldShowComposerForActiveEditDraft: boolean;
    shouldApplyBottomPadding: boolean;
};

const paddingScenarios: PaddingScenario[] = [
    {
        canShowRecipientLocalTime: false,
        canUserPerformWriteAction: true,
        shouldShowComposerForActiveEditDraft: false,
        shouldApplyBottomPadding: true,
    },
    {
        canShowRecipientLocalTime: true,
        canUserPerformWriteAction: true,
        shouldShowComposerForActiveEditDraft: false,
        shouldApplyBottomPadding: false,
    },
    {
        canShowRecipientLocalTime: false,
        canUserPerformWriteAction: false,
        shouldShowComposerForActiveEditDraft: false,
        shouldApplyBottomPadding: false,
    },
    {
        canShowRecipientLocalTime: false,
        canUserPerformWriteAction: false,
        shouldShowComposerForActiveEditDraft: true,
        shouldApplyBottomPadding: true,
    },
];

function renderPaddingView(isReportArchived = false) {
    return render(
        <ReportActionsListPaddingView
            report={REPORT}
            isReportArchived={isReportArchived}
        >
            <Text>child</Text>
        </ReportActionsListPaddingView>,
    );
}

function getPaddingBottom(toJSON: ReturnType<typeof render>['toJSON']) {
    const root = toJSON();

    if (!root || typeof root !== 'object' || !('props' in root)) {
        return undefined;
    }

    return StyleSheet.flatten(root.props?.style as ViewStyle)?.paddingBottom;
}

describe('ReportActionsListPaddingView', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseShouldShowComposerForActiveEditDraft.mockReturnValue(false);
        mockCanUserPerformWriteAction.mockReturnValue(true);
        mockUseReportRecipientLocalTime.mockReturnValue(false);
    });

    it('renders children', () => {
        renderPaddingView();

        expect(screen.getByText('child')).toBeOnTheScreen();
    });

    describe('bottom padding', () => {
        it.each(paddingScenarios)(
            'shouldApplyBottomPadding=$shouldApplyBottomPadding when canShowRecipientLocalTime=$canShowRecipientLocalTime, canUserPerformWriteAction=$canUserPerformWriteAction, shouldShowComposerForActiveEditDraft=$shouldShowComposerForActiveEditDraft',
            ({canShowRecipientLocalTime, canUserPerformWriteAction: canWrite, shouldShowComposerForActiveEditDraft, shouldApplyBottomPadding}) => {
                mockUseReportRecipientLocalTime.mockReturnValue(canShowRecipientLocalTime);
                mockCanUserPerformWriteAction.mockReturnValue(canWrite);
                mockUseShouldShowComposerForActiveEditDraft.mockReturnValue(shouldShowComposerForActiveEditDraft);

                const view = renderPaddingView();

                expect(getPaddingBottom(view.toJSON)).toBe(shouldApplyBottomPadding ? PB4_PADDING_BOTTOM : undefined);
            },
        );
    });
});
