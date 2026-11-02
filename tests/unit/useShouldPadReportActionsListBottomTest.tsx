import {renderHook} from '@testing-library/react-native';

import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';

import {canUserPerformWriteAction} from '@libs/ReportUtils';

import useShouldPadReportActionsListBottom from '@pages/inbox/report/useShouldPadReportActionsListBottom';
import useShouldShowComposerForActiveEditDraft from '@pages/inbox/report/useShouldShowComposerForActiveEditDraft';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

jest.mock('@hooks/useReportRecipientLocalTime');
jest.mock('@pages/inbox/report/useShouldShowComposerForActiveEditDraft');

jest.mock('@libs/ReportUtils', () => ({
    parseReportRouteParams: jest.fn(() => ({})),
    canUserPerformWriteAction: jest.fn(),
}));

const mockIsConciergeHistoryExpanded = jest.fn(() => false);
jest.mock('@hooks/useConciergeAskState', () => () => ({isHistoryExpanded: mockIsConciergeHistoryExpanded()}));

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
    isConciergeHistoryExpanded: boolean;
    shouldPadListBottom: boolean;
};

const paddingScenarios: PaddingScenario[] = [
    // A composer with nothing above it needs the space
    {canShowRecipientLocalTime: false, canUserPerformWriteAction: true, shouldShowComposerForActiveEditDraft: false, isConciergeHistoryExpanded: false, shouldPadListBottom: true},
    // The recipient's local time already sits between the messages and the composer
    {canShowRecipientLocalTime: true, canUserPerformWriteAction: true, shouldShowComposerForActiveEditDraft: false, isConciergeHistoryExpanded: false, shouldPadListBottom: false},
    // So does the line that invites a new question below an expanded Concierge history
    {canShowRecipientLocalTime: false, canUserPerformWriteAction: true, shouldShowComposerForActiveEditDraft: false, isConciergeHistoryExpanded: true, shouldPadListBottom: false},
    // Without a composer there is nothing to keep clear of
    {canShowRecipientLocalTime: false, canUserPerformWriteAction: false, shouldShowComposerForActiveEditDraft: false, isConciergeHistoryExpanded: false, shouldPadListBottom: false},
    // Editing a message brings the composer back
    {canShowRecipientLocalTime: false, canUserPerformWriteAction: false, shouldShowComposerForActiveEditDraft: true, isConciergeHistoryExpanded: false, shouldPadListBottom: true},
];

describe('useShouldPadReportActionsListBottom', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each(paddingScenarios)(
        'returns $shouldPadListBottom when canShowRecipientLocalTime=$canShowRecipientLocalTime, canUserPerformWriteAction=$canUserPerformWriteAction, shouldShowComposerForActiveEditDraft=$shouldShowComposerForActiveEditDraft, isConciergeHistoryExpanded=$isConciergeHistoryExpanded',
        ({canShowRecipientLocalTime, canUserPerformWriteAction: canWrite, shouldShowComposerForActiveEditDraft, isConciergeHistoryExpanded, shouldPadListBottom}) => {
            // Given a report whose footer is in the scenario's state
            mockUseReportRecipientLocalTime.mockReturnValue(canShowRecipientLocalTime);
            mockCanUserPerformWriteAction.mockReturnValue(canWrite);
            mockUseShouldShowComposerForActiveEditDraft.mockReturnValue(shouldShowComposerForActiveEditDraft);
            mockIsConciergeHistoryExpanded.mockReturnValue(isConciergeHistoryExpanded);

            // When the list asks whether to keep space below its newest message
            const {result} = renderHook(() => useShouldPadReportActionsListBottom(REPORT, false));

            // Then it only does when a composer sits right below the messages
            expect(result.current).toBe(shouldPadListBottom);
        },
    );
});
