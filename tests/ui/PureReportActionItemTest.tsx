import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import Parser from '@libs/Parser';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import PureReportActionItem from '@pages/home/report/PureReportActionItem';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import * as ReportActionUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, ReportAction} from '@src/types/onyx';
import type {OriginalMessage} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@react-navigation/native');

const ACTOR_ACCOUNT_ID = 123456789;
const actorEmail = 'test@test.com';

const createReportAction = (actionName: ReportActionName, originalMessageExtras: Partial<OriginalMessage<ReportActionName>>) =>
    ({
        reportActionID: '12345',
        actorAccountID: ACTOR_ACCOUNT_ID,
        created: '2025-07-12 09:03:17.653',
        actionName,
        automatic: true,
        shouldShow: true,
        avatar: '',
        person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
        message: [{type: 'COMMENT', html: 'some message', text: 'some message'}],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        originalMessage: {
            ...originalMessageExtras,
        },
    }) as ReportAction;

describe('PureReportActionItem', () => {
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
                    displayName: actorEmail,
                    login: actorEmail,
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

    function renderItemWithAction(action: ReportAction) {
        return render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <OptionsListContextProvider>
                    <ScreenWrapper testID="test">
                        <PortalProvider>
                            <PureReportActionItem
                                allReports={undefined}
                                policies={undefined}
                                personalPolicyID={undefined}
                                report={undefined}
                                reportActions={[]}
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
                            />
                        </PortalProvider>
                    </ScreenWrapper>
                </OptionsListContextProvider>
            </ComposeProviders>,
        );
    }

    describe('Automatic actions', () => {
        const testCases = [
            {
                testTitle: 'APPROVED action via workspace rules',
                actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                originalMessageExtras: {automaticAction: true},
                translationKey: 'iou.automaticallyApproved',
            },
            {
                testTitle: 'FORWARDED action via workspace rules',
                actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                originalMessageExtras: {automaticAction: true},
                translationKey: 'iou.automaticallyForwarded',
            },
            {
                testTitle: 'SUBMITTED action via harvesting',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                originalMessageExtras: {harvesting: true},
                translationKey: 'iou.automaticallySubmitted',
            },
            {
                testTitle: 'SUBMITTED_AND_CLOSED action via harvesting',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
                originalMessageExtras: {harvesting: true},
                translationKey: 'iou.automaticallySubmitted',
            },
        ];

        const parseTextWithTrailingLink = (translatedText: string) => {
            const match = translatedText.match(/^(.*?)(<a[^>]*>)(.*?)(<\/a>)$/);
            if (!match) {
                return null;
            }
            const [, textBeforeLink, , linkText] = match;
            return {textBeforeLink, linkText};
        };

        it.each(testCases)('$testTitle', async ({actionName, originalMessageExtras, translationKey}) => {
            const action = createReportAction(actionName, originalMessageExtras);
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(CONST.CONCIERGE_DISPLAY_NAME)).toBeOnTheScreen();
            const parsedText = parseTextWithTrailingLink(translateLocal(translationKey as TranslationPaths));
            if (!parsedText) {
                throw new Error('Text cannot be parsed, translation failed');
            }

            const {textBeforeLink, linkText} = parsedText;
            expect(screen.getByText(textBeforeLink)).toBeOnTheScreen();
            expect(screen.getByText(linkText)).toBeOnTheScreen();
        });

        it('CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS, {originalID: 'original-report-id'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/created this report for any held expenses from/)).toBeOnTheScreen();
        });
    });

    describe('Manual actions', () => {
        it('APPROVED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.APPROVED, {automaticAction: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.approvedMessage'))).toBeOnTheScreen();
        });

        it('FORWARDED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.FORWARDED, {automaticAction: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.forwarded'))).toBeOnTheScreen();
        });

        it('SUBMITTED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted', {}))).toBeOnTheScreen();
        });

        it('SUBMITTED action with memo', async () => {
            const memo = 'memo message';
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: false, message: memo});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted', {memo}))).toBeOnTheScreen();
        });

        it('SUBMITTED_AND_CLOSED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, {harvesting: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted', {}))).toBeOnTheScreen();
        });
    });

    describe('Policy log actions', () => {
        it('CORPORATE_FORCE_UPGRADE action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE, {automaticAction: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(Parser.htmlToText(translateLocal('workspaceActions.forcedCorporateUpgrade')))).toBeOnTheScreen();
        });
    });

    describe('DEW (Dynamic External Workflow) actions', () => {
        it('should display DEW queued message for pending SUBMITTED action when policy has DEW enabled and offline', async () => {
            // Given a SUBMITTED action with pendingAction on a policy with DEW (Dynamic External Workflow) enabled
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: false});
            action.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

            const dewPolicy = {
                id: 'testPolicy',
                name: 'Test DEW Policy',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: 'owner@test.com',
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            } as const;

            const reportMetadata = {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}testPolicy`, dewPolicy);
            });
            await waitForBatchedUpdatesWithAct();

            // When the PureReportActionItem is rendered with the pending SUBMITTED action while offline
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    allReports={undefined}
                                    personalPolicyID={undefined}
                                    policies={{testPolicy: dewPolicy as Policy}}
                                    policy={dewPolicy as Policy}
                                    report={{reportID: 'testReport', policyID: 'testPolicy'}}
                                    reportActions={[]}
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
                                    reportMetadata={reportMetadata}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            // Then it should display the DEW queued message because submission is pending via external workflow while offline
            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.queuedToSubmitViaDEW'))).toBeOnTheScreen();
        });

        it('should display standard submitted message for pending SUBMITTED action when policy does not have DEW enabled', async () => {
            // Given a SUBMITTED action with pendingAction on a policy with basic approval mode (no DEW)
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: false});
            action.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

            const basicPolicy = {
                id: 'testPolicy',
                name: 'Test Basic Policy',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: 'owner@test.com',
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            } as const;

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}testPolicy`, basicPolicy);
            });
            await waitForBatchedUpdatesWithAct();

            // When the PureReportActionItem is rendered with the pending SUBMITTED action
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    allReports={undefined}
                                    personalPolicyID={undefined}
                                    policies={{testPolicy: basicPolicy as Policy}}
                                    policy={basicPolicy as Policy}
                                    report={{reportID: 'testReport', policyID: 'testPolicy'}}
                                    reportActions={[]}
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
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            // Then it should display the standard submitted message and not the DEW queued message
            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted', {}))).toBeOnTheScreen();
            expect(screen.queryByText(translateLocal('iou.queuedToSubmitViaDEW'))).not.toBeOnTheScreen();
        });
    });
});
