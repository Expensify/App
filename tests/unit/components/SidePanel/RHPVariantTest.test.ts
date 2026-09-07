import SidePanelActions from '@libs/actions/SidePanel';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {OnboardingRHPVariant} from '@src/types/onyx';

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

const {handleRHPVariantNavigation, shouldOpenRHPVariant} = jest.requireActual<typeof RHPVariantTest>('../../../../src/components/SidePanel/RHPVariantTest/index.ts');

describe('shouldOpenRHPVariant', () => {
    it('opens the side panel for the rhpHomePage variant at any company size', () => {
        expect(shouldOpenRHPVariant(CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE)).toBe(true);
    });

    it('opens the side panel for the trackExpensesWithConcierge variant', () => {
        expect(shouldOpenRHPVariant(CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE)).toBe(true);
    });

    it('does not open the side panel for the inboxAdminsBespoke variant, which lands in the #admins room instead', () => {
        expect(shouldOpenRHPVariant(CONST.ONBOARDING_RHP_VARIANT.INBOX_ADMINS_BESPOKE)).toBe(false);
    });

    // control, rhpConciergeDm, and rhpAdminsRoom are retired arms. Accounts still hold these values,
    // so they must fall through to the default post-onboarding navigation rather than open the panel.
    it.each<OnboardingRHPVariant>(['control', CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM, CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM])(
        'does not open the side panel for the retired %s variant',
        (variant) => {
            expect(shouldOpenRHPVariant(variant)).toBe(false);
        },
    );
});

describe('handleRHPVariantNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
    });

    it('preserves the topmost report for the rhpHomePage variant', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(true);
    });

    it('navigates home for the rhpHomePage variant when no report is topmost', () => {
        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(true);
    });

    it('preserves the topmost report for the trackExpensesWithConcierge variant and opens the side panel on top of it', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE);

        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(true);
    });

    it('navigates home for the trackExpensesWithConcierge variant when no report is topmost', () => {
        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(true);
    });
});
