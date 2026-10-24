import SidePanelActions from '@libs/actions/SidePanel';
import {setOnboardingRHPVariant} from '@libs/actions/Welcome';
import {navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: jest.fn((options?: {afterTransition?: () => void}) => options?.afterTransition?.()),
        navigate: jest.fn(),
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
    },
}));

jest.mock('@libs/actions/SidePanel', () => ({
    __esModule: true,
    default: {openSidePanel: jest.fn()},
}));

jest.mock('@libs/actions/Welcome', () => ({
    setOnboardingRHPVariant: jest.fn(),
}));

jest.mock('@libs/actions/Modal', () => ({
    setDisableDismissOnEscape: jest.fn(),
}));

const navigationMock = jest.mocked(Navigation);

describe('navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to HOME without opening the side panel when policyID is missing', () => {
        navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(undefined);

        expect(navigationMock.dismissModal).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledWith(ROUTES.HOME);
        // Without a workspace there is no #admins room to surface in the side panel.
        expect(setOnboardingRHPVariant).not.toHaveBeenCalled();
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
    });

    it('navigates to Spend > Expenses with the expanded side panel when not using narrow layout', () => {
        navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue('test-policy-id', false);

        expect(navigationMock.dismissModal).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}),
        );
        // The side panel shows the #admins room, where the Submit welcome and its suggested responses are posted.
        expect(setOnboardingRHPVariant).toHaveBeenCalledWith(CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM);
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(true);
    });

    it('navigates to Spend > Expenses with the collapsed side panel when using narrow layout', () => {
        navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue('test-policy-id', true);

        expect(navigationMock.dismissModal).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledTimes(1);
        expect(navigationMock.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}),
        );
        expect(setOnboardingRHPVariant).toHaveBeenCalledWith(CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM);
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(false);
    });

    it.each([false, true])('navigates to Spend > Expenses without opening the side panel for onboarding exits (narrow layout: %s)', (shouldUseNarrowLayout) => {
        // Given an onboarding exit that creates or joins a Submit workspace, where Home's Getting started is the only onboarding

        // When an onboarding caller asks it not to open the side panel
        navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue('test-policy-id', shouldUseNarrowLayout, false);

        // Then it still lands on Spend > Expenses and stores the rhpAdminsRoom variant, so admins who open the side panel later see #admins,
        // but the side panel isn't opened on any layout
        expect(navigationMock.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}),
        );
        expect(setOnboardingRHPVariant).toHaveBeenCalledWith(CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM);
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
    });
});
