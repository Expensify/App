import {render, screen} from '@testing-library/react-native';

import SupportTicketSurvey from '@components/ReportActionItem/SupportTicketSurvey';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type ReactNative from 'react-native';

import React from 'react';

import createMock from '../../../utils/createMock';
import {getFakeReportAction} from '../../../utils/ReportTestUtils';

jest.mock('@components/Text', () => {
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    return RN.Text;
});

jest.mock('@pages/inbox/report/actionContents/ConciergeFeedbackPrompt', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    return function MockConciergeFeedbackPrompt() {
        return ReactLocal.createElement(RN.View, {testID: 'support-ticket-survey-reactions'});
    };
});

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn());
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        chatItemMessage: {},
        flexRow: {},
        alignItemsCenter: {},
        textSupporting: {},
        ml1: {},
    })),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (firstString: string, secondString: string) => firstString.localeCompare(secondString),
    })),
);

const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockUseOnyx = jest.mocked(useOnyx);

const REPORT_ID = 'support-ticket-report';
const OWNER_ACCOUNT_ID = 1;
const surveyAction = createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY>>({
    ...getFakeReportAction(2),
    actionName: CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY,
    reportActionID: 'survey-action',
    created: '2026-10-01 10:01:00.000',
    originalMessage: {html: 'How was your support experience?'},
});
const closedAction = getFakeReportAction(1, {
    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
    reportActionID: 'closed-action',
    created: '2026-10-01 10:00:00.000',
});
const report = createMock<Report>({
    reportID: REPORT_ID,
    ownerAccountID: OWNER_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
    type: CONST.REPORT.TYPE.SUPPORT_TICKET,
});

describe('SupportTicketSurvey', () => {
    beforeEach(() => {
        mockUseCurrentUserPersonalDetails.mockReturnValue(createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({accountID: OWNER_ACCOUNT_ID}));
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`) {
                return [{[closedAction.reportActionID]: closedAction, [surveyAction.reportActionID]: surveyAction}, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID}`) {
                return [{reopenedAsReportID: 'replacement-ticket-report'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('keeps the survey visible after the ticket is replaced', () => {
        render(
            <SupportTicketSurvey
                action={surveyAction}
                report={report}
                reportID={REPORT_ID}
            />,
        );

        expect(screen.getByText('supportTicket.surveyPrompt')).toBeTruthy();
        expect(screen.getByTestId('support-ticket-survey-reactions')).toBeTruthy();
    });
});
