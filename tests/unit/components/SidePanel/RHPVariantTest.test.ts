import SidePanelActions from '@libs/actions/SidePanel';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type * as RHPVariantTest from '../../../../src/components/SidePanel/RHPVariantTest/index';

const mockIsReportTopmostSplitNavigator = jest.fn(() => false);

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(() => false),
        shouldUseStaging: jest.fn(),
        closeReactNativeApp: jest.fn(),
        completeOnboarding: jest.fn(),
        switchAccount: jest.fn(),
        sendAuthToken: jest.fn(),
        getHybridAppSettings: jest.fn(() => Promise.resolve(null)),
        getInitialURL: jest.fn(() => Promise.resolve(null)),
        onURLListenerAdded: jest.fn(),
        signInToOldDot: jest.fn(),
        signOutFromOldDot: jest.fn(),
        startSignOut: jest.fn(),
        cancelSignOut: jest.fn(),
        clearOldDotAfterSignOut: jest.fn(),
    },
}));

jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        connectWithoutView: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => ({
    __esModule: true,
    default: () => mockIsReportTopmostSplitNavigator(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/actions/SidePanel', () => ({
    __esModule: true,
    default: {
        openSidePanel: jest.fn(),
    },
}));

const {handleRHPVariantNavigation} = jest.requireActual<typeof RHPVariantTest>('../../../../src/components/SidePanel/RHPVariantTest/index.ts');

describe('handleRHPVariantNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
    });

    it('preserves the topmost report for the rhpHomePage variant without opening the side panel', () => {
        // Given an account that still has the retired rhpHomePage arm and already shows a report
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        // When onboarding finishes
        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        // Then the report stays on screen, and the side panel stays closed because onboarding should only happen on Home
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
    });

    it('navigates home for the rhpHomePage variant when no report is topmost, without opening the side panel', () => {
        // Given an account that still has the retired rhpHomePage arm and no report on screen

        // When onboarding finishes
        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        // Then it keeps landing on Home, but without a second onboarding chat in the side panel
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
        expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
    });

    it.each([CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM, CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM])(
        'navigates to the workspace overview for the retired %s variant without opening the side panel',
        (variant) => {
            // Given an account that still has one of the retired arms that used to show the side panel next to the workspace

            // When onboarding finishes
            handleRHPVariantNavigation('policyID', variant);

            // Then it keeps landing on the workspace overview, but the side panel stays closed
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_OVERVIEW.getRoute('policyID'), undefined);
            expect(SidePanelActions.openSidePanel).not.toHaveBeenCalled();
        },
    );
});
