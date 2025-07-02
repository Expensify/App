import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import FloatingActionButtonAndPopover from '@pages/home/sidebar/FloatingActionButtonAndPopover';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Mock all the required modules
jest.mock('@libs/interceptAnonymousUser', () => (fn: () => void) => fn());
jest.mock('@libs/Navigation/navigateAfterInteraction', () => (fn: () => void) => fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => '/'),
    setNavigationActionToMicrotaskQueue: jest.fn((fn: () => void) => fn()),
}));
jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
}));
jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => 'mockReportID'),
    startNewChat: jest.fn(),
}));
jest.mock('@libs/actions/Link', () => ({
    openOldDotLink: jest.fn(),
    openTravelDotLink: jest.fn(),
}));
jest.mock('@libs/actions/Session', () => ({
    closeReactNativeApp: jest.fn(),
    isAnonymousUser: jest.fn(() => false),
}));
jest.mock('@libs/actions/Task', () => ({
    completeTestDriveTask: jest.fn(),
}));
jest.mock('@libs/actions/QuickActionNavigation', () => ({
    navigateToQuickAction: jest.fn(),
}));

// Mock react-navigation hooks
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        useIsFocused: () => true,
        useNavigationState: () => {},
        useFocusEffect: jest.fn(),
    };
});

// Mock other hooks
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({
    accountID: 1,
    login: 'test@test.com',
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: jest.fn((key: string) => {
        const translations: Record<string, string> = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'testDrive.quickAction.takeATwoMinuteTestDrive': 'Take a Two Minute Test Drive',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'workspace.new.newWorkspace': 'New workspace',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'iou.createExpense': 'Create expense',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'sidebarScreen.fabNewChat': 'New chat',
        };
        return translations[key] || key;
    }),
}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePermissions', () => () => ({
    isBlockedFromSpotnanaTravel: false,
    isBetaEnabled: jest.fn(() => false),
}));
jest.mock('@hooks/usePrevious', () => () => false);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useTheme', () => () => ({
    icon: '#000',
    success: '#00ff00',
    buttonDefaultBG: '#ffffff',
    textLight: '#ffffff',
}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    flexGrow1: {flexGrow: 1},
    justifyContentCenter: {justifyContent: 'center'},
    alignItemsCenter: {alignItems: 'center'},
    pt3: {paddingTop: 12},
    pb2: {paddingBottom: 8},
    popoverIconCircle: {},
    createMenuPositionSidebar: () => ({top: 100, left: 100}),
    h100: {height: '100%'},
    navigationTabBarItem: {},
    floatingActionButton: {borderRadius: 28},
    floatingActionButtonSmall: {},
    offlineFeedback: {
        default: {},
        pending: {},
        deleted: {},
    },
    userSelectNone: {},
}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowHeight: 800}));

// Mock utility functions
jest.mock('@libs/PolicyUtils', () => ({
    areAllGroupPoliciesExpenseChatDisabled: jest.fn(() => false),
    canSendInvoice: jest.fn(() => false),
    getGroupPaidPoliciesWithExpenseChatEnabled: jest.fn(() => []),
    isPaidGroupPolicy: jest.fn(() => false),
    shouldShowPolicy: jest.fn(() => true),
}));

jest.mock('@libs/ReportUtils', () => ({
    generateReportID: jest.fn(() => 'mockReportID'),
    getDisplayNameForParticipant: jest.fn(() => 'Test User'),
    getIcons: jest.fn(() => []),
    getReportName: jest.fn(() => 'Test Report'),
    getWorkspaceChats: jest.fn(() => []),
    isArchivedReport: jest.fn(() => false),
    isPolicyExpenseChat: jest.fn(() => false),
    getAllPolicyReports: jest.fn(() => []),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldRestrictUserBillableActions: jest.fn(() => false),
}));

jest.mock('@libs/QuickActionUtils', () => ({
    getQuickActionIcon: jest.fn(() => 'mockIcon'),
    getQuickActionTitle: jest.fn(() => 'mockTitle'),
    isQuickActionAllowed: jest.fn(() => true),
}));

jest.mock('@libs/getIconForAction', () => jest.fn(() => 'mockIcon'));

jest.mock('@libs/Navigation/navigationRef', () => ({current: null}));

jest.mock('@libs/ReportActionComposeFocusManager', () => ({}));

jest.mock('@hooks/useIsResizing', () => () => false);

jest.mock('@hooks/useRootNavigationState', () => jest.fn(() => null));

jest.mock('@navigation/helpers/useIsHomeRouteActive', () => jest.fn(() => false));

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: jest.fn(() => ({
        renderProductTrainingTooltip: jest.fn(),
        shouldShowProductTrainingTooltip: false,
        hideProductTrainingTooltip: jest.fn(),
    })),
}));

jest.mock('@src/utils/mapOnyxCollectionItems', () => (collection: unknown, selector: (item: unknown) => unknown) => {
    if (!collection || typeof collection !== 'object') {
        return {};
    }
    return Object.fromEntries(Object.entries(collection).map(([key, value]) => [key, selector(value)]));
});

describe('FloatingActionButtonAndPopover', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {
                accountID: 1,
                email: 'test@test.com',
            },
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.NVP_ONBOARDING]: {
                selfTourViewed: false, // User has not seen the tour
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL,
            },
            [ONYXKEYS.COLLECTION.POLICY]: {
                [`${ONYXKEYS.COLLECTION.POLICY}1`]: {
                    id: `${ONYXKEYS.COLLECTION.POLICY}1`,
                    name: 'Test Policy',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.ADMIN,
                    isPolicyExpenseChatEnabled: true,
                },
            },
        });

        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should not show "Take a Two Minute Test Drive" menu item when shouldShowNewWorkspaceButton is true', async () => {
        jest.spyOn(PolicyUtils, 'shouldShowPolicy').mockReturnValue(false);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
            id: 'policy1',
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            isPolicyExpenseChatEnabled: false,
            pendingAction: null,
            avatarURL: '',
            areInvoicesEnabled: false,
        });

        await waitForBatchedUpdates();

        render(<FloatingActionButtonAndPopover isTooltipAllowed={false} />);

        // Open the floating action button menu
        const fab = screen.getByTestId('floating-action-button');
        fireEvent.press(fab);

        await waitForBatchedUpdates();

        expect(screen.queryByText('Take a Two Minute Test Drive')).toBeNull();

        expect(screen.getByText('New workspace')).toBeTruthy();

        // Reset the mock for other tests
        jest.spyOn(PolicyUtils, 'shouldShowPolicy').mockReturnValue(true);
    });

    it('should show "Take a Two Minute Test Drive" menu item when shouldShowNewWorkspaceButton is false', async () => {
        jest.spyOn(PolicyUtils, 'shouldShowPolicy').mockReturnValue(true);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
            id: 'policy1',
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            isPolicyExpenseChatEnabled: true,
            pendingAction: null,
            avatarURL: '',
            areInvoicesEnabled: false,
        });

        await waitForBatchedUpdates();

        render(<FloatingActionButtonAndPopover isTooltipAllowed={false} />);

        // Open the floating action button menu
        const fab = screen.getByTestId('floating-action-button');
        fireEvent.press(fab);

        await waitForBatchedUpdates();

        expect(screen.getByText('Take a Two Minute Test Drive')).toBeTruthy();

        expect(screen.queryByText('New workspace')).toBeNull();

        // Reset the mock for other tests
        jest.spyOn(PolicyUtils, 'shouldShowPolicy').mockReturnValue(false);
    });

    it('should not show "Take a Two Minute Test Drive" menu item when user has seen the tour', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.NVP_ONBOARDING]: {
                selfTourViewed: true,
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL,
            },
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
            id: 'policy1',
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            isPolicyExpenseChatEnabled: true,
            pendingAction: null,
            avatarURL: '',
            areInvoicesEnabled: false,
        });

        jest.spyOn(PolicyUtils, 'shouldShowPolicy').mockReturnValue(true);

        await waitForBatchedUpdates();

        render(<FloatingActionButtonAndPopover isTooltipAllowed={false} />);

        // Open the floating action button menu
        const fab = screen.getByTestId('floating-action-button');
        fireEvent.press(fab);

        await waitForBatchedUpdates();

        expect(screen.queryByText('Take a Two Minute Test Drive')).toBeNull();

        // Reset the mock for other tests
        jest.spyOn(PolicyUtils, 'shouldShowPolicy').mockReturnValue(false);
    });
});
