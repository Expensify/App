import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {clearAllRelatedReportActionErrors} from '@libs/actions/ClearReportActionErrors';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import PureReportActionItem from '@pages/inbox/report/PureReportActionItem';
import CONST from '@src/CONST';
import * as ReportActionUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@react-navigation/native');

const ACTOR_ACCOUNT_ID = 123456789;
const ACTOR_EMAIL = 'test@test.com';
const REPORT_ID = '12345';
const REPORT_ACTION_ID = '99999';
const CHILD_REPORT_ID = '67890';
const CHILD_REPORT_ACTION_ID = '88888';

function createMockReportAction(overrides: Partial<ReportAction> = {}): ReportAction {
    const errorTimestamp = Date.now() * 1000;
    return {
        reportActionID: REPORT_ACTION_ID,
        actorAccountID: ACTOR_ACCOUNT_ID,
        created: '2025-01-01 12:00:00.000',
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        automatic: false,
        shouldShow: true,
        avatar: '',
        person: [{type: 'TEXT', style: 'strong', text: ACTOR_EMAIL}],
        message: [{type: 'COMMENT', html: 'Test message with error', text: 'Test message with error'}],
        errors: {
            [errorTimestamp]: 'Something went wrong. Please try again.',
        },
        ...overrides,
    } as ReportAction;
}

function createMockReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        reportName: 'Test Report',
        type: CONST.REPORT.TYPE.CHAT,
        ownerAccountID: ACTOR_ACCOUNT_ID,
        ...overrides,
    } as Report;
}

function getReportActionsFromOnyx(reportID: string): Promise<ReportActions | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('ClearReportActionErrors UI', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
        jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(getIOUActionForReportID);
    });

    beforeEach(async () => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
            await Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [ACTOR_ACCOUNT_ID]: {
                    accountID: ACTOR_ACCOUNT_ID,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_9.png',
                    displayName: ACTOR_EMAIL,
                    login: ACTOR_EMAIL,
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    function renderReportActionItem(
        action: ReportAction,
        report: Report,
        options?: {
            clearErrorFn?: typeof clearAllRelatedReportActionErrors;
            originalReportID?: string;
            allReports?: Record<string, Report>;
        },
    ) {
        const {clearErrorFn, originalReportID = report.reportID, allReports} = options ?? {};
        return render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <OptionsListContextProvider>
                    <ScreenWrapper testID="test">
                        <PortalProvider>
                            <PureReportActionItem
                                allReports={allReports ?? {[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report}}
                                policies={undefined}
                                personalPolicyID={undefined}
                                report={report}
                                parentReportAction={undefined}
                                action={action}
                                displayAsGroup={false}
                                isMostRecentIOUReportAction={false}
                                shouldDisplayNewMarker={false}
                                index={0}
                                isFirstVisibleReportAction={false}
                                taskReport={undefined}
                                linkedReport={undefined}
                                iouReportOfLinkedReport={undefined}
                                currentUserAccountID={ACTOR_ACCOUNT_ID}
                                allTransactionDrafts={undefined}
                                clearAllRelatedReportActionErrors={clearErrorFn}
                                originalReportID={originalReportID}
                            />
                        </PortalProvider>
                    </ScreenWrapper>
                </OptionsListContextProvider>
            </ComposeProviders>,
        );
    }

    describe('Error display and dismissal', () => {
        it('should display error message when action has errors', async () => {
            const action = createMockReportAction();
            const report = createMockReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                    [REPORT_ACTION_ID]: action,
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderReportActionItem(action, report);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Something went wrong. Please try again.')).toBeOnTheScreen();
        });

        it('should call clearAllRelatedReportActionErrors when error is dismissed', async () => {
            const action = createMockReportAction();
            const report = createMockReport();
            const mockClearErrors = jest.fn();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                    [REPORT_ACTION_ID]: action,
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderReportActionItem(action, report, {
                clearErrorFn: mockClearErrors,
                originalReportID: REPORT_ID,
            });
            await waitForBatchedUpdatesWithAct();

            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            expect(mockClearErrors).toHaveBeenCalledWith(
                REPORT_ID,
                expect.objectContaining({reportActionID: REPORT_ACTION_ID}),
                REPORT_ID,
            );
        });

        it('should clear error from Onyx when dismissed', async () => {
            const errorTimestamp = Date.now() * 1000;
            const action = createMockReportAction({
                errors: {[errorTimestamp]: 'Test error message'},
            });
            const report = createMockReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                    [REPORT_ACTION_ID]: action,
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderReportActionItem(action, report, {
                clearErrorFn: clearAllRelatedReportActionErrors,
                originalReportID: REPORT_ID,
            });
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Test error message')).toBeOnTheScreen();

            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            await waitForBatchedUpdatesWithAct();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toBeUndefined();
        });
    });

    describe('Parent/child error propagation', () => {
        it('should clear errors on child actions when parent error is dismissed', async () => {
            const sharedErrorTimestamp = Date.now() * 1000;
            const sharedError = {[sharedErrorTimestamp]: 'Shared error message'};

            const parentAction = createMockReportAction({
                reportActionID: REPORT_ACTION_ID,
                childReportID: CHILD_REPORT_ID,
                errors: sharedError,
            });

            const childAction = createMockReportAction({
                reportActionID: CHILD_REPORT_ACTION_ID,
                errors: sharedError,
            });

            const parentReport = createMockReport();
            const childReport = createMockReport({
                reportID: CHILD_REPORT_ID,
                parentReportID: REPORT_ID,
                parentReportActionID: REPORT_ACTION_ID,
            });

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, parentReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHILD_REPORT_ID}`, childReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                    [REPORT_ACTION_ID]: parentAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {
                    [CHILD_REPORT_ACTION_ID]: childAction,
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderReportActionItem(parentAction, parentReport, {
                clearErrorFn: clearAllRelatedReportActionErrors,
                originalReportID: REPORT_ID,
                allReports: {
                    [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: parentReport,
                    [`${ONYXKEYS.COLLECTION.REPORT}${CHILD_REPORT_ID}`]: childReport,
                },
            });
            await waitForBatchedUpdatesWithAct();

            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            await waitForBatchedUpdatesWithAct();

            const parentReportActions = await getReportActionsFromOnyx(REPORT_ID);
            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);

            expect(parentReportActions?.[REPORT_ACTION_ID]?.errors).toBeUndefined();
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({});
        });
    });

    describe('Optimistic action deletion', () => {
        it('should delete optimistic action instead of clearing errors', async () => {
            const action = createMockReportAction({
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                isOptimisticAction: true,
            });
            const report = createMockReport();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                    [REPORT_ACTION_ID]: action,
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderReportActionItem(action, report, {
                clearErrorFn: clearAllRelatedReportActionErrors,
                originalReportID: REPORT_ID,
            });
            await waitForBatchedUpdatesWithAct();

            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            await waitForBatchedUpdatesWithAct();

            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();
        });
    });
});
