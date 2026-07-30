import {render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';

import {isRecord} from '@libs/ObjectUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import ReportActionsListPaddingView from '@pages/inbox/report/ReportActionsListPaddingView';
import useShouldShowComposerForActiveEditDraft from '@pages/inbox/report/useShouldShowComposerForActiveEditDraft';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';

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

const mockUseReportRecipientLocalTime = jest.mocked(useReportRecipientLocalTime);
const mockUseShouldShowComposerForActiveEditDraft = jest.mocked(useShouldShowComposerForActiveEditDraft);
const mockCanUserPerformWriteAction = jest.mocked(canUserPerformWriteAction);

const CURRENT_USER_ACCOUNT_ID = 1;

const REPORT: Report = {
    reportID: '1',
    type: CONST.REPORT.TYPE.CHAT,
    participants: {
        [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    },
};

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

type PaddingStyle = Pick<ViewStyle, 'paddingBottom'>;

function isPaddingStyleProp(value: unknown): value is StyleProp<PaddingStyle> {
    if (value === null || value === undefined || value === false || typeof value === 'number') {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every((entry: unknown) => isPaddingStyleProp(entry));
    }
    return isRecord(value) && (!('paddingBottom' in value) || typeof value.paddingBottom === 'number');
}

function getPaddingBottom(toJSON: ReturnType<typeof render>['toJSON']) {
    const root = toJSON();

    if (!root || !isRecord(root) || !('props' in root) || !isRecord(root.props)) {
        return undefined;
    }

    const style = root.props.style;
    return isPaddingStyleProp(style) ? StyleSheet.flatten<PaddingStyle>(style)?.paddingBottom : undefined;
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
