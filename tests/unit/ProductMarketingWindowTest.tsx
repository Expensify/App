import {act, fireEvent, render, screen} from '@testing-library/react-native';

import July26PromoImage from '@assets/images/july26-promo.png';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ProductMarketingWindowManager from '@components/ProductMarketingWindow/ProductMarketingWindowManager';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {setNameValuePair} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT} from '@libs/ProductMarketingWindowUtils';

import colors from '@styles/theme/colors';
import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';
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
const SECOND_POLICY_ID = 'second-product-marketing-policy';
const USER_EMAIL = 'user@example.com';
const USER_ACCOUNT_ID = 7;
const OLDER_UPDATE_KEY = 'productUpdateJune2026';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// Keep setNameValuePair's optimistic Onyx merge (so persistence behavior is exercised end-to-end) while
// dropping its API call and letting tests assert that the previous value is supplied for failure rollback.
jest.mock('@libs/actions/User', () => {
    return {
        setNameValuePair: jest.fn((name: typeof ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, value: string) => {
            const OnyxModule = jest.requireActual<{default: typeof Onyx}>('react-native-onyx').default;
            OnyxModule.merge(name, value);
        }),
    };
});

const announcement = ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT;
if (!announcement) {
    throw new Error('These tests require an active product marketing announcement; update them if the active announcement is removed.');
}
const mockSetNameValuePair = jest.mocked(setNameValuePair);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const adminHeading = en.productMarketingWindow.roleTypes.admin.heading;
const adminBody = en.productMarketingWindow.roleTypes.admin.body;
const adminCtaLabel = en.productMarketingWindow.roleTypes.admin.cta;

function buildAdminPolicy(policyID = POLICY_ID): Policy {
    return {
        id: policyID,
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

const renderManager = (topmostRouteName?: string, theme: ThemePreferenceWithoutSystem = CONST.THEME.LIGHT) =>
    render(
        <ThemeProvider theme={theme}>
            <ThemeStylesProvider>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                    <ProductMarketingWindowManager topmostRouteName={topmostRouteName} />
                </ComposeProviders>
            </ThemeStylesProvider>
        </ThemeProvider>,
    );

async function setupOnyxBaseline({isAdmin, activePolicyID = POLICY_ID}: {isAdmin: boolean; activePolicyID?: string}) {
    await Onyx.clear();
    await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [USER_ACCOUNT_ID]: buildPersonalDetails(USER_EMAIL, USER_ACCOUNT_ID, 'User'),
    });
    await Onyx.merge(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
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
        mockUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('renders nothing for a user without an admin role on any workspace', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('ProductMarketingWindow')).toBeNull();
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
        expect(screen.getByTestId('ProductMarketingWindowImage').props.source).toBe(July26PromoImage);
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
            await Onyx.merge(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
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
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('renders nothing while acting as a copilot, so a delegate cannot dismiss the owner’s announcement', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'copilot@example.com'}});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('hides the window for a centered covering modal through closing and shows it again after final hide', async () => {
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
                isPopover: false,
                isModalCovering: true,
            });
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
                isModalCovering: true,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: false,
                type: null,
                isModalCovering: false,
            });
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
                isModalCovering: false,
            });
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
                isModalCovering: false,
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
                isModalCovering: false,
            });
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
                isModalCovering: false,
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
                isModalCovering: true,
            });
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
                isModalCovering: true,
            });
            await waitForBatchedUpdatesWithAct();
        });
        expect(screen.queryByText(adminHeading)).toBeNull();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {
                isVisible: false,
                type: null,
                isModalCovering: false,
            });
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

        expect(mockSetNameValuePair).toHaveBeenCalledTimes(1);
        expect(mockSetNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, announcement.updateKey, '');
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
            await Onyx.set(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, OLDER_UPDATE_KEY);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockSetNameValuePair).toHaveBeenCalledTimes(1);
        expect(mockSetNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, announcement.updateKey, OLDER_UPDATE_KEY);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(announcement.admin.getCtaRoute(POLICY_ID));

        const dismissCallOrder = mockSetNameValuePair.mock.invocationCallOrder.at(0) ?? Number.NaN;
        const navigateCallOrder = mockNavigate.mock.invocationCallOrder.at(0) ?? Number.NaN;
        expect(dismissCallOrder).toBeLessThan(navigateCallOrder);

        expect(screen.queryByText(adminHeading)).toBeNull();
    });

    it('routes the CTA to the active admin workspace when the user administers multiple workspaces', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true, activePolicyID: SECOND_POLICY_ID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, buildAdminPolicy(SECOND_POLICY_ID));
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(announcement.admin.getCtaRoute(SECOND_POLICY_ID));
    });

    it('falls back to the first eligible admin workspace when the active workspace is not administered by the user', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true, activePolicyID: 'non-admin-policy'});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(adminCtaLabel));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(announcement.admin.getCtaRoute(POLICY_ID));
    });

    it('shows the window again when a failed persistence request rolls the NVP back to its previous update key', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await Onyx.set(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, OLDER_UPDATE_KEY);
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(en.common.dismiss));
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(adminHeading)).toBeNull();
        expect(mockSetNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, announcement.updateKey, OLDER_UPDATE_KEY);

        await act(async () => {
            // This is the failureData merge performed by setNameValuePair using the previous value passed above.
            await Onyx.merge(ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW, OLDER_UPDATE_KEY);
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.getByText(adminHeading)).toBeTruthy();
    });

    it('uses the fixed-width bottom-right card on wide layouts', async () => {
        mockUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false, isSmallScreenWidth: false});
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        const window = screen.getByTestId('ProductMarketingWindow');
        expect(window).toHaveStyle({
            width: variables.productMarketingWindowWidth,
            bottom: variables.productMarketingWindowOffset,
            right: variables.productMarketingWindowOffset,
            padding: 20,
        });
        expect(screen.getByTestId('ProductMarketingWindowVisual')).toHaveStyle({
            aspectRatio: variables.productMarketingWindowVisualAspectRatio,
            marginBottom: 16,
        });
        expect(screen.getByText(adminBody)).toHaveStyle({marginTop: 2});
        expect(screen.getByTestId('ProductMarketingWindowActions')).toHaveStyle({marginTop: 16});
        expect(screen.getByTestId('ProductMarketingWindowDismiss')).toHaveStyle({minHeight: variables.componentSizeSmall});
        expect(screen.getByTestId('ProductMarketingWindowCTA')).toHaveStyle({minHeight: variables.componentSizeSmall});

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(buttons.at(0)).toBe(screen.getByTestId('ProductMarketingWindowCTA'));
        expect(buttons.at(1)).toBe(screen.getByTestId('ProductMarketingWindowDismiss'));
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

        expect(screen.getByTestId('ProductMarketingWindow')).toHaveStyle({backgroundColor});
        expect(screen.getByText(adminHeading)).toHaveStyle({color: headingColor});
        expect(screen.getByText(adminBody)).toHaveStyle({color: bodyColor});
        expect(screen.getByText(en.common.dismiss)).toHaveStyle({color: headingColor});
    });

    it('uses the near-full-width bottom card on narrow layouts', async () => {
        await act(async () => {
            await setupOnyxBaseline({isAdmin: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderManager();
        await waitForBatchedUpdatesWithAct();

        const window = screen.getByTestId('ProductMarketingWindow');
        expect(window).toHaveStyle({
            left: variables.productMarketingWindowOffsetNarrow,
            right: variables.productMarketingWindowOffsetNarrow,
            bottom: variables.productMarketingWindowOffsetNarrow,
        });
        expect(screen.getByTestId('ProductMarketingWindowDismiss')).toHaveStyle({minHeight: variables.componentSizeNormal});
        expect(screen.getByTestId('ProductMarketingWindowCTA')).toHaveStyle({minHeight: variables.componentSizeNormal});
    });
});
