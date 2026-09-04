import {act, fireEvent, render, screen} from '@testing-library/react-native';

import August2026PromoAdminsImage from '@assets/images/august2026-promo-admins.png';
import August2026PromoEmployeesImage from '@assets/images/august2026-promo-employees.png';

import ActivityIndicator from '@components/ActivityIndicator';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import Image from '@components/Image';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ProductMarketingWindowManager from '@components/ProductMarketingWindow/ProductMarketingWindowManager';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import {dismissMarketingWindow} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT} from '@libs/ProductMarketingWindowUtils';

import colors from '@styles/theme/colors';
import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import en from '@src/languages/en';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'product-marketing-policy';
const SECOND_POLICY_ID = 'second-product-marketing-policy';
const USER_EMAIL = 'user@example.com';
const USER_ACCOUNT_ID = 7;
const OLDER_UPDATE_KEY = 'productUpdateJuly2026';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn());

jest.mock('@libs/actions/PolicyConnections', () => ({
    openPolicyAccountingPage: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// The manager derives whether the 2FA setup flow is focused from the root navigation state, which the bare
// NavigationContainer below never populates. These tests cover the other visibility conditions, so the flag stays false.
jest.mock('@hooks/useRootNavigationState', () => jest.fn(() => false));

// Keep setNameValuePair's optimistic Onyx merge (so persistence behavior is exercised end-to-end) while
// dropping its API call and letting tests assert that the previous value is supplied for failure rollback.
jest.mock('@libs/actions/User', () => {
    const onyxKeys = jest.requireActual<{default: typeof ONYXKEYS}>('@src/ONYXKEYS').default;

    return {
        dismissMarketingWindow: jest.fn((updateKey: string) => {
            const OnyxModule = jest.requireActual<{default: typeof Onyx}>('react-native-onyx').default;
            OnyxModule.merge(onyxKeys.NVP_LAST_DISMISSED_MARKETING_WINDOW, updateKey);
        }),
    };
});

const announcement = ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT;
if (!announcement) {
    throw new Error('These tests require an active product marketing announcement; update them if the active announcement is removed.');
}
const mockDismissMarketingWindow = jest.mocked(dismissMarketingWindow);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockOpenPolicyAccountingPage = jest.mocked(openPolicyAccountingPage);
const mockUseNetwork = jest.mocked(useNetwork);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseSafeAreaPaddings = jest.mocked(useSafeAreaPaddings);

const adminHeading = en.productMarketingWindow.roleTypes.admin.heading;
const adminBody = en.productMarketingWindow.roleTypes.admin.body;
const adminCtaLabel = en.productMarketingWindow.roleTypes.admin.cta;
const memberHeading = en.productMarketingWindow.roleTypes.member.heading;
const memberBody = en.productMarketingWindow.roleTypes.member.body;
const memberCtaLabel = en.productMarketingWindow.roleTypes.member.cta;

function buildAdminPolicy(policyID = POLICY_ID): Policy {
    return {
        id: policyID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: USER_EMAIL,
        outputCurrency: 'USD',
        employeeList: {
            [USER_EMAIL]: {
                email: USER_EMAIL,
                role: CONST.POLICY.ROLE.ADMIN,
            },
        },
    } as Policy;
}

function buildVendorEnabledAdminPolicy(policyID = POLICY_ID): Policy {
    return {
        ...buildAdminPolicy(policyID),
        areConnectionsEnabled: true,
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {
                    nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                },
            },
        }),
    };
}

const renderManager = (topmostRouteName?: string, theme: ThemePreferenceWithoutSystem = CONST.THEME.LIGHT) =>
    render(
        <NavigationContainer>
            <ThemeProvider theme={theme}>
                <ThemeStylesProvider>
                    <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                        <ProductMarketingWindowManager topmostRouteName={topmostRouteName} />
                    </ComposeProviders>
                </ThemeStylesProvider>
            </ThemeProvider>
        </NavigationContainer>,
    );

async function setupOnyxBaseline({isAdmin, activePolicyID = POLICY_ID, initializeBetas = true}: {isAdmin: boolean; activePolicyID?: string; initializeBetas?: boolean}) {
    await Onyx.clear();
    await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [USER_ACCOUNT_ID]: buildPersonalDetails(USER_EMAIL, USER_ACCOUNT_ID, 'User'),
    });
    await Onyx.merge(ONYXKEYS.SESSION, {
        email: USER_EMAIL,
        accountID: USER_ACCOUNT_ID,
    });
    if (initializeBetas) {
        await Onyx.set(ONYXKEYS.BETAS, []);
    }
    if (isAdmin) {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildAdminPolicy());
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, activePolicyID);
    }
}

describe('ProductMarketingWindowManager', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUseResponsiveLayout.mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
        });
        mockUseSafeAreaPaddings.mockReturnValue({
            paddingTop: 0,
            paddingBottom: 0,
            unmodifiedPaddings: {},
            insets: {top: 0, right: 0, bottom: 0, left: 0},
            safeAreaPaddingBottomStyle: {paddingBottom: 0},
        });
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
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CUSTOM_AGENT]);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(memberHeading)).toBeTruthy();
        expect(screen.getByText(memberBody)).toBeTruthy();
        expect(screen.UNSAFE_getByType(Image).props.source).toBe(August2026PromoEmployeesImage);
    });

    it('does not show the member variant until the Custom Agent beta is available', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false, initializeBetas: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(memberHeading)).toBeNull();

        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CUSTOM_AGENT]);
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.getByText(memberHeading)).toBeTruthy();
    });

    it('shows the admin variant when the user administers at least one active workspace', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(adminHeading)).toBeTruthy();
        expect(screen.getByText(adminBody)).toBeTruthy();
        expect(screen.UNSAFE_getByType(Image).props.source).toBe(August2026PromoAdminsImage);
    });

    it('shows a loading spinner until the promotional image finishes loading', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        const image = screen.UNSAFE_getByType(Image);
        expect(screen.getByTestId('ProductMarketingWindowImageLoading')).toBeTruthy();
        expect(screen.UNSAFE_getByType(ActivityIndicator).props.color).toBe(colors.productDark900);

        fireEvent(image, 'onLoadEnd');
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('ProductMarketingWindowImageLoading')).toBeNull();
        expect(screen.UNSAFE_getByType(Image).props.source).toBe(August2026PromoAdminsImage);

        fireEvent(image, 'onLoadStart');
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('ProductMarketingWindowImageLoading')).toBeTruthy();

        fireEvent(image, 'onLoadEnd');
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('ProductMarketingWindowImageLoading')).toBeNull();
    });

    it('renders nothing on startup when the active update key was already dismissed', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.set(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, announcement.updateKey);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('still shows the window on startup when the last dismissed key belongs to an older update', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.set(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, OLDER_UPDATE_KEY);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('renders nothing while the initial app data is still loading', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('renders nothing when the initial app load state was never written, as on a fresh sign-in', async () => {
        await act(async () => {
            // Deliberately do not write IS_LOADING_APP: the manager must treat the never-written key as still loading.
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [USER_ACCOUNT_ID]: buildPersonalDetails(USER_EMAIL, USER_ACCOUNT_ID, 'User'),
            });
            await Onyx.merge(ONYXKEYS.SESSION, {
                email: USER_EMAIL,
                accountID: USER_ACCOUNT_ID,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildAdminPolicy());
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('renders nothing for anonymous (public room) sessions', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.merge(ONYXKEYS.SESSION, {
                authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('renders nothing while acting as a copilot, so a delegate cannot dismiss the owner’s announcement', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                delegatedAccess: {delegate: 'copilot@example.com'},
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('hides the window for a centered covering modal through closing and shows it again after final hide', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.set(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, OLDER_UPDATE_KEY);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(adminHeading)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: true,
                isPopover: false,
            });
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: true,
                type: CONST.MODAL.MODAL_TYPE.CONFIRM,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: false,
                isPopover: false,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: false,
                type: null,
            });
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, false);
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('does not hide the window for ordinary popover modals', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: true,
                isPopover: true,
            });
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, false);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(adminHeading)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: true,
                type: CONST.MODAL.MODAL_TYPE.POPOVER,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.getByText(adminHeading)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: false,
                isPopover: false,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('does not hide the window for a responsive bottom-docked popover during pre-show, visible, or closing states', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: true,
                isVisible: false,
                type: CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED,
                isPopover: true,
            });
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, false);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(adminHeading)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {isVisible: true});
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.getByText(adminHeading)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: false,
                isPopover: false,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('hides the window for an opted-in bottom-docked confirmation through closing and restores it after final hide', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(adminHeading)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: true,
                isVisible: false,
                isPopover: true,
            });
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: true,
                type: CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                willAlertModalBecomeVisible: false,
                isPopover: false,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: false,
                type: null,
            });
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED, false);
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('does not hide the window for route-backed right-docked navigation state', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: true,
                type: CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('hides the window while a screen-based centered modal navigator is on top of the root stack', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager(NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('shows the window for regular topmost routes', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager(SCREENS.CONCIERGE);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('stores the current update key and stays hidden across a remount after Dismiss is pressed', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        const {unmount} = renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(en.common.dismiss));
        await waitForBatchedUpdatesWithAct();

        expect(mockDismissMarketingWindow).toHaveBeenCalledTimes(1);
        expect(mockDismissMarketingWindow).toHaveBeenCalledWith(announcement.updateKey);
        expect(mockNavigate).not.toHaveBeenCalled();
        // The optimistic NVP write hides the window immediately.
        expect(screen.queryByText(adminHeading)).toBeNull();

        unmount();
        renderManager();
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('stores the current update key before navigating after the CTA is pressed', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockDismissMarketingWindow).toHaveBeenCalledTimes(1);
        expect(mockDismissMarketingWindow).toHaveBeenCalledWith(announcement.updateKey);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(POLICY_ID));

        const dismissCallOrder = mockDismissMarketingWindow.mock.invocationCallOrder.at(0) ?? Number.NaN;
        const navigateCallOrder = mockNavigate.mock.invocationCallOrder.at(0) ?? Number.NaN;
        expect(dismissCallOrder).toBeLessThan(navigateCallOrder);

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('routes an enabled Vendors CTA to the active admin workspace', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildVendorEnabledAdminPolicy());
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_VENDORS.getRoute(POLICY_ID));
    });

    it('routes the CTA to the active admin workspace when the user administers multiple workspaces', async () => {
        await act(async () => {
            await setupOnyxBaseline({
                isAdmin: true,
                activePolicyID: SECOND_POLICY_ID,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, buildAdminPolicy(SECOND_POLICY_ID));
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(SECOND_POLICY_ID));
    });

    it('waits for fallback workspace connections, then uses the hydrated Vendors route', async () => {
        await act(async () => {
            await setupOnyxBaseline({
                isAdmin: true,
                activePolicyID: 'non-admin-policy',
            });
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                ...buildAdminPolicy(),
                areConnectionsEnabled: true,
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenPolicyAccountingPage).toHaveBeenCalledWith(POLICY_ID);
        expect(screen.getByText(adminCtaLabel)).toBeDisabled();
        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();
        expect(mockNavigate).not.toHaveBeenCalled();

        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildVendorEnabledAdminPolicy());
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${POLICY_ID}`, true);
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.getByText(adminCtaLabel)).not.toBeDisabled();
        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_VENDORS.getRoute(POLICY_ID));
    });

    it('uses More Features without fetching fallback workspace connections when Vendor Matching beta is disabled', async () => {
        await act(async () => {
            await setupOnyxBaseline({
                isAdmin: true,
                activePolicyID: 'non-admin-policy',
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                ...buildAdminPolicy(),
                areConnectionsEnabled: true,
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenPolicyAccountingPage).not.toHaveBeenCalled();
        expect(screen.getByText(adminCtaLabel)).not.toBeDisabled();
        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(POLICY_ID));
    });

    it.each([
        ['offline', true, undefined],
        ['failed', false, false],
    ] as const)('uses More Features for a fallback workspace when connection hydration is %s', async (_state, isOffline, hasBeenFetched) => {
        mockUseNetwork.mockReturnValue({isOffline});
        await act(async () => {
            await setupOnyxBaseline({
                isAdmin: true,
                activePolicyID: 'non-admin-policy',
            });
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildVendorEnabledAdminPolicy());
            if (hasBeenFetched !== undefined) {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${POLICY_ID}`, hasBeenFetched);
            }
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(adminCtaLabel)).not.toBeDisabled();
        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(POLICY_ID));
    });

    it('routes the member CTA to the new Agents page', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CUSTOM_AGENT]);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(memberCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_NEW.getRoute());
    });

    it('uses the fixed-width bottom-right overlay on wide layouts', async () => {
        mockUseResponsiveLayout.mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
        });
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('ProductMarketingWindowAnchor')).toHaveStyle({
            bottom: variables.productMarketingWindowOffset,
            right: variables.productMarketingWindowOffset,
            zIndex: variables.modalBaseZIndex,
        });
        expect(screen.getByTestId('ProductMarketingWindow')).toHaveStyle({
            width: variables.productMarketingWindowWidth,
            padding: 20,
        });
        expect(screen.getByTestId('ProductMarketingWindowVisual')).toHaveStyle({
            aspectRatio: variables.productMarketingWindowVisualAspectRatio,
            marginBottom: 16,
        });
        expect(screen.getByText(adminBody)).toHaveStyle({marginTop: 2});
        expect(screen.getByTestId('ProductMarketingWindowActions')).toHaveStyle({
            marginTop: 16,
        });
        expect(screen.getByTestId('ProductMarketingWindowDismiss')).toHaveStyle({
            minHeight: variables.componentSizeSmall,
        });
        expect(screen.getByTestId('ProductMarketingWindowCTA')).toHaveStyle({
            minHeight: variables.componentSizeSmall,
        });

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(buttons.at(0)).toBe(screen.getByTestId('ProductMarketingWindowDismiss'));
        expect(buttons.at(1)).toBe(screen.getByTestId('ProductMarketingWindowCTA'));
    });

    it.each([
        [CONST.THEME.LIGHT, colors.green800, colors.productDark900, colors.productDark800],
        [CONST.THEME.LIGHT_CONTRAST, colors.green800, colors.productDark900, colors.productDark800],
        [CONST.THEME.DARK, colors.productLight100, colors.productLight900, colors.productLight800],
        [CONST.THEME.DARK_CONTRAST, colors.productLight100, colors.productLight900, colors.productLight800],
    ] as const)('uses the opposite product palette for the %s app theme', async (themePreference, backgroundColor, headingColor, bodyColor) => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager(undefined, themePreference);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('ProductMarketingWindow')).toHaveStyle({
            backgroundColor,
        });
        expect(screen.getByText(adminHeading)).toHaveStyle({
            color: headingColor,
        });
        expect(screen.getByText(adminBody)).toHaveStyle({color: bodyColor});
        expect(screen.getByText(en.common.dismiss)).toHaveStyle({
            color: headingColor,
        });
    });

    it('places the narrow card above the tab bar safe area and margin', async () => {
        mockUseSafeAreaPaddings.mockReturnValue({
            paddingTop: 0,
            paddingBottom: 23.8,
            unmodifiedPaddings: {},
            insets: {top: 0, right: 0, bottom: 34, left: 0},
            safeAreaPaddingBottomStyle: {paddingBottom: 23.8},
        });
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('ProductMarketingWindowAnchor')).toHaveStyle({
            left: variables.productMarketingWindowHorizontalOffsetNarrow,
            right: variables.productMarketingWindowHorizontalOffsetNarrow,
            bottom: 23.8 + variables.productMarketingWindowOffsetNarrow,
            alignItems: 'center',
        });
        expect(mockUseSafeAreaPaddings).toHaveBeenCalledWith(true);
        // Full width up to the cap, so phones keep the near-full-width card while tablet-width viewports get a centered, clamped card.
        expect(screen.getByTestId('ProductMarketingWindow')).toHaveStyle({
            width: '100%',
            maxWidth: variables.productMarketingWindowMaxWidthNarrow,
            padding: 20,
        });
        expect(screen.getByTestId('ProductMarketingWindowDismiss')).toHaveStyle({
            minHeight: variables.componentSizeNormal,
        });
        expect(screen.getByTestId('ProductMarketingWindowCTA')).toHaveStyle({
            minHeight: variables.componentSizeNormal,
        });
    });

    it('uses the compact card width on extra-short landscape layouts', async () => {
        mockUseResponsiveLayout.mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
            shouldUseNarrowLayout: true,
            isExtraSmallScreenHeight: true,
            isInLandscapeMode: true,
        });
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('ProductMarketingWindowAnchor')).toHaveStyle({
            bottom: variables.productMarketingWindowOffsetNarrow,
        });
        expect(screen.getByTestId('ProductMarketingWindow')).toHaveStyle({
            width: '100%',
            maxWidth: variables.productMarketingWindowWidth,
            padding: 20,
        });
        expect(screen.getByTestId('ProductMarketingWindowVisual')).toHaveStyle({
            width: '100%',
            aspectRatio: variables.productMarketingWindowVisualAspectRatio,
        });
    });

    it('renders nothing while the Require 2FA page is showing', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                needsTwoFactorAuthSetup: true,
                requiresTwoFactorAuth: false,
            });
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();

        // Once 2FA is set up the requirement page goes away, so the window is free to show again.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                needsTwoFactorAuthSetup: false,
                requiresTwoFactorAuth: true,
            });
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.getByText(adminHeading)).toBeTruthy();
    });
});
