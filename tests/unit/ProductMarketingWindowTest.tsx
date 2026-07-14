import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ProductMarketingWindowManager from '@components/ProductMarketingWindow/ProductMarketingWindowManager';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {dismissProductTraining} from '@libs/actions/Welcome';
import type * as WelcomeActions from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT, getProductMarketingWindowDismissedKey} from '@libs/ProductMarketingWindowUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import en from '@src/languages/en';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'product-marketing-policy';
const USER_EMAIL = 'user@example.com';
const USER_ACCOUNT_ID = 7;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// Keep dismissProductTraining's optimistic Onyx merge (so dismissal behavior is exercised end-to-end) while
// dropping its API call and letting tests assert on the mock.
jest.mock('@libs/actions/Welcome', () => {
    const actual = jest.requireActual<typeof WelcomeActions>('@libs/actions/Welcome');
    return {
        ...actual,
        dismissProductTraining: jest.fn((elementName: string) => {
            const OnyxModule = (require('react-native-onyx') as {default: {merge: (key: string, value: Record<string, unknown>) => Promise<unknown>}}).default;
            const KEYS = (require('@src/ONYXKEYS') as {default: typeof ONYXKEYS}).default;
            OnyxModule.merge(KEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                [elementName]: {timestamp: '2026-07-15 00:00:00.000', dismissedMethod: 'click'},
            });
        }),
    };
});

const announcement = ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT;
if (!announcement) {
    throw new Error('These tests require an active product marketing announcement; update them if the active announcement is removed.');
}
const dismissedKey = getProductMarketingWindowDismissedKey(announcement.announcementID);
const mockDismissProductTraining = jest.mocked(dismissProductTraining);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const memberHeading = en.productMarketingWindow.expensePolicyPdf.member.heading;
const adminHeading = en.productMarketingWindow.expensePolicyPdf.admin.heading;
const memberCtaLabel = en.productMarketingWindow.expensePolicyPdf.member.cta;

function buildAdminPolicy(): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: USER_EMAIL,
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: true,
        employeeList: {
            [USER_EMAIL]: {
                email: USER_EMAIL,
                role: CONST.POLICY.ROLE.ADMIN,
            },
        },
    } as Policy;
}

const renderManager = (topmostRouteName?: string) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
            <ProductMarketingWindowManager topmostRouteName={topmostRouteName} />
        </ComposeProviders>,
    );

async function setupOnyxBaseline({isAdmin}: {isAdmin: boolean}) {
    await Onyx.clear();
    await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [USER_ACCOUNT_ID]: buildPersonalDetails(USER_EMAIL, USER_ACCOUNT_ID, 'User'),
    });
    await Onyx.merge(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
    if (isAdmin) {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildAdminPolicy());
    }
}

describe('ProductMarketingWindowManager', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('shows the member variant for a user without an admin role on any workspace', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(memberHeading)).toBeTruthy();
        expect(screen.getByText(en.productMarketingWindow.expensePolicyPdf.member.body)).toBeTruthy();
        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('shows the admin variant when the user administers at least one active workspace', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(adminHeading)).toBeTruthy();
        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('renders nothing when the active announcement was already dismissed', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                [dismissedKey]: {timestamp: '2026-07-14 00:00:00.000', dismissedMethod: 'x'},
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('still shows the window when only a different announcement was dismissed', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                [getProductMarketingWindowDismissedKey('olderAnnouncement-2026-06')]: {timestamp: '2026-06-14 00:00:00.000', dismissedMethod: 'x'},
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(memberHeading)).toBeTruthy();
    });

    it('renders nothing while the initial app data is still loading', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('renders nothing when the initial app load state was never written, as on a fresh sign-in', async () => {
        await act(async () => {
            // Deliberately do not write IS_LOADING_APP: the manager must treat the never-written key as still loading.
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [USER_ACCOUNT_ID]: buildPersonalDetails(USER_EMAIL, USER_ACCOUNT_ID, 'User'),
            });
            await Onyx.merge(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('renders nothing for anonymous (public room) sessions', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('renders nothing while acting as a copilot, so a delegate cannot dismiss the owner’s announcement', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'copilot@example.com'}});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('hides the window while a covering modal is up and shows it again when the modal clears', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(memberHeading)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true, isPopover: false});
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(memberHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: false});
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.getByText(memberHeading)).toBeTruthy();
    });

    it('does not hide the window for popover modals', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true, isPopover: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(memberHeading)).toBeTruthy();
    });

    it('hides the window while a screen-based centered modal navigator is on top of the root stack', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('shows the window for regular topmost routes', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager(SCREENS.CONCIERGE);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(memberHeading)).toBeTruthy();
    });

    it('records the namespaced dismissal and stays hidden after the Dismiss button is pressed', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(en.common.dismiss));
        await waitForBatchedUpdatesWithAct();

        expect(mockDismissProductTraining).toHaveBeenCalledTimes(1);
        expect(mockDismissProductTraining).toHaveBeenCalledWith(dismissedKey, true);
        expect(mockNavigate).not.toHaveBeenCalled();
        // The optimistic dismissal write unmounts the window, and it stays hidden.
        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('records the dismissal before navigating and stays hidden after the CTA is pressed', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(memberCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockDismissProductTraining).toHaveBeenCalledTimes(1);
        expect(mockDismissProductTraining).toHaveBeenCalledWith(dismissedKey);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(announcement.member.getCtaRoute());

        const dismissCallOrder = mockDismissProductTraining.mock.invocationCallOrder.at(0) ?? Number.NaN;
        const navigateCallOrder = mockNavigate.mock.invocationCallOrder.at(0) ?? Number.NaN;
        expect(dismissCallOrder).toBeLessThan(navigateCallOrder);

        expect(screen.queryByText(memberHeading)).toBeNull();
    });

    it('uses the fixed-width bottom-right card on wide layouts', async () => {
        mockUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false, isSmallScreenWidth: false});
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        const window = screen.getByTestId('ProductMarketingWindow');
        expect(window).toHaveStyle({
            width: variables.productMarketingWindowWidth,
            bottom: variables.productMarketingWindowOffset,
            right: variables.productMarketingWindowOffset,
        });
    });

    it('uses the near-full-width bottom card on narrow layouts', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        const window = screen.getByTestId('ProductMarketingWindow');
        expect(window).toHaveStyle({
            left: variables.productMarketingWindowOffsetNarrow,
            right: variables.productMarketingWindowOffsetNarrow,
        });
    });
});
