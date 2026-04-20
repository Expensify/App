import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {openLink} from '@libs/actions/Link';
import {setHasRadio} from '@libs/NetworkState';
import Parser from '@libs/Parser';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import PureReportActionItem from '@pages/inbox/report/PureReportActionItem';
import colors from '@styles/theme/colors';
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

type LinkModuleMock = {openLink: typeof openLink} & Record<string, unknown>;

jest.mock('@libs/actions/Link', () => {
    const actual = jest.requireActual<LinkModuleMock>('@libs/actions/Link');
    return {
        ...actual,
        openLink: jest.fn(),
    };
});

jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

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
        setHasRadio(true);
        await act(async () => {
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
                                personalPolicyID={undefined}
                                report={undefined}
                                parentReportAction={undefined}
                                action={action}
                                displayAsGroup={false}
                                shouldDisplayNewMarker={false}
                                index={0}
                                isFirstVisibleReportAction={false}
                                taskReport={undefined}
                                linkedReport={undefined}
                                iouReportOfLinkedReport={undefined}
                                currentUserAccountID={ACTOR_ACCOUNT_ID}
                                betas={undefined}
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

        it('APPROVED action via workspace rules shows Explain when reasoning is present', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.APPROVED, {
                automaticAction: true,
                reasoning: 'This report met the workspace auto-approval criteria.',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Explain')).toBeOnTheScreen();
        });

        it('APPROVED action via workspace rules does not show Explain when reasoning is absent', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.APPROVED, {automaticAction: true});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('Explain')).not.toBeOnTheScreen();
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
            expect(screen.getByText(translateLocal('iou.submitted'))).toBeOnTheScreen();
        });

        it('SUBMITTED action with memo', async () => {
            const memo = 'memo message';
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: false, message: memo});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted', memo))).toBeOnTheScreen();
        });

        it('SUBMITTED_AND_CLOSED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, {harvesting: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted'))).toBeOnTheScreen();
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

        it('UPDATE_CUSTOM_TAX_NAME action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME, {oldName: 'Sales Tax', newName: 'VAT'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('changed the custom tax name to "VAT" (previously "Sales Tax")')).toBeOnTheScreen();
        });

        it('UPDATE_CURRENCY_DEFAULT_TAX action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX, {oldName: 'Standard Rate', newName: 'Reduced Rate'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('changed the workspace currency default tax rate to "Reduced Rate" (previously "Standard Rate")')).toBeOnTheScreen();
        });

        it('UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX, {oldName: 'Foreign Tax (15%)', newName: 'Foreign Tax (10%)'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('changed the foreign currency default tax rate to "Foreign Tax (10%)" (previously "Foreign Tax (15%)")')).toBeOnTheScreen();
        });

        it('ADD_CARD_FEED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED, {feedName: 'Visa Commercial'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('added card feed "Visa Commercial"')).toBeOnTheScreen();
        });

        it('DELETE_CARD_FEED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED, {feedName: 'Amex Corporate'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('removed card feed "Amex Corporate"')).toBeOnTheScreen();
        });

        it('RENAME_CARD_FEED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED, {oldName: 'Old Feed', newName: 'New Feed'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('renamed card feed to "New Feed" (previously "Old Feed")')).toBeOnTheScreen();
        });

        it('ASSIGN_COMPANY_CARD action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD, {email: 'user@example.com', feedName: 'US Bank', cardLastFour: '1234'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('assigned user@example.com "US Bank" company card ending in 1234')).toBeOnTheScreen();
        });

        it('UNASSIGN_COMPANY_CARD action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD, {email: 'user@example.com', feedName: 'US Bank', cardLastFour: '5678'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('unassigned user@example.com "US Bank" company card ending in 5678')).toBeOnTheScreen();
        });

        it('UPDATE_CARD_FEED_LIABILITY action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY, {
                feedName: 'Visa Commercial',
                liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW,
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('enabled cardholders to delete card transactions for card feed "Visa Commercial"')).toBeOnTheScreen();
        });

        it('UPDATE_CARD_FEED_STATEMENT_PERIOD action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD, {
                feedName: 'Visa Commercial',
                statementPeriodEndDay: '15',
                previousStatementPeriodEndDay: '20',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText('changed card feed "Visa Commercial" statement period end day to "15" (previously "20")')).toBeOnTheScreen();
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
                                    personalPolicyID={undefined}
                                    policy={dewPolicy as Policy}
                                    report={{reportID: 'testReport', policyID: 'testPolicy'}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    reportMetadata={reportMetadata}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
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
                                    personalPolicyID={undefined}
                                    policy={basicPolicy as Policy}
                                    report={{reportID: 'testReport', policyID: 'testPolicy'}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            // Then it should display the standard submitted message and not the DEW queued message
            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted'))).toBeOnTheScreen();
            expect(screen.queryByText(translateLocal('iou.queuedToSubmitViaDEW'))).not.toBeOnTheScreen();
        });

        it('should display DEW queued message for pending APPROVED action when policy has DEW enabled', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.APPROVED, {automaticAction: false});
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
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE,
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}testPolicy`, dewPolicy);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    policy={dewPolicy as Policy}
                                    report={{reportID: 'testReport', policyID: 'testPolicy'}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    reportMetadata={reportMetadata}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.queuedToApproveViaDEW'))).toBeOnTheScreen();
        });

        it('should display submitted without memo for SUBMITTED action on DEW policy that is not pending', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: false, message: 'my memo'});

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

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}testPolicy`, dewPolicy);
            });
            await waitForBatchedUpdatesWithAct();

            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    policy={dewPolicy as Policy}
                                    report={{reportID: 'testReport', policyID: 'testPolicy'}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            // DEW policy should show submitted without the memo (memo is shown in the Concierge action)
            expect(screen.getByText(translateLocal('iou.submitted'))).toBeOnTheScreen();
            expect(screen.queryByText('my memo')).not.toBeOnTheScreen();
        });

        it('CLOSED action with amount (MARK_AS_CLOSED) renders submitted message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CLOSED, {amount: 5000});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.submitted'))).toBeOnTheScreen();
        });
    });

    describe('Followup list buttons', () => {
        it('should display followup buttons when message contains unresolved followup-list', async () => {
            const followupQuestion1 = 'How do I set up QuickBooks?';
            const followupQuestion2 = 'What is the Expensify Card cashback?';

            const action = {
                reportActionID: '12345',
                actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                created: '2025-07-12 09:03:17.653',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                automatic: false,
                shouldShow: true,
                avatar: '',
                person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                        html: `<p>Here is some helpful information.</p>
<followup-list>
  <followup><followup-text>${followupQuestion1}</followup-text></followup>
  <followup><followup-text>${followupQuestion2}</followup-text></followup>
</followup-list>`,
                        text: 'Here is some helpful information.',
                    },
                ],
                originalMessage: {},
            } as ReportAction;

            const report = {
                reportID: 'testReport',
                type: CONST.REPORT.TYPE.CHAT,
            };

            render(
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
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            // Verify followup buttons are displayed
            expect(screen.getByText(followupQuestion1)).toBeOnTheScreen();
            expect(screen.getByText(followupQuestion2)).toBeOnTheScreen();
        });

        it('should not display followup buttons when followup-list is resolved (has selected attribute)', async () => {
            const followupQuestion = 'How do I set up QuickBooks?';

            const action = {
                reportActionID: '12345',
                actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                created: '2025-07-12 09:03:17.653',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                automatic: false,
                shouldShow: true,
                avatar: '',
                person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                        html: `<p>Here is some helpful information.</p>
<followup-list selected>
  <followup><followup-text>${followupQuestion}</followup-text></followup>
</followup-list>`,
                        text: 'Here is some helpful information.',
                    },
                ],
                originalMessage: {},
            } as ReportAction;

            const report = {
                reportID: 'testReport',
                type: CONST.REPORT.TYPE.CHAT,
            };

            render(
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
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            // Verify followup buttons are NOT displayed (resolved state)
            expect(screen.queryByText(followupQuestion)).not.toBeOnTheScreen();
        });
    });

    describe('Reimbursed actions', () => {
        it('REIMBURSED action from OldDot should display the message', async () => {
            // Given a REIMBURSED action without isNewDot flag (created from OldDot)
            const action = {
                reportActionID: '12345',
                actorAccountID: ACTOR_ACCOUNT_ID,
                created: '2025-07-12 09:03:17.653',
                actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
                automatic: false,
                shouldShow: true,
                avatar: '',
                person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
                message: [{type: 'COMMENT', html: 'Reimbursed via ACH', text: 'Reimbursed via ACH'}],
                originalMessage: {},
            } as ReportAction;

            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            // Then the action message should be displayed
            expect(screen.getByText('Reimbursed via ACH')).toBeOnTheScreen();
        });

        it('MARKED_REIMBURSED action from OldDot should display the message', async () => {
            // Given a MARKED_REIMBURSED action without isNewDot flag (created from OldDot)
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            // Then the action message should be displayed
            expect(screen.getByText(translateLocal('iou.paidElsewhere', {}))).toBeOnTheScreen();
        });
    });

    describe('Modified expense message', () => {
        it('clicking the workspace rules link opens the workspace rules URL', async () => {
            const workspaceRulesUrl = 'https://example.com/workspaces/policy123/rules';
            const modifiedExpenseMessage = `marked the expense as "billable" via <a href="${workspaceRulesUrl}">workspace rules</a>`;

            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, {
                policyID: 'policy123',
                policyRulesModifiedFields: {billable: true},
            });

            const report = {
                reportID: 'testReport',
                type: CONST.REPORT.TYPE.CHAT,
                policyID: 'policy123',
            };

            render(
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
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                    modifiedExpenseMessage={modifiedExpenseMessage}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            const workspaceRulesLink = screen.getByText('workspace rules');
            expect(workspaceRulesLink).toBeOnTheScreen();

            fireEvent.press(workspaceRulesLink);

            expect(openLink).toHaveBeenCalledTimes(1);
            expect(openLink).toHaveBeenCalledWith(workspaceRulesUrl, expect.any(String));
        });
    });

    describe('MOVED_TRANSACTION action', () => {
        const FROM_REPORT_ID = '100';
        const TO_REPORT_ID = '200';

        beforeEach(async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FROM_REPORT_ID}`, {
                    reportID: FROM_REPORT_ID,
                    reportName: 'Source Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TO_REPORT_ID}`, {
                    reportID: TO_REPORT_ID,
                    reportName: 'Destination Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
            });
            await waitForBatchedUpdatesWithAct();
        });

        it('renders plain message without Explain link when action has no reasoning', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION, {
                fromReportID: FROM_REPORT_ID,
                toReportID: TO_REPORT_ID,
            });

            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            // The moved transaction message should be displayed
            expect(screen.getByText(/moved this expense/)).toBeOnTheScreen();

            // The "Explain" link should NOT be present
            expect(screen.queryByText('Explain')).not.toBeOnTheScreen();
        });

        it('renders Explain link when action has reasoning', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION, {
                fromReportID: FROM_REPORT_ID,
                toReportID: TO_REPORT_ID,
                reasoning: 'This expense violated the max amount rule.',
            });

            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            // The moved transaction message should be displayed
            expect(screen.getByText(/moved this expense/)).toBeOnTheScreen();

            // The "Explain" link should be present
            expect(screen.getByText('Explain')).toBeOnTheScreen();
        });
    });

    describe('Single translated message actions', () => {
        const simpleTranslationCases = [
            {
                testTitle: 'HOLD action',
                actionName: CONST.REPORT.ACTIONS.TYPE.HOLD,
                translationKey: 'iou.heldExpense' as TranslationPaths,
            },
            {
                testTitle: 'UNHOLD action',
                actionName: CONST.REPORT.ACTIONS.TYPE.UNHOLD,
                translationKey: 'iou.unheldExpense' as TranslationPaths,
            },
            {
                testTitle: 'RETRACTED action',
                actionName: CONST.REPORT.ACTIONS.TYPE.RETRACTED,
                translationKey: 'iou.retracted' as TranslationPaths,
            },
            {
                testTitle: 'REOPENED action',
                actionName: CONST.REPORT.ACTIONS.TYPE.REOPENED,
                translationKey: 'iou.reopened' as TranslationPaths,
            },
            {
                testTitle: 'REJECTEDTRANSACTION_THREAD action',
                actionName: CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD,
                translationKey: 'iou.reject.reportActions.rejectedExpense' as TranslationPaths,
            },
            {
                testTitle: 'REJECTED_TRANSACTION_MARKASRESOLVED action',
                actionName: CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED,
                translationKey: 'iou.reject.reportActions.markedAsResolved' as TranslationPaths,
            },
            {
                testTitle: 'MERGED_WITH_CASH_TRANSACTION action',
                actionName: CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION,
                translationKey: 'systemMessage.mergedWithCashTransaction' as TranslationPaths,
            },
            {
                testTitle: 'RESOLVED_DUPLICATES action',
                actionName: CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES,
                translationKey: 'violations.resolvedDuplicates' as TranslationPaths,
            },
            {
                testTitle: 'UNAPPROVED action',
                actionName: CONST.REPORT.ACTIONS.TYPE.UNAPPROVED,
                translationKey: 'iou.unapproved' as TranslationPaths,
            },
            {
                testTitle: 'REJECTED action',
                actionName: CONST.REPORT.ACTIONS.TYPE.REJECTED,
                translationKey: 'iou.rejectedThisReport' as TranslationPaths,
            },
            {
                testTitle: 'ROOM_CHANGE_LOG.LEAVE_ROOM action',
                actionName: CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM,
                translationKey: 'report.actions.type.leftTheChat' as TranslationPaths,
            },
        ];

        it.each(simpleTranslationCases)('$testTitle', async ({actionName, translationKey}) => {
            const action = createReportAction(actionName, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal(translationKey))).toBeOnTheScreen();
        });

        it('RECEIPT_SCAN_FAILED action shows message from action data', async () => {
            // Given a RECEIPT_SCAN_FAILED message with a html message from server.
            // Then verify server message is rendered.
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED, {});
            action.message = [
                {
                    type: 'COMMENT',
                    html: "the date couldn't be read from this receipt. Please enter it manually.",
                    text: "the date couldn't be read from this receipt. Please enter it manually.",
                },
            ];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText("the date couldn't be read from this receipt. Please enter it manually.")).toBeOnTheScreen();

            // Given an RECEIPT_SCAN_FAILED with no server side message
            // Then verify generic translation phrase is rendered
            action.message = [{type: 'COMMENT', html: '', text: ''}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText(translateLocal('iou.receiptScanningFailed'))).toBeOnTheScreen();
        });

        it('HOLD_COMMENT action renders via ReportActionItemBasicMessage', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT, {});
            action.message = [{type: 'COMMENT', html: 'Hold reason text', text: 'Hold reason text'}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            const textElement = screen.getByText('Hold reason text');
            expect(textElement).toBeOnTheScreen();
            // HOLD_COMMENT renders via ReportActionItemBasicMessage which applies colorMuted (textSupporting)
            expect(textElement).toHaveStyle({color: colors.productDark800});
        });

        it('DELETED_TRANSACTION action shows deleted transaction message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION, {
                amount: 1500,
                currency: 'USD',
                merchant: 'Uber',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/deleted/i)).toBeOnTheScreen();
        });

        it('MARKED_REIMBURSED action from OldDot shows reimbursement message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, {
                isNewDot: false,
                message: '',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/marked as paid/i)).toBeOnTheScreen();
        });

        it('DISMISSED_VIOLATION action shows violation message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION, {
                reason: 'manual',
                violationName: 'rter',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('marked this receipt as cash')).toBeOnTheScreen();
        });

        it('DEMOTED_FROM_WORKSPACE action shows demotion message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE, {
                policyName: 'Acme Corp',
                oldRole: 'admin',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/Acme Corp/)).toBeOnTheScreen();
        });

        it('ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL action shows approval message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL, {
                amount: 5000,
                currency: 'USD',
                merchant: 'Amazon',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/Amazon/)).toBeOnTheScreen();
        });
    });

    describe('IOU PAY actions', () => {
        it('IOU PAY with ELSEWHERE payment type', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.paidElsewhere'))).toBeOnTheScreen();
        });

        it('IOU PAY with Expensify payment type (manual)', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                automaticAction: false,
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.paidWithExpensify'))).toBeOnTheScreen();
        });

        it('IOU PAY with automatic Expensify payment', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                automaticAction: true,
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/paid with Expensify/i)).toBeOnTheScreen();
        });
    });

    describe('Reimbursement actions', () => {
        it('REIMBURSEMENT_DEQUEUED action shows dequeued message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED, {});
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={undefined}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                    reimbursementDeQueuedOrCanceledActionMessage="Payment canceled"
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Payment canceled')).toBeOnTheScreen();
        });
    });

    describe('Workspace change log - members and integrations', () => {
        it('CORPORATE_UPGRADE action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('workspaceActions.upgradedWorkspace'))).toBeOnTheScreen();
        });

        it('TEAM_DOWNGRADE action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('workspaceActions.downgradedWorkspace'))).toBeOnTheScreen();
        });

        it('IMPORT_TAGS action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_TAGS, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('workspaceActions.importTags'))).toBeOnTheScreen();
        });

        it('DELETE_ALL_TAGS action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_ALL_TAGS, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('workspaceActions.deletedAllTags'))).toBeOnTheScreen();
        });

        it('ADD_EMPLOYEE action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE, {
                email: 'user@example.com',
                role: 'user',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/user@example\.com/)).toBeOnTheScreen();
        });

        it('DELETE_EMPLOYEE action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE, {
                email: 'removed@example.com',
                role: 'user',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/removed@example\.com/)).toBeOnTheScreen();
        });

        it('ADD_INTEGRATION action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION, {
                connectionName: 'quickbooksOnline',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/QuickBooks Online/)).toBeOnTheScreen();
        });

        it('DELETE_INTEGRATION action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION, {
                connectionName: 'xero',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/Xero/)).toBeOnTheScreen();
        });

        it('UPDATE_NAME action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME, {
                oldName: 'Old Workspace',
                newName: 'New Workspace',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/New Workspace/)).toBeOnTheScreen();
        });

        it('UPDATE_CURRENCY action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY, {
                oldCurrency: 'USD',
                newCurrency: 'EUR',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/EUR/)).toBeOnTheScreen();
        });

        it('ADD_TAX action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX, {
                taxName: 'VAT 20%',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/VAT 20%/)).toBeOnTheScreen();
        });

        it('UPDATE_AUDIT_RATE action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE, {
                oldAuditRate: 0.1,
                newAuditRate: 0.25,
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/25%/)).toBeOnTheScreen();
        });

        it('LEAVE_ROOM action via policy change log', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('report.actions.type.leftTheChat'))).toBeOnTheScreen();
        });
    });

    describe('System notification actions', () => {
        it('MOVED action renders moved message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.MOVED, {
                toPolicyID: 'policy1',
                newParentReportID: 'report2',
                movedReportID: 'report3',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/moved this/i)).toBeOnTheScreen();
        });

        it('UNREPORTED_TRANSACTION action renders moved expense message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/moved this expense/i)).toBeOnTheScreen();
        });

        it('INTEGRATION_SYNC_FAILED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED, {
                label: 'QuickBooks Online',
                errorMessage: 'Token expired',
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={{reportID: 'testReport', policyID: 'pol123'}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/QuickBooks Online/)).toBeOnTheScreen();
        });

        it('COMPANY_CARD_CONNECTION_BROKEN action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN, {
                feedName: 'Chase Visa',
                policyID: 'pol123',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/Chase Visa/)).toBeOnTheScreen();
        });

        it('PLAID_BALANCE_FAILURE action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE, {
                maskedAccountNumber: '***1234',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/1234/)).toBeOnTheScreen();
        });

        it('TAKE_CONTROL action renders changed approver message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL, {
                mentionedAccountIDs: [ACTOR_ACCOUNT_ID],
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/changed the approver/i)).toBeOnTheScreen();
        });

        it('REROUTE action renders changed approver message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.REROUTE, {
                mentionedAccountIDs: [ACTOR_ACCOUNT_ID],
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/changed the approver/i)).toBeOnTheScreen();
        });

        it('SETTLEMENT_ACCOUNT_LOCKED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED, {
                maskedBankAccountNumber: '***5678',
                policyID: 'pol123',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/5678/)).toBeOnTheScreen();
        });

        it('RENAMED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.RENAMED, {
                oldName: 'Old Room',
                newName: 'New Room',
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/New Room/)).toBeOnTheScreen();
        });
    });

    describe('Actions requiring custom component props', () => {
        it('REPORT_PREVIEW renders deleted message when closed expense report with no expenses', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, {});
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={{reportID: 'testReport'}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    isClosedExpenseReportWithNoExpenses
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('parentReportAction.deletedReport'))).toBeOnTheScreen();
        });

        it('REIMBURSEMENT_QUEUED with missing bank account shows add bank account button', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED, {paymentType: ''});
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={{reportID: 'testReport', ownerAccountID: ACTOR_ACCOUNT_ID}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    missingPaymentMethod="bankAccount"
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('bankAccount.addBankAccount'))).toBeOnTheScreen();
        });

        it('REIMBURSEMENT_QUEUED with missing wallet shows enable wallet button', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED, {
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={{reportID: 'testReport', ownerAccountID: ACTOR_ACCOUNT_ID}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    missingPaymentMethod="wallet"
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('iou.enableWallet'))).toBeOnTheScreen();
        });

        it('IOU PAY VBBA manual renders business bank account message with last 4 digits', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                automaticAction: false,
                bankAccountID: 12345,
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={undefined}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    bankAccountList={{12345: {accountData: {accountNumber: '000098765'}} as never}}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/paid with bank account/i)).toBeOnTheScreen();
        });

        it('IOU PAY VBBA automatic renders auto-paid message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                automaticAction: true,
                bankAccountID: 12345,
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={undefined}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    bankAccountList={{12345: {accountData: {accountNumber: '000098765'}} as never}}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/8765/)).toBeOnTheScreen();
        });

        it('IOU PAY with bankAccountID and payAsBusiness renders settleInvoiceBusiness message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                automaticAction: false,
                bankAccountID: 55555,
                payAsBusiness: true,
                amount: 5000,
                currency: 'USD',
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrencyListContextProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={undefined}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    bankAccountList={{55555: {accountData: {accountNumber: '000012345'}} as never}}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/with business account/i)).toBeOnTheScreen();
            expect(screen.getByText(/2345/)).toBeOnTheScreen();
        });

        it('IOU PAY with bankAccountID and no payAsBusiness renders settleInvoicePersonal message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                automaticAction: false,
                bankAccountID: 77777,
                payAsBusiness: false,
                amount: 3000,
                currency: 'USD',
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrencyListContextProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={undefined}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    bankAccountList={{77777: {accountData: {accountNumber: '000067890'}} as never}}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/with personal account/i)).toBeOnTheScreen();
            expect(screen.getByText(/7890/)).toBeOnTheScreen();
        });
    });

    describe('Default rendering fallbacks', () => {
        it('Default ADD_COMMENT renders message text', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {});
            action.message = [{type: 'COMMENT', html: 'Hello world', text: 'Hello world'}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Hello world')).toBeOnTheScreen();
        });

        it('EXPORTED_TO_INTEGRATION renders exported message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/exported to/i)).toBeOnTheScreen();
        });
    });

    describe('Card freeze/unfreeze actions', () => {
        it('CARD_FROZEN renders frozen card message', async () => {
            const cardFrozenMessage = 'User froze their Expensify Card (ending in 1384). New transactions will be declined until the card is unfrozen.';
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CARD_FROZEN, {
                html: cardFrozenMessage,
                isNewDot: true,
                lastModified: '2025-07-12 09:03:17.653',
            });
            action.message = [{type: 'COMMENT', html: cardFrozenMessage, text: cardFrozenMessage}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/froze their Expensify Card/)).toBeOnTheScreen();
        });

        it('CARD_UNFROZEN renders unfrozen card message', async () => {
            const cardUnfrozenMessage = 'User unfroze their Expensify Card (ending in 1384). This card can now be used for transactions.';
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CARD_UNFROZEN, {
                html: cardUnfrozenMessage,
                isNewDot: true,
                lastModified: '2025-07-12 09:03:17.653',
            });
            action.message = [{type: 'COMMENT', html: cardUnfrozenMessage, text: cardUnfrozenMessage}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/unfroze their Expensify Card/)).toBeOnTheScreen();
        });
    });

    describe('Early returns', () => {
        it('CREATED non-harvest renders ReportActionItemCreated', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}testReport`, {
                    reportID: 'testReport',
                    type: CONST.REPORT.TYPE.CHAT,
                });
            });
            await waitForBatchedUpdatesWithAct();

            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CREATED, {});
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={{reportID: 'testReport', type: CONST.REPORT.TYPE.CHAT}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText(translateLocal('accessibilityHints.chatWelcomeMessage'))).toBeOnTheScreen();
        });

        it('isChronosOOOListAction renders ChronosOOOListActions', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/You haven't created any events/)).toBeOnTheScreen();
        });

        it('IOU PAY with isWaitingOnBankAccount returns null', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={{reportID: 'testReport', isWaitingOnBankAccount: true}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            // Should return null - actor name should not appear
            expect(screen.queryByText(actorEmail)).not.toBeOnTheScreen();
        });
    });

    describe('Workspace change log - settings and rates', () => {
        const policyLogWithRealData = [
            {
                testTitle: 'UPDATE_AUTO_REPORTING_FREQUENCY',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY,
                originalMessage: {oldFrequency: 'weekly', newFrequency: 'monthly'},
                assertion: /monthly/i,
            },
            {
                testTitle: 'IMPORT_CUSTOM_UNIT_RATES',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_CUSTOM_UNIT_RATES,
                originalMessage: {customUnitName: 'Distance'},
                assertion: /Distance/,
            },
            {
                testTitle: 'ADD_CUSTOM_UNIT_RATE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE,
                originalMessage: {customUnitName: 'Distance', rateName: 'Highway'},
                assertion: /Highway/,
            },
            {
                testTitle: 'DELETE_CUSTOM_UNIT_RATE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE,
                originalMessage: {customUnitName: 'Distance', rateName: 'Highway'},
                assertion: /Highway/,
            },
            {
                testTitle: 'UPDATE_FEATURE_ENABLED',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED,
                originalMessage: {enabled: true, featureName: 'workflows'},
                assertion: /workflows/i,
            },
            {
                testTitle: 'UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED,
                originalMessage: {enabled: true},
                assertion: /auto-pay approved reports/i,
            },
            {
                testTitle: 'UPDATE_REIMBURSEMENT_ENABLED',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED,
                originalMessage: {enabled: true},
                assertion: /enabled reimbursements/i,
            },
            {
                testTitle: 'UPDATE_ACH_ACCOUNT',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
                originalMessage: {maskedBankAccountNumber: '****1234', bankAccountName: 'Checking'},
                assertion: /Checking/,
            },
            {
                testTitle: 'UPDATE_AUTO_HARVESTING',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING,
                originalMessage: {value: true},
                assertion: /enabled scheduled submit/i,
            },
            {testTitle: 'SET_AUTO_JOIN', actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_JOIN, originalMessage: {enabled: true}, assertion: /enabled pre-approval/i},
            {testTitle: 'UPDATE_TIME_ENABLED', actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_ENABLED, originalMessage: {enabled: true}, assertion: /time tracking/i},
            {
                testTitle: 'UPDATE_DEFAULT_TITLE_ENFORCED',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED,
                originalMessage: {value: true},
                assertion: /Enforce default report titles/i,
            },
            {
                testTitle: 'UPDATE_DEFAULT_BILLABLE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE,
                originalMessage: {oldDefaultBillable: 'NON_BILLABLE', newDefaultBillable: 'BILLABLE'},
                assertion: /BILLABLE/,
            },
            {
                testTitle: 'UPDATE_DEFAULT_REIMBURSABLE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE,
                originalMessage: {oldDefaultReimbursable: 'REIMBURSABLE', newDefaultReimbursable: 'NON_REIMBURSABLE'},
                assertion: /NON_REIMBURSABLE/,
            },
            {
                testTitle: 'UPDATE_INVOICE_COMPANY_NAME',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME,
                originalMessage: {newValue: 'Acme Corp', oldValue: 'Old Corp'},
                assertion: /Acme Corp/,
            },
            {
                testTitle: 'UPDATE_INVOICE_COMPANY_WEBSITE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE,
                originalMessage: {newValue: 'https://acme.com', oldValue: 'https://old.com'},
                assertion: /acme\.com/,
            },
            {
                testTitle: 'UPDATE_IS_ATTENDEE_TRACKING_ENABLED',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED,
                originalMessage: {enabled: true},
                assertion: /attendee tracking/i,
            },
            {testTitle: 'UPDATE_CATEGORIES', actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORIES, originalMessage: {count: 5}, assertion: /updated 5 categories/i},
            {
                testTitle: 'UPDATE_MAX_EXPENSE_AGE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE,
                originalMessage: {oldMaxExpenseAge: 30, newMaxExpenseAge: 60},
                assertion: /60/,
            },
            {
                testTitle: 'UPDATE_TAG_LIST_NAME',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME,
                originalMessage: {oldName: 'Projects', newName: 'Departments'},
                assertion: /Departments/,
            },
            {testTitle: 'UPDATE_TAG_LIST', actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST, originalMessage: {tagListName: 'Projects'}, assertion: /Projects/},
            {
                testTitle: 'UPDATE_TAG_LIST_REQUIRED',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED,
                originalMessage: {tagListsName: 'Projects', isRequired: true},
                assertion: /Projects/,
            },
            {
                testTitle: 'ADD_TAG (isTagModificationAction)',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG,
                originalMessage: {tagListName: 'Projects', tagName: 'Sprint1'},
                assertion: /Sprint1/,
            },
            {
                testTitle: 'ADD_APPROVER_RULE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE,
                originalMessage: {name: 'Budget Rule', approverAccountID: 123, approverEmail: 'approver@test.com', field: 'amount', approverName: 'John'},
                assertion: /approver@test\.com/,
            },
            {
                testTitle: 'DELETE_APPROVER_RULE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE,
                originalMessage: {name: 'Budget Rule', approverAccountID: 123, approverEmail: 'approver@test.com', field: 'amount', approverName: 'John'},
                assertion: /approver@test\.com/,
            },
            {
                testTitle: 'UPDATE_OWNERSHIP',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OWNERSHIP,
                originalMessage: {oldOwnerEmail: 'old@test.com', oldOwnerName: 'Old Owner'},
                assertion: /Old Owner/,
            },
        ];

        it.each(policyLogWithRealData)('$testTitle action', async ({actionName, originalMessage, assertion}) => {
            const action = createReportAction(actionName, originalMessage);
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(assertion)).toBeOnTheScreen();
        });

        const complexPolicyLogWithRealData = [
            {
                testTitle: 'UPDATE_CUSTOM_UNIT',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT,
                originalMessage: {customUnitName: 'Distance', updatedField: 'taxEnabled', newValue: true},
                assertion: /tax tracking on distance rates/i,
            },
            {
                testTitle: 'UPDATE_CUSTOM_UNIT_RATE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE,
                originalMessage: {customUnitName: 'Distance', customUnitRateName: 'Hwy', updatedField: 'rate', oldValue: '0.50', newValue: '0.55'},
                assertion: /Hwy/,
            },
            {
                testTitle: 'ADD_REPORT_FIELD',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD,
                originalMessage: {fieldName: 'Project', fieldType: 'dropdown'},
                assertion: /Project/,
            },
            {
                testTitle: 'UPDATE_REPORT_FIELD',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD,
                originalMessage: {updateType: 'updatedDefaultValue', fieldName: 'Project', defaultValue: 'General'},
                assertion: /General/,
            },
            {
                testTitle: 'DELETE_REPORT_FIELD',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD,
                originalMessage: {fieldType: 'dropdown', fieldName: 'Project'},
                assertion: /Project/,
            },
            {
                testTitle: 'UPDATE_EMPLOYEE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE,
                originalMessage: {email: 'emp@test.com', fields: [{field: 'role', oldValue: 'user', newValue: 'admin'}]},
                assertion: /emp@test\.com/,
            },
            {
                testTitle: 'UPDATE_DEFAULT_APPROVER',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER,
                originalMessage: {approver: {email: 'john@test.com', name: 'John', accountID: 123}},
                assertion: /john@test\.com/,
            },
            {
                testTitle: 'UPDATE_SUBMITS_TO',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO,
                originalMessage: {
                    members: [{email: 'member@test.com', name: 'Member', accountID: 789}],
                    isDefaultApprover: true,
                    approver: {email: 'approver@test.com', name: 'Approver', accountID: 123},
                },
                assertion: /member@test\.com/,
            },
            {
                testTitle: 'UPDATE_FORWARDS_TO',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO,
                originalMessage: {approvers: [{email: 'approver@test.com', name: 'Approver', accountID: 123}], forwardsTo: {email: 'fwd@test.com', name: 'Fwd', accountID: 456}},
                assertion: /fwd@test\.com/,
            },
            {
                testTitle: 'UPDATE_AUTO_REIMBURSEMENT',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT,
                originalMessage: {oldLimit: 0, newLimit: 50000, currency: 'USD'},
                assertion: /auto-pay/i,
            },
            {
                testTitle: 'UPDATE_ADDRESS',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS,
                originalMessage: {newAddress: {addressStreet: '123 Main', city: 'Boston', state: 'MA', zipCode: '02101', country: 'US'}},
                assertion: /Boston/,
            },
            {
                testTitle: 'UPDATE_MANUAL_APPROVAL_THRESHOLD',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD,
                originalMessage: {oldLimit: 10000, newLimit: 50000, currency: 'USD'},
                assertion: /manual approval/i,
            },
            {
                testTitle: 'UPDATE_DEFAULT_TITLE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE,
                originalMessage: {newDefaultTitle: 'Report #{reportNumber}', oldDefaultTitle: 'Report'},
                assertion: /reportNumber/,
            },
            {
                testTitle: 'UPDATE_TIME_RATE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_RATE,
                originalMessage: {newRate: 3500, oldRate: 3000, currency: 'USD'},
                assertion: /hourly rate/i,
            },
            {
                testTitle: 'UPDATE_PROHIBITED_EXPENSES',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES,
                originalMessage: {newProhibitedExpenses: {alcohol: true}, oldProhibitedExpenses: {alcohol: false}},
                assertion: /prohibited/i,
            },
            {
                testTitle: 'UPDATE_APPROVER_RULE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE,
                originalMessage: {field: 'amount', oldApproverEmail: 'old@test.com', newApproverEmail: 'new@test.com', name: 'Rule1', oldApproverName: 'Old', newApproverName: 'New'},
                assertion: /Rule1/,
            },
            {
                testTitle: 'UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT,
                originalMessage: {oldMaxExpenseAmountNoReceipt: 2500, newMaxExpenseAmountNoReceipt: 5000, currency: 'USD'},
                assertion: /receipt required/i,
            },
            {
                testTitle: 'UPDATE_MAX_EXPENSE_AMOUNT',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT,
                originalMessage: {oldMaxExpenseAmount: 100000, newMaxExpenseAmount: 500000, currency: 'USD'},
                assertion: /max expense amount/i,
            },
        ];

        it.each(complexPolicyLogWithRealData)('$testTitle action', async ({actionName, originalMessage, assertion}) => {
            const action = createReportAction(actionName, originalMessage);
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(assertion)).toBeOnTheScreen();
        });

        it('REMOVED_FROM_APPROVAL_CHAIN renders approval workflow message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN, {
                submittersAccountIDs: [ACTOR_ACCOUNT_ID],
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/approval workflow/i)).toBeOnTheScreen();
        });
    });

    describe('Actionable alerts, previews, and remaining action types', () => {
        it('CHANGE_POLICY renders changed workspace message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY, {fromPolicy: 'pA', toPolicy: 'pB'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/changed the workspace/i)).toBeOnTheScreen();
        });

        it('TRAVEL_UPDATE renders via BasicMessage', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE, {
                operation: 'BOOKING_TICKETED',
                start: {date: '2025-07-15', shortName: 'SFO'},
                end: {date: '2025-07-15', shortName: 'LAX'},
                route: {airlineCode: 'UA', number: '100'},
                confirmations: [{value: 'ABC123', name: 'Confirmation'}],
            });
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/SFO/)).toBeOnTheScreen();
        });

        const remainingBranchesWithRealData = [
            {testTitle: 'ADD_CATEGORY', actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY, originalMessage: {categoryName: 'Travel'}, assertion: /Travel/},
            {testTitle: 'UPDATE_TAG_LIST', actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST, originalMessage: {tagListName: 'Projects'}, assertion: /Projects/},
            {
                testTitle: 'UPDATE_TAG_LIST_REQUIRED',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED,
                originalMessage: {tagListsName: 'Projects', isRequired: true},
                assertion: /Projects/,
            },
            {
                testTitle: 'UPDATE_CUSTOM_UNIT_SUB_RATE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_SUB_RATE,
                originalMessage: {customUnitName: 'Distance', customUnitRateName: 'Standard', customUnitSubRateName: 'Toll', updatedField: 'rate', oldValue: '0.10', newValue: '0.15'},
                assertion: /Toll/,
            },
            {
                testTitle: 'DELETE_CUSTOM_UNIT_SUB_RATE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_SUB_RATE,
                originalMessage: {customUnitName: 'Distance', customUnitRateName: 'Standard', removedSubRateName: 'Toll'},
                assertion: /Toll/,
            },
            {
                testTitle: 'UPDATE_FIELD',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD,
                originalMessage: {updatedField: 'preventSelfApproval', newValue: 'true', oldValue: 'false'},
                assertion: /Prevent self-approval/i,
            },
            {
                testTitle: 'UPDATE_REIMBURSER',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER,
                originalMessage: {reimburser: {email: 'reimb@test.com', name: 'Reimb', accountID: 555}, previousReimburser: {email: 'old@test.com', name: 'OldReimb', accountID: 444}},
                assertion: /reimb@test\.com/,
            },
            {
                testTitle: 'UPDATE_REIMBURSEMENT_CHOICE',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_CHOICE,
                originalMessage: {newChoice: 'reimburseYes', oldChoice: 'reimburseNo'},
                assertion: /Direct/,
            },
            {
                testTitle: 'ADD_BUDGET',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_BUDGET,
                originalMessage: {entityType: 'category', categoryName: 'Meals', newValue: {frequency: 'monthly', shared: 100000}},
                assertion: /Meals/,
            },
            {
                testTitle: 'UPDATE_BUDGET',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_BUDGET,
                originalMessage: {entityType: 'category', categoryName: 'Meals', newValue: {frequency: 'monthly', shared: 200000}, oldValue: {frequency: 'monthly', shared: 100000}},
                assertion: /Meals/,
            },
            {
                testTitle: 'DELETE_BUDGET',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_BUDGET,
                originalMessage: {entityType: 'category', categoryName: 'Meals', oldValue: {frequency: 'monthly', shared: 100000}},
                assertion: /Meals/,
            },
            {
                testTitle: 'isActionableCardFraudAlert',
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT,
                originalMessage: {maskedCardNumber: '****1234', triggerMerchant: 'SuspiciousShop', triggerAmount: 5000, currency: 'USD'},
                assertion: /suspicious activity/i,
            },
            {
                testTitle: 'isActionableMentionWhisper',
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER,
                originalMessage: {inviteeAccountIDs: [999], inviteeEmails: ['stranger@test.com']},
                assertion: /isn't a member/i,
            },
            {
                testTitle: 'isCardBrokenConnectionAction',
                actionName: CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN,
                originalMessage: {cardID: 100, cardName: 'My Card'},
                assertion: /My Card/,
            },
            {
                testTitle: 'INDIVIDUAL_BUDGET_NOTIFICATION',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INDIVIDUAL_BUDGET_NOTIFICATION,
                originalMessage: {
                    budgetName: 'Travel',
                    budgetFrequency: 'monthly',
                    budgetAmount: '$1,000',
                    budgetTypeForNotificationMessage: 'category',
                    thresholdPercentage: 80,
                    totalSpend: '$800',
                    unsubmittedSpend: '$200',
                    userEmail: 'user@test.com',
                    awaitingApprovalSpend: '$100',
                    approvedReimbursedClosedSpend: '$500',
                },
                assertion: /Travel/,
            },
            {
                testTitle: 'SHARED_BUDGET_NOTIFICATION',
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SHARED_BUDGET_NOTIFICATION,
                originalMessage: {
                    budgetName: 'Office',
                    budgetFrequency: 'monthly',
                    budgetAmount: '$5,000',
                    budgetTypeForNotificationMessage: 'category',
                    thresholdPercentage: 90,
                    totalSpend: '$4,500',
                    unsubmittedSpend: '$500',
                    awaitingApprovalSpend: '$300',
                    approvedReimbursedClosedSpend: '$3,700',
                },
                assertion: /Office/,
            },
        ];

        it.each(remainingBranchesWithRealData)('$testTitle action', async ({actionName, originalMessage, assertion}) => {
            const action = createReportAction(actionName, originalMessage);
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(assertion)).toBeOnTheScreen();
        });

        // isActionableJoinRequest renders ReportActionItemBasicMessage inside a View wrapper
        it('isActionableJoinRequest renders join request message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/requested to join/i)).toBeOnTheScreen();
        });

        it('isActionableReportMentionWhisper renders message and yes/no buttons', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER, {});
            const messageText = "Heads up, #test5 doesn't exist yet. Do you want to create it?";
            action.message = [{type: 'COMMENT', html: messageText, text: messageText}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/Heads up, #test5 doesn't exist yet/)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('common.yes'))).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('common.no'))).toBeOnTheScreen();
        });

        it('isActionableMentionInviteToSubmitExpenseConfirmWhisper renders message and confirm button', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER, {});
            const messageText = "Great, you chose to invite them to the workspace! I've invited user and they'll submit expenses in their expense chat.";
            action.message = [{type: 'COMMENT', html: messageText, text: messageText}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/Great, you chose to invite them/)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('common.buttonConfirm'))).toBeOnTheScreen();
        });

        it('isCardIssuedAction renders card issued message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/Expensify Card/)).toBeOnTheScreen();
        });

        it('isTaskAction renders task completed message', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED, {});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/marked as complete/i)).toBeOnTheScreen();
        });

        it('isIOURequestReportAction renders TransactionPreview', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}txn123`, {
                    transactionID: 'txn123',
                    amount: 1000,
                    currency: 'USD',
                    merchant: 'TestMerchant',
                    created: '2025-07-12',
                    reportID: 'iouReport1',
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}iouReport1`, {
                    reportID: 'iouReport1',
                    type: CONST.REPORT.TYPE.IOU,
                    chatReportID: 'chatReport1',
                });
            });
            await waitForBatchedUpdatesWithAct();

            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: 'txn123',
                IOUReportID: 'iouReport1',
            });
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={{reportID: 'testReport', chatReportID: 'chatReport1'}}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/TestMerchant/)).toBeOnTheScreen();
        });

        it('isTripPreview renders TripRoomPreview', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW, {linkedReportID: 'tripReport1'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText(translateLocal('iou.viewDetails'))).toBeOnTheScreen();
        });

        it('isCreatedTaskReportAction renders TaskPreview', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {taskReportID: 'task123'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getAllByLabelText(translateLocal('task.task')).length).toBeGreaterThan(0);
        });

        it('REPORT_PREVIEW renders MoneyRequestReportPreview', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, {linkedReportID: 'iouReport1'});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId('MoneyRequestReportPreviewContent-wrapper')).toBeOnTheScreen();
        });

        it('CREATED harvest renders CreateHarvestReportAction via BasicMessage', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.CREATED, {});
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={undefined}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                    reportNameValuePairsOrigin="harvest"
                                    reportNameValuePairsOriginalID="origReport123"
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(/created this report to hold/i)).toBeOnTheScreen();
        });
        it('isWhisperActionTargetedToOthers returns null', async () => {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACTOR_ACCOUNT_ID});
            });
            await waitForBatchedUpdatesWithAct();

            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {whisperedTo: [99999]});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(actorEmail)).not.toBeOnTheScreen();
        });

        it('isTripPreview + isThreadReportParentAction takes early return', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}tripReport1`, {
                    reportID: 'tripReport1',
                    type: CONST.REPORT.TYPE.CHAT,
                });
            });
            await waitForBatchedUpdatesWithAct();

            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW, {linkedReportID: 'tripReport1'});
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <PortalProvider>
                                <PureReportActionItem
                                    personalPolicyID={undefined}
                                    report={undefined}
                                    parentReportAction={undefined}
                                    action={action}
                                    displayAsGroup={false}
                                    shouldDisplayNewMarker={false}
                                    index={0}
                                    isFirstVisibleReportAction={false}
                                    isThreadReportParentAction
                                    taskReport={undefined}
                                    linkedReport={undefined}
                                    iouReportOfLinkedReport={undefined}
                                    currentUserAccountID={ACTOR_ACCOUNT_ID}
                                    betas={undefined}
                                />
                            </PortalProvider>
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('travel.tripSummary'))).toBeOnTheScreen();
        });
    });

    describe('ChatMessageContent moderation and actionable buttons', () => {
        it('flagged message shows "Reveal message" button when moderation decision is hidden', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {});
            action.message = [{type: 'COMMENT', html: 'bad message', text: 'bad message', moderationDecision: {decision: CONST.MODERATION.MODERATOR_DECISION_HIDDEN}}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Reveal message')).toBeOnTheScreen();
        });

        it('clicking "Reveal message" toggles to "Hide message"', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {});
            action.message = [{type: 'COMMENT', html: 'bad message', text: 'bad message', moderationDecision: {decision: CONST.MODERATION.MODERATOR_DECISION_HIDDEN}}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('Reveal message'));
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Hide message')).toBeOnTheScreen();
        });

        it('actionable track expense whisper renders track expense buttons', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER, {
                transactionID: 'tx123',
            });
            action.message = [{type: 'COMMENT', html: 'Track this expense', text: 'Track this expense'}];
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('actionableMentionTrackExpense.submit' as TranslationPaths))).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('actionableMentionTrackExpense.nothing' as TranslationPaths))).toBeOnTheScreen();
        });
    });
});
