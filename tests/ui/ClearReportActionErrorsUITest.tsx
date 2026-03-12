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
import {createMockReport, getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@react-navigation/native');

const ACTOR_ACCOUNT_ID = 123456789;
const ACTOR_EMAIL = 'test@test.com';
const REPORT_ID = '12345';
const REPORT_ACTION_ID = '99999';
const CHILD_REPORT_ID = '67890';
const CHILD_REPORT_ACTION_ID = '88888';

const DEFAULT_ERROR_TIMESTAMP = Date.now() * 1000;
const DEFAULT_ERRORS = {[DEFAULT_ERROR_TIMESTAMP]: 'Something went wrong. Please try again.'};

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
        },
    ) {
        const {clearErrorFn, originalReportID = report.reportID} = options ?? {};
        return render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <OptionsListContextProvider>
                    <ScreenWrapper testID="test">
                        <PortalProvider>
                            <PureReportActionItem
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
                                userBillingGraceEndPeriodCollection={undefined}
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
            // Given a report action with errors stored in Onyx
            const action = getFakeReportAction(Number(REPORT_ACTION_ID), {actorAccountID: ACTOR_ACCOUNT_ID, errors: DEFAULT_ERRORS});
            const report = createMockReport({reportID: REPORT_ID, ownerAccountID: ACTOR_ACCOUNT_ID});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                    [REPORT_ACTION_ID]: action,
                });
            });
            await waitForBatchedUpdatesWithAct();

            // When the PureReportActionItem component is rendered
            renderReportActionItem(action, report);
            await waitForBatchedUpdatesWithAct();

            // Then the error message should be visible on screen
            expect(screen.getByText('Something went wrong. Please try again.')).toBeOnTheScreen();
        });

        it('should call clearAllRelatedReportActionErrors when error is dismissed', async () => {
            // Given a rendered report action with errors and a mock clear function
            const action = getFakeReportAction(Number(REPORT_ACTION_ID), {actorAccountID: ACTOR_ACCOUNT_ID, errors: DEFAULT_ERRORS});
            const report = createMockReport({reportID: REPORT_ID, ownerAccountID: ACTOR_ACCOUNT_ID});
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

            // When the user presses the dismiss button
            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            // Then clearAllRelatedReportActionErrors should be called with correct arguments
            expect(mockClearErrors).toHaveBeenCalledWith(REPORT_ID, expect.objectContaining({reportActionID: REPORT_ACTION_ID}), REPORT_ID);
        });

        it('should clear error from Onyx when dismissed', async () => {
            // Given a rendered report action with a visible error message
            const errorTimestamp = Date.now() * 1000;
            const action = getFakeReportAction(Number(REPORT_ACTION_ID), {
                actorAccountID: ACTOR_ACCOUNT_ID,
                errors: {[errorTimestamp]: 'Test error message'},
            });
            const report = createMockReport({reportID: REPORT_ID, ownerAccountID: ACTOR_ACCOUNT_ID});

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

            // When the user presses the dismiss button
            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            await waitForBatchedUpdatesWithAct();

            // Then the error should be removed from Onyx
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]?.errors).toBeUndefined();
        });
    });

    describe('Parent/child error propagation', () => {
        it('should clear errors on child actions when parent error is dismissed', async () => {
            // Given a parent action with a child report, both having errors with matching keys
            const sharedErrorTimestamp = Date.now() * 1000;
            const sharedError = {[sharedErrorTimestamp]: 'Shared error message'};

            const parentAction = getFakeReportAction(Number(REPORT_ACTION_ID), {
                actorAccountID: ACTOR_ACCOUNT_ID,
                childReportID: CHILD_REPORT_ID,
                errors: sharedError,
            });

            const childAction = getFakeReportAction(Number(CHILD_REPORT_ACTION_ID), {
                actorAccountID: ACTOR_ACCOUNT_ID,
                errors: sharedError,
            });

            const parentReport = createMockReport({reportID: REPORT_ID, ownerAccountID: ACTOR_ACCOUNT_ID});
            const childReport = createMockReport({
                reportID: CHILD_REPORT_ID,
                parentReportID: REPORT_ID,
                parentReportActionID: REPORT_ACTION_ID,
                ownerAccountID: ACTOR_ACCOUNT_ID,
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
            });
            await waitForBatchedUpdatesWithAct();

            // When the user dismisses the error on the parent action
            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            await waitForBatchedUpdatesWithAct();

            // Then both parent and child errors should be cleared
            const parentReportActions = await getReportActionsFromOnyx(REPORT_ID);
            const childReportActions = await getReportActionsFromOnyx(CHILD_REPORT_ID);

            expect(parentReportActions?.[REPORT_ACTION_ID]?.errors).toBeUndefined();
            expect(childReportActions?.[CHILD_REPORT_ACTION_ID]?.errors).toEqual({});
        });
    });

    describe('Optimistic action deletion', () => {
        it('should delete optimistic action instead of clearing errors', async () => {
            // Given an optimistic report action (pendingAction='add' and isOptimisticAction=true) with errors
            const action = getFakeReportAction(Number(REPORT_ACTION_ID), {
                actorAccountID: ACTOR_ACCOUNT_ID,
                errors: DEFAULT_ERRORS,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                isOptimisticAction: true,
            });
            const report = createMockReport({reportID: REPORT_ID, ownerAccountID: ACTOR_ACCOUNT_ID});

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

            // When the user dismisses the error
            const dismissButton = screen.getByLabelText('Dismiss');
            fireEvent.press(dismissButton);

            await waitForBatchedUpdatesWithAct();

            // Then the entire report action should be deleted from Onyx (not just errors cleared)
            const reportActions = await getReportActionsFromOnyx(REPORT_ID);
            expect(reportActions?.[REPORT_ACTION_ID]).toBeUndefined();
        });
    });
});
