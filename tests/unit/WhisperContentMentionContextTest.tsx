/* eslint-disable @typescript-eslint/naming-convention */
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ConfirmWhisperContent from '@pages/inbox/report/actionContents/ConfirmWhisperContent';
import ReportMentionWhisperContent from '@pages/inbox/report/actionContents/ReportMentionWhisperContent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));
jest.mock('@navigation/Navigation', () => ({getActiveRoute: jest.fn(() => '')}));
jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

const REPORT_ID = 'report-100';
const ROOM_ID = 'room-200';
const POLICY_ID = 'workspace-abc';

// Mock ReportActionItemMessage to render a real MentionReportRenderer with a test tnode.
// The whisper component provides MentionReportContext, the real renderer consumes it.
jest.mock('@pages/inbox/report/ReportActionItemMessage', () => {
    const {default: Renderer} = jest.requireActual<{default: React.ComponentType<{tnode: unknown; TDefaultRenderer: () => null; style: Record<string, unknown>}>}>(
        '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer',
    );

    // cspell:disable-next-line
    const tnode = {attributes: {reportid: ROOM_ID}, data: '#test-room'};
    return () => (
        <Renderer
            tnode={tnode}
            TDefaultRenderer={() => null}
            style={{}}
        />
    );
});

function createWhisperAction<T extends string>(actionName: T) {
    return {
        reportActionID: 'action-1',
        actorAccountID: 1,
        created: '2025-07-12 09:03:17.653',
        actionName,
        automatic: true,
        shouldShow: true,
        avatar: '',
        person: [{type: 'TEXT', style: 'strong', text: 'Test'}],
        message: [{type: 'COMMENT', html: 'whisper message', text: 'whisper message'}],
        originalMessage: {},
    } as ReportAction;
}

const report = {
    reportID: REPORT_ID,
    policyID: POLICY_ID,
} as Report;

describe('Whisper content components provide MentionReportContext so room mentions render as links', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                reportID: REPORT_ID,
                policyID: POLICY_ID,
            } as Report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${ROOM_ID}`, {
                reportID: ROOM_ID,
                reportName: 'test-room',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                policyID: POLICY_ID,
            } as Report);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('ReportMentionWhisperContent renders room mention as a link', async () => {
        const action = createWhisperAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER);

        render(
            <OnyxListItemProvider>
                <ReportMentionWhisperContent
                    action={action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER>}
                    reportID={REPORT_ID}
                    report={report}
                    originalReport={undefined}
                    isReportArchived={false}
                    resolveActionableReportMentionWhisper={jest.fn()}
                />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('#test-room')).toBeOnTheScreen();
        expect(screen.getByRole('link')).toBeOnTheScreen();
    });

    it('ConfirmWhisperContent renders room mention as a link', async () => {
        const action = createWhisperAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER);

        render(
            <OnyxListItemProvider>
                <ConfirmWhisperContent
                    action={action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER>}
                    reportID={REPORT_ID}
                    originalReportID={undefined}
                    report={report}
                    originalReport={undefined}
                />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('#test-room')).toBeOnTheScreen();
        expect(screen.getByRole('link')).toBeOnTheScreen();
    });
});
