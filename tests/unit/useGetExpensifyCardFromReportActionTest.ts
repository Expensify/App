import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {useCardList, useWorkspaceCardList} from '@components/OnyxListItemProvider';
import usePolicy from '@hooks/usePolicy';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getOriginalMessage, isCardIssuedAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import useGetExpensifyCardFromReportAction from '@src/hooks/useGetExpensifyCardFromReportAction';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportAction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock the dependencies
jest.mock('@libs/PolicyUtils');
jest.mock('@libs/ReportActionsUtils');
jest.mock('@components/OnyxListItemProvider', () => ({
    useCardList: jest.fn(),
    useWorkspaceCardList: jest.fn(),
}));
jest.mock('@hooks/usePolicy');

const mockUsePolicy = usePolicy as jest.MockedFunction<typeof usePolicy>;
const mockIsPolicyAdmin = isPolicyAdmin as jest.MockedFunction<typeof isPolicyAdmin>;
const mockGetOriginalMessage = getOriginalMessage as jest.MockedFunction<typeof getOriginalMessage>;
const mockIsCardIssuedAction = isCardIssuedAction as jest.MockedFunction<typeof isCardIssuedAction>;
const mockUseCardList = useCardList as jest.MockedFunction<typeof useCardList>;
const mockUseWorkspaceCardList = useWorkspaceCardList as jest.MockedFunction<typeof useWorkspaceCardList>;

describe('useGetExpensifyCardFromReportAction', () => {
    const mockCard: Card = {
        cardID: 123,
        cardName: 'Test Card',
        cardNumber: '1234567890123456',
        domainName: 'test.com',
        lastUpdated: '2023-01-01T00:00:00.000Z',
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        bank: 'Test Bank',
    };

    const createMockReportAction = (cardID = 123): ReportAction => ({
        reportActionID: '1',
        actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_ADD_PAYMENT_CARD,
        originalMessage: {cardID, assigneeAccountID: 1},
        created: '2023-01-01T00:00:00.000Z',
        actorAccountID: 1,
        person: [],
        shouldShow: true,
        isAttachmentOnly: false,
        isFirstItem: false,
        pendingAction: null,
        errors: undefined,
        message: [],
        reportID: '1',
    });

    const mockPolicy = {
        id: 'policy123',
        name: 'Test Policy',
        role: CONST.POLICY.ROLE.USER,
        type: CONST.POLICY.TYPE.CORPORATE,
        isAttendeeTrackingEnabled: false,
        owner: '1',
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: false,
        workspaceAccountID: 123,
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();

        mockUsePolicy.mockReturnValue(mockPolicy);
        mockIsPolicyAdmin.mockReturnValue(false);
        mockGetOriginalMessage.mockReturnValue({cardID: 123, assigneeAccountID: 1});
        mockIsCardIssuedAction.mockReturnValue(true);
        mockUseCardList.mockReturnValue({});
        mockUseWorkspaceCardList.mockReturnValue({});
    });

    describe('when reportAction is not a card issued action', () => {
        it('returns undefined', async () => {
            mockIsCardIssuedAction.mockReturnValue(false);

            const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(result.current).toBeUndefined();
        });
    });

    describe('when reportAction is a card issued action', () => {
        beforeEach(() => {
            mockIsCardIssuedAction.mockReturnValue(true);
            mockGetOriginalMessage.mockReturnValue({cardID: 123, assigneeAccountID: 1});
        });

        describe('when user is not a policy admin', () => {
            beforeEach(() => {
                mockIsPolicyAdmin.mockReturnValue(false);
            });

            it('returns card from allUserCards when card exists', async () => {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                mockUseCardList.mockReturnValue({'123': mockCard});

                const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
                await waitForBatchedUpdatesWithAct();

                expect(result.current).toEqual(mockCard);
            });

            it('returns undefined when card does not exist in allUserCards', async () => {
                mockUseCardList.mockReturnValue({});

                const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
                await waitForBatchedUpdatesWithAct();

                expect(result.current).toBeUndefined();
            });
        });

        describe('when user is a policy admin', () => {
            beforeEach(() => {
                mockIsPolicyAdmin.mockReturnValue(true);
                // Override the default policy for admin tests
                mockUsePolicy.mockReturnValue({
                    id: 'policy123',
                    name: 'Test Policy',
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    isAttendeeTrackingEnabled: false,
                    owner: '1',
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: false,
                    workspaceAccountID: 123,
                });
            });

            it('returns card from allExpensifyCards when card exists', async () => {
                const workspaceCardsKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}123_${CONST.EXPENSIFY_CARD.BANK}` as OnyxKey;
                // eslint-disable-next-line @typescript-eslint/naming-convention
                mockUseWorkspaceCardList.mockReturnValue({[workspaceCardsKey]: {123: mockCard}});

                const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
                await waitForBatchedUpdatesWithAct();

                expect(result.current).toEqual(mockCard);
            });

            it('returns undefined when card does not exist in allExpensifyCards', async () => {
                const workspaceCardsKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}123_${CONST.EXPENSIFY_CARD.BANK}` as OnyxKey;
                // eslint-disable-next-line @typescript-eslint/naming-convention
                mockUseWorkspaceCardList.mockReturnValue({[workspaceCardsKey]: {}});

                const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
                await waitForBatchedUpdatesWithAct();

                expect(result.current).toBeUndefined();
            });
        });
    });

    describe('reactivity to Onyx changes', () => {
        it('updates when allUserCards changes', async () => {
            mockUseCardList.mockReturnValue({});
            mockUseWorkspaceCardList.mockReturnValue({});

            const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(result.current).toBeUndefined();

            // eslint-disable-next-line @typescript-eslint/naming-convention
            mockUseCardList.mockReturnValue({'123': mockCard});

            // Re-render the hook to get the updated result
            const {result: updatedResult} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(updatedResult.current).toEqual(mockCard);
        });

        it('updates when allExpensifyCards changes for policy admin', async () => {
            mockIsPolicyAdmin.mockReturnValue(true);
            mockUsePolicy.mockReturnValue({
                id: 'policy123',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.CORPORATE,
                isAttendeeTrackingEnabled: false,
                owner: '1',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: false,
                workspaceAccountID: 123,
            });

            // Set initial state
            mockUseCardList.mockReturnValue({});
            mockUseWorkspaceCardList.mockReturnValue({});

            const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(result.current).toBeUndefined();

            const workspaceCardsKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}123_${CONST.EXPENSIFY_CARD.BANK}` as OnyxKey;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            mockUseWorkspaceCardList.mockReturnValue({[workspaceCardsKey]: {123: mockCard}});
            const {result: updatedResult} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(updatedResult.current).toEqual(mockCard);
        });
    });

    describe('policy admin check', () => {
        it('calls isPolicyAdmin with correct policy', async () => {
            const testPolicy = {
                id: 'policy123',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.CORPORATE,
                isAttendeeTrackingEnabled: false,
                owner: '1',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: false,
                workspaceAccountID: 123,
            };
            mockUsePolicy.mockReturnValue(testPolicy);

            // eslint-disable-next-line @typescript-eslint/naming-convention
            mockUseCardList.mockReturnValue({'123': mockCard});

            const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(mockUsePolicy).toHaveBeenCalledWith('policy123');
            expect(mockIsPolicyAdmin).toHaveBeenCalledWith(testPolicy);
            expect(result.current).toEqual(mockCard);
        });
    });

    describe('workspaceAccountID handling', () => {
        it('uses policy workspaceAccountID for building expensify cards key', async () => {
            const policyWithWorkspaceID = {
                ...mockPolicy,
                workspaceAccountID: 456,
            };
            mockUsePolicy.mockReturnValue(policyWithWorkspaceID);
            mockIsPolicyAdmin.mockReturnValue(true);

            const workspaceCardsKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}456_${CONST.EXPENSIFY_CARD.BANK}` as OnyxKey;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            mockUseWorkspaceCardList.mockReturnValue({[workspaceCardsKey]: {123: mockCard}});

            const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(result.current).toEqual(mockCard);
        });

        it('uses DEFAULT_NUMBER_ID when policy has no workspaceAccountID', async () => {
            const policyWithoutWorkspaceID = {
                ...mockPolicy,
                workspaceAccountID: undefined,
            };
            mockUsePolicy.mockReturnValue(policyWithoutWorkspaceID);
            mockIsPolicyAdmin.mockReturnValue(true);

            const workspaceCardsKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${CONST.DEFAULT_NUMBER_ID}_${CONST.EXPENSIFY_CARD.BANK}` as OnyxKey;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            mockUseWorkspaceCardList.mockReturnValue({[workspaceCardsKey]: {123: mockCard}});

            const {result} = renderHook(() => useGetExpensifyCardFromReportAction({reportAction: createMockReportAction(), policyID: 'policy123'}));
            await waitForBatchedUpdatesWithAct();

            expect(result.current).toEqual(mockCard);
        });
    });
});
