import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type Navigation from '@libs/Navigation/Navigation';
import AppNavigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';

import DynamicReportDetailsPage from '@pages/DynamicReportDetailsPage';

import * as TaskDeletion from '@userActions/TaskDeletion';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../../../utils/mockUseConfirmModal';

import createRandomPolicy from '../../../utils/collections/policies';
import createRandomReportAction from '../../../utils/collections/reportActions';
import {createRandomReport} from '../../../utils/collections/reports';
import createMock from '../../../utils/createMock';
import {mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../../../utils/mockUseConfirmModal';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});
jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn(() => false));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: jest.fn(),
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const mockHtmlToText = jest.spyOn(Parser, 'htmlToText');
const navigationMock = createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['navigation']>({});
const getRouteMock = (reportID: string) => createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['route']>({params: {reportID}});

describe('DynamicReportDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        mockHtmlToText.mockClear();
        resetMockConfirmModal();
        jest.spyOn(TransitionTracker, 'runAfterTransitions').mockReturnValue({cancel: jest.fn()});
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should not call Parser.htmlToText when parentReportAction is ADD_COMMENT', async () => {
        const reportID = '10';
        const parentReportID = '20';
        const parentActionID = '100';

        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        } as ReportAction;

        const report: Report = {
            ...createRandomReport(Number(reportID), undefined),
            parentReportID,
            parentReportActionID: parentActionID,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, createRandomReport(Number(parentReportID), undefined));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <DynamicReportDetailsPage
                        isLoadingReportData={false}
                        navigation={navigationMock}
                        policy={undefined}
                        report={report}
                        reportMetadata={undefined}
                        reportLoadingState={undefined}
                        route={getRouteMock(reportID)}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).not.toHaveBeenCalled();
    });

    it('should navigate to the Search backTo route when deleting a task from Search', async () => {
        const currentUserAccountID = 1;
        const reportID = '11';
        const parentReportID = '22';
        const parentActionID = '101';
        const searchBackTo = ROUTES.SEARCH_REPORT.getRoute({
            reportID: parentReportID,
            reportActionID: parentActionID,
            backTo: ROUTES.SEARCH_ROOT.getRoute({query: 'type:chat'}),
        });

        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: currentUserAccountID,
            childManagerAccountID: currentUserAccountID,
            childReportID: reportID,
            message: [
                {
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    html: '',
                    text: '',
                    isDeletedParentAction: false,
                },
            ],
        } as ReportAction;

        const taskReport: Report = {
            ...createRandomReport(Number(reportID), undefined),
            type: CONST.REPORT.TYPE.TASK,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            ownerAccountID: currentUserAccountID,
            parentReportID,
            parentReportActionID: parentActionID,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, taskReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {
                ...createRandomReport(Number(parentReportID), undefined),
                participants: {[currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        jest.spyOn(AppNavigation, 'getTopmostSearchReportRouteParams').mockReturnValue({reportID, backTo: searchBackTo});
        const goBackSpy = jest.spyOn(AppNavigation, 'goBack');

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsContext.Provider value={{accountID: currentUserAccountID}}>
                    <LocaleContextProvider>
                        <DynamicReportDetailsPage
                            isLoadingReportData={false}
                            navigation={navigationMock}
                            policy={undefined}
                            report={taskReport}
                            reportMetadata={undefined}
                            reportLoadingState={undefined}
                            route={getRouteMock(reportID)}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsContext.Provider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText('Delete'), {type: 'press'});

        expect(mockShowConfirmModal).toHaveBeenCalled();

        await act(async () => {
            resolveShowConfirmModal();
        });
        await waitForBatchedUpdatesWithAct();

        expect(goBackSpy).toHaveBeenCalledWith(searchBackTo);
    });

    describe('task Delete for workspace admins', () => {
        const currentUserAccountID = 1;
        const taskOwnerAccountID = 8;
        const reportID = '12';

        const taskReport: Report = {
            ...createRandomReport(Number(reportID), undefined),
            type: CONST.REPORT.TYPE.TASK,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            ownerAccountID: taskOwnerAccountID,
            reportName: 'Workspace task',
            parentReportID: '23',
            parentReportActionID: '102',
        };

        const workspaceRoom: Report = {
            reportID: '23',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            visibility: CONST.REPORT.VISIBILITY.PUBLIC,
            policyID: taskReport.policyID,
        };

        const renderTaskDetailsAs = async (role: ValueOf<typeof CONST.POLICY.ROLE>, taskOverrides: Partial<Report> = {}, parentReport: Report | null = workspaceRoom) => {
            const report = {...taskReport, ...taskOverrides};
            const policy = {...createRandomPolicy(Number(taskReport.policyID), CONST.POLICY.TYPE.TEAM), role};
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceRoom.reportID}`, parentReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            });

            render(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsContext.Provider value={{accountID: currentUserAccountID}}>
                        <LocaleContextProvider>
                            <DynamicReportDetailsPage
                                isLoadingReportData={false}
                                navigation={navigationMock}
                                policy={policy}
                                report={report}
                                reportMetadata={undefined}
                                reportLoadingState={undefined}
                                route={getRouteMock(reportID)}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsContext.Provider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();
        };

        it.each([CONST.REPORT.CHAT_TYPE.POLICY_ROOM, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE])(
            'should show Delete to a workspace admin who is not the task owner in %s',
            async (chatType) => {
                // Given an open task in a workspace, owned by another account

                // When an admin of that workspace opens the task details
                await renderTaskDetailsAs(CONST.POLICY.ROLE.ADMIN, {}, {...workspaceRoom, chatType});

                // Then Delete is shown, because admins can remove tasks created by others in their workspace
                expect(screen.getByLabelText('Delete')).toBeOnTheScreen();
            },
        );

        it.each([CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.AUDITOR])('should not show Delete to a workspace %s who is not the task owner', async (role) => {
            // Given an open task in a workspace, owned by another account

            // When a non-admin member of that workspace opens the task details
            await renderTaskDetailsAs(role);

            // Then Delete is not shown, because only the task owner and workspace admins can delete a task
            expect(screen.queryByLabelText('Delete')).not.toBeOnTheScreen();
        });

        it('should let a workspace admin delete an ordinary Guide-created task without granting edit permissions', async () => {
            // Given an ordinary task in a public workspace room, Guide ownership must not imply guided setup
            const deleteTask = jest.spyOn(TaskDeletion, 'deleteTask').mockImplementation(() => {});
            jest.mocked(TransitionTracker.runAfterTransitions).mockImplementation(({callback}) => {
                callback();
                return {cancel: jest.fn()};
            });
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, [taskOwnerAccountID]);
            });

            // When another admin opens the task without personal onboarding data
            await renderTaskDetailsAs(CONST.POLICY.ROLE.ADMIN);

            // Then the existing confirmation allows deletion, but the title remains read-only
            expect(screen.getByText(taskReport.reportName ?? '')).toBeOnTheScreen();
            expect(screen.queryByRole('button', {name: taskReport.reportName})).not.toBeOnTheScreen();
            fireEvent.press(screen.getByLabelText('Delete'), {type: 'press'});
            expect(deleteTask).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal();
            });
            await waitForBatchedUpdatesWithAct();

            expect(deleteTask).toHaveBeenCalledTimes(1);
        });

        it.each([
            {ownerAccountID: taskOwnerAccountID, chatType: undefined, onboarding: undefined},
            {ownerAccountID: taskOwnerAccountID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, onboarding: {chatReportID: '99'}},
            {ownerAccountID: CONST.ACCOUNT_ID.CONCIERGE, chatType: undefined, onboarding: {}},
            {ownerAccountID: CONST.ACCOUNT_ID.CONCIERGE, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, onboarding: undefined},
        ])('should protect setup tasks using their parent room: %j', async ({ownerAccountID, chatType, onboarding}) => {
            // Given setup tasks with or without inherited chatType, the viewing admin may have unrelated or missing onboarding data
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, [taskOwnerAccountID]);
                if (onboarding) {
                    await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, onboarding);
                }
            });

            // When another workspace admin opens a Guide or Concierge task in #admins
            await renderTaskDetailsAs(CONST.POLICY.ROLE.ADMIN, {ownerAccountID, chatType}, {...workspaceRoom, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS});

            // Then setup flows retain their task and no deletion confirmation can be opened
            expect(screen.queryByLabelText('Delete')).not.toBeOnTheScreen();
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it.each([undefined, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS])('should not grant admin deletion while the parent is missing, with task chatType %s', async (chatType) => {
            // Given a Guide-owned task whose parent is not loaded, its setup context is not yet known
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, [taskOwnerAccountID]);
            });

            // When an admin opens the task before its parent arrives
            await renderTaskDetailsAs(CONST.POLICY.ROLE.ADMIN, {chatType}, null);

            // Then missing data must not grant permission to delete a setup task
            expect(screen.queryByLabelText('Delete')).not.toBeOnTheScreen();
        });

        it.each([undefined, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT])('should not grant admin deletion outside workspace rooms: %s', async (chatType) => {
            // Given a task in a DM or expense chat, a workspace policy alone must not grant room permissions

            // When a workspace admin opens another account's task
            await renderTaskDetailsAs(CONST.POLICY.ROLE.ADMIN, {}, {...workspaceRoom, chatType});

            // Then the admin permission remains limited to workspace rooms
            expect(screen.queryByLabelText('Delete')).not.toBeOnTheScreen();
        });

        it('should preserve creator deletion for a Guide-owned task in #admins', async () => {
            // Given a task created by the current Guide, the setup exception must only restrict the additional admin permission
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, [currentUserAccountID]);
            });

            // When the creator opens their task without being a workspace admin
            await renderTaskDetailsAs(CONST.POLICY.ROLE.USER, {ownerAccountID: currentUserAccountID}, {...workspaceRoom, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS});

            // Then the existing creator permission still allows deletion
            expect(screen.getByLabelText('Delete')).toBeOnTheScreen();
        });
    });
});
