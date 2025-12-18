import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {useAddNewCardNavigation, useAssignCardNavigation} from '@pages/workspace/companyCards/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock Navigation
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

// Mock usePermissions hook
const mockIsBetaEnabled = jest.fn();
jest.mock('@hooks/usePermissions', () =>
    jest.fn(() => ({
        isBetaEnabled: mockIsBetaEnabled,
    })),
);

const POLICY_ID = 'test-policy-id';
const FEED = 'cdf';

describe('useAssignCardNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear();
    });

    it('should not navigate when step has not changed', async () => {
        const currentStep = CONST.COMPANY_CARD.STEP.ASSIGNEE;
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, FEED, false));

        // Wait for effects to run
        await waitForBatchedUpdates();

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to ASSIGNEE step when step changes', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.CARD,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, FEED, false));

        // Change the step
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute(POLICY_ID, FEED));
    });

    it('should navigate to CARD step when step changes', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, FEED, false));

        // Change the step
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                currentStep: CONST.COMPANY_CARD.STEP.CARD,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_SELECT.getRoute(POLICY_ID, FEED));
    });

    it('should navigate to CONFIRMATION step with backTo parameter', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, FEED, false));

        // Change the step
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.getRoute(POLICY_ID, FEED));
    });

    it('should navigate to BANK_CONNECTION step', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, FEED, false));

        // Change the step
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(POLICY_ID, FEED, ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(POLICY_ID, FEED)),
        );
    });

    it('should navigate to PLAID_CONNECTION step', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, FEED, false));

        // Change the step
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                currentStep: CONST.COMPANY_CARD.STEP.PLAID_CONNECTION,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_PLAID_CONNECTION.getRoute(POLICY_ID, FEED));
    });

    it('should navigate immediately when isStartStep is true', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, FEED, true));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute(POLICY_ID, FEED));
    });

    it('should not navigate when policyID is undefined', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(undefined, FEED, true));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when feed is undefined', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {email: 'test@example.com'},
        });

        renderHook(() => useAssignCardNavigation(POLICY_ID, undefined, true));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});

describe('useAddNewCardNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsBetaEnabled.mockReturnValue(false);
        return Onyx.clear();
    });

    it('should not navigate when step has not changed', async () => {
        const currentStep = CONST.COMPANY_CARDS.STEP.SELECT_BANK;
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep,
            data: {selectedBank: 'Stripe'},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to SELECT_BANK step by default when PLAID beta is disabled', async () => {
        mockIsBetaEnabled.mockReturnValue(false);

        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: undefined,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, true));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_BANK.getRoute(POLICY_ID));
    });

    it('should navigate to SELECT_COUNTRY step by default when PLAID beta is enabled', async () => {
        mockIsBetaEnabled.mockReturnValue(true);

        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: undefined,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, true));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_COUNTRY.getRoute(POLICY_ID));
    });

    it('should navigate to SELECT_COUNTRY step when step changes', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_BANK,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.SELECT_COUNTRY,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_COUNTRY.getRoute(POLICY_ID));
    });

    it('should navigate to SELECT_BANK step when step changes', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_COUNTRY,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.SELECT_BANK,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_BANK.getRoute(POLICY_ID));
    });

    it('should navigate to SELECT_FEED_TYPE step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_COUNTRY,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_FEED_TYPE.getRoute(POLICY_ID));
    });

    it('should navigate to CARD_TYPE step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_BANK,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.CARD_TYPE,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_TYPE.getRoute(POLICY_ID));
    });

    it('should navigate to BANK_CONNECTION step with selected bank', async () => {
        const selectedBank = 'Stripe';
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.CARD_TYPE,
            data: {selectedBank},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.BANK_CONNECTION,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(POLICY_ID, selectedBank, ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(POLICY_ID)),
        );
    });

    it('should navigate to CARD_INSTRUCTIONS step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.CARD_TYPE,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_INSTRUCTIONS.getRoute(POLICY_ID));
    });

    it('should navigate to CARD_NAME step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.CARD_NAME,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_NAME.getRoute(POLICY_ID));
    });

    it('should navigate to CARD_DETAILS step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.CARD_NAME,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.CARD_DETAILS,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_DETAILS.getRoute(POLICY_ID));
    });

    it('should navigate to AMEX_CUSTOM_FEED step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_BANK,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_AMEX_CUSTOM_FEED.getRoute(POLICY_ID));
    });

    it('should navigate to PLAID_CONNECTION step with selected bank', async () => {
        const selectedBank = 'Chase';
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE,
            data: {selectedBank},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_PLAID_CONNECTION.getRoute(POLICY_ID, selectedBank));
    });

    it('should navigate to SELECT_STATEMENT_CLOSE_DATE step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.CARD_DETAILS,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.SELECT_STATEMENT_CLOSE_DATE,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_STATEMENT_CLOSE_DATE.getRoute(POLICY_ID));
    });

    it('should navigate to SELECT_DIRECT_STATEMENT_CLOSE_DATE step', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.CARD_DETAILS,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, false));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
                currentStep: CONST.COMPANY_CARDS.STEP.SELECT_DIRECT_STATEMENT_CLOSE_DATE,
            });
        });

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_DIRECT_STATEMENT_CLOSE_DATE.getRoute(POLICY_ID));
    });

    it('should navigate immediately when isStartStep is true', async () => {
        mockIsBetaEnabled.mockReturnValue(false);

        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_BANK,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(POLICY_ID, true));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_BANK.getRoute(POLICY_ID));
    });

    it('should not navigate when policyID is undefined', async () => {
        await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
            currentStep: CONST.COMPANY_CARDS.STEP.SELECT_BANK,
            data: {},
        });

        renderHook(() => useAddNewCardNavigation(undefined, true));

        await waitForBatchedUpdates();

        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
