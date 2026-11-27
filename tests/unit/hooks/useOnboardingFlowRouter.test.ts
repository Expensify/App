import {renderHook} from '@testing-library/react-native';

import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
            callback();
            return {cancel: jest.fn()};
        }),
    },
}));

const mockNavigate = jest.fn();
let mockActiveRoute = '';
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => {
            mockNavigate(...args);
        },
        getActiveRoute: () => mockActiveRoute,
        isValidateLoginFlow: () => false,
        isNavigationReady: () => Promise.resolve(),
    },
}));

const mockDismissOnboardingModal = jest.fn();
jest.mock('@libs/Navigation/helpers/OnboardingNavigationUtils', () => ({
    __esModule: true,
    default: (afterTransition: () => void) => {
        mockDismissOnboardingModal();
        afterTransition();
    },
}));

const mockSetDisableDismissOnEscape = jest.fn();
jest.mock('@userActions/Modal', () => ({
    setDisableDismissOnEscape: (...args: unknown[]) => {
        mockSetDisableDismissOnEscape(...args);
    },
}));

let mockFocusedRootRouteName: string = NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: <T>(selector: (state: {index: number; routes: Array<{name: string}>}) => T) => selector({index: 0, routes: [{name: mockFocusedRootRouteName}]}),
}));

jest.mock('@hooks/useShouldSuppressPromotionalUI', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => ({initialURL: undefined}),
}));

jest.mock('@libs/Navigation/currentUrl', () => ({
    __esModule: true,
    default: () => '',
}));

jest.mock('@src/CONFIG', () => {
    const actual = jest.requireActual<{default: Record<string, unknown>}>('@src/CONFIG');
    return {__esModule: true, default: {...actual.default, IS_HYBRID_APP: false, SKIP_ONBOARDING: false}};
});

const mockStartOnboardingFlow = jest.fn();
let mockWasCompletedByThisClient = false;
jest.mock('@userActions/Welcome/OnboardingFlow', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Welcome/OnboardingFlow'),
    startOnboardingFlow: (...args: unknown[]) => {
        mockStartOnboardingFlow(...args);
    },
    wasOnboardingCompletedByThisClient: () => mockWasCompletedByThisClient,
}));

async function seedOnyx({hasCompletedGuidedSetupFlow, hasReceivedAppData}: {hasCompletedGuidedSetupFlow: boolean; hasReceivedAppData: boolean}) {
    await Onyx.multiSet({
        [ONYXKEYS.IS_LOADING_APP]: false,
        [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow},
        [ONYXKEYS.NVP_TRY_NEW_DOT]: {},
        [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {},
        [ONYXKEYS.RAM_ONLY_HAS_RECEIVED_APP_DATA]: hasReceivedAppData,
    });
}

describe('useOnboardingFlowRouter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        mockNavigate.mockClear();
        mockDismissOnboardingModal.mockClear();
        mockSetDisableDismissOnEscape.mockClear();
        mockStartOnboardingFlow.mockClear();
        mockActiveRoute = '';
        mockFocusedRootRouteName = NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
        mockWasCompletedByThisClient = false;
    });

    it('does not start onboarding from cached data before this page load has received app data', async () => {
        // Given a cached "not completed" onboarding value left over from an earlier session, before OpenApp or ReconnectApp has answered
        await seedOnyx({hasCompletedGuidedSetupFlow: false, hasReceivedAppData: false});

        // When the router runs
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();

        // Then onboarding does not open, because the cached value may predate a completion made on another device
        expect(mockStartOnboardingFlow).not.toHaveBeenCalled();
    });

    it('starts onboarding once fresh app data says it is not completed', async () => {
        // Given a user whose onboarding is still incomplete
        await seedOnyx({hasCompletedGuidedSetupFlow: false, hasReceivedAppData: false});
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();

        // When this page load's app data arrives
        await Onyx.merge(ONYXKEYS.RAM_ONLY_HAS_RECEIVED_APP_DATA, true);
        await waitForBatchedUpdatesWithAct();

        // Then the onboarding flow starts, so a genuinely new user still sees onboarding
        expect(mockStartOnboardingFlow).toHaveBeenCalledTimes(1);
    });

    it('closes an open onboarding flow when completion arrives from another device or tab', async () => {
        // Given onboarding is open in this client
        mockFocusedRootRouteName = NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR;
        mockActiveRoute = ROUTES.ONBOARDING_PURPOSE.route;
        await seedOnyx({hasCompletedGuidedSetupFlow: false, hasReceivedAppData: true});
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();

        // When another client completes onboarding and the completed value reaches this one
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await waitForBatchedUpdatesWithAct();

        // Then the flow closes the same way a finished onboarding does, so it leaves the back stack and Escape closes other modals again
        expect(mockDismissOnboardingModal).toHaveBeenCalledTimes(1);
        expect(mockSetDisableDismissOnEscape).toHaveBeenCalledWith(false);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('leaves navigation to the caller when this client completed onboarding itself', async () => {
        // Given onboarding is open and this client is the one that sent the completion
        mockFocusedRootRouteName = NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR;
        mockActiveRoute = ROUTES.ONBOARDING_PURPOSE.route;
        mockWasCompletedByThisClient = true;

        // When the completed value arrives
        await seedOnyx({hasCompletedGuidedSetupFlow: true, hasReceivedAppData: true});
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();

        // Then the router does not navigate, so the completion handler's own navigation is the only one
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockDismissOnboardingModal).not.toHaveBeenCalled();
    });

    it('keeps a completed user on the join-workspace task screens', async () => {
        // Given a completed user doing the join-workspace Concierge task inside the onboarding navigator
        mockFocusedRootRouteName = NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR;
        mockActiveRoute = `${ROUTES.ONBOARDING_WORKSPACES.route}?isJoinWorkspaceTask=true`;

        // When the router runs with fresh app data
        await seedOnyx({hasCompletedGuidedSetupFlow: true, hasReceivedAppData: true});
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();

        // Then the user is not sent Home, because those screens are meant for completed users
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockDismissOnboardingModal).not.toHaveBeenCalled();
    });

    it('keeps a completed user on the private domain step of the add work email task', async () => {
        // Given a completed user verifying a newly added work email from the Concierge task
        mockFocusedRootRouteName = NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR;
        mockActiveRoute = ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(undefined, true, '1');

        // When the router runs with fresh app data
        await seedOnyx({hasCompletedGuidedSetupFlow: true, hasReceivedAppData: true});
        renderHook(() => useOnboardingFlowRouter());
        await waitForBatchedUpdatesWithAct();

        // Then the flow stays open so the user can finish verifying the address
        expect(mockDismissOnboardingModal).not.toHaveBeenCalled();
    });
});
