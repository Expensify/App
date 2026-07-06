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

    it('preserves the topmost report for the rhpHomePage variant', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(true);
    });

    it('navigates home for the rhpHomePage variant when no report is topmost', () => {
        handleRHPVariantNavigation('policyID', CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME);
        expect(SidePanelActions.openSidePanel).toHaveBeenCalledWith(true);
    });
});
