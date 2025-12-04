import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isParticipantP2P, shouldAutoNavigateToDefaultWorkspace} from '@pages/iou/request/step/IOURequestStepAmount';
import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';

jest.mock('@components/withCurrentUserPersonalDetails', () => (Component: unknown) => Component);
jest.mock('@pages/iou/request/step/withWritableReportOrNotFound', () => () => (Component: unknown) => Component);
jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => (Component: unknown) => Component);
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@libs/SubscriptionUtils', () => {
    const actual = jest.requireActual<typeof import('@libs/SubscriptionUtils')>('@libs/SubscriptionUtils');

    return {
        ...actual,
        shouldRestrictUserBillableActions: jest.fn(),
    };
});
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn(),
    createNavigationContainerRef: jest.fn(() => ({
        current: null,
        isReady: jest.fn(() => true),
        navigate: jest.fn(),
    })),
}));

describe('IOURequestStepAmount', () => {
    const mockShouldRestrictUserBillableActions = shouldRestrictUserBillableActions as jest.Mock;

    const defaultExpensePolicy: Policy = {
        id: '123',
        name: 'Test Workspace',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'owner@test.com',
        outputCurrency: CONST.CURRENCY.USD,
        isPolicyExpenseChatEnabled: true,
        autoReporting: true,
    };

    const personalPolicy: Policy = {
        id: '456',
        name: 'Personal Policy',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.PERSONAL,
        owner: 'owner@test.com',
        outputCurrency: CONST.CURRENCY.USD,
        isPolicyExpenseChatEnabled: true,
        autoReporting: true,
    };

    beforeEach(() => {
        mockShouldRestrictUserBillableActions.mockReset();
        mockShouldRestrictUserBillableActions.mockReturnValue(false);
    });

    describe('shouldAutoNavigateToDefaultWorkspace', () => {
        it('returns true when both workspace and personal policy have auto reporting enabled', () => {
            const shouldNavigate = shouldAutoNavigateToDefaultWorkspace(CONST.IOU.TYPE.CREATE, defaultExpensePolicy, personalPolicy);

            expect(shouldNavigate).toBe(true);
        });

        it('returns false when personal policy auto reporting is disabled', () => {
            const shouldNavigate = shouldAutoNavigateToDefaultWorkspace(CONST.IOU.TYPE.CREATE, defaultExpensePolicy, {
                ...personalPolicy,
                autoReporting: false,
            });

            expect(shouldNavigate).toBe(false);
        });
    });

    describe('isParticipantP2P', () => {
        it('should return true for P2P participant with accountID and isPolicyExpenseChat false', () => {
            const participant = {
                accountID: 123,
                isPolicyExpenseChat: false,
            };

            expect(isParticipantP2P(participant)).toBe(true);
        });

        it('should return false when participant is undefined', () => {
            expect(isParticipantP2P(undefined)).toBe(false);
        });

        it('should return false when participant has no accountID', () => {
            const participant = {
                isPolicyExpenseChat: false,
            };

            expect(isParticipantP2P(participant)).toBe(false);
        });

        it('should return false when participant is a policy expense chat', () => {
            const participant = {
                accountID: 123,
                isPolicyExpenseChat: true,
            };

            expect(isParticipantP2P(participant)).toBe(false);
        });

        it('should return false when accountID is 0', () => {
            const participant = {
                accountID: 0,
                isPolicyExpenseChat: false,
            };

            expect(isParticipantP2P(participant)).toBe(false);
        });

        it('should return true for P2P participant without isPolicyExpenseChat property', () => {
            const participant = {
                accountID: 456,
            };

            expect(isParticipantP2P(participant)).toBe(true);
        });
    });
});
