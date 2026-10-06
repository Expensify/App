import {act, render, renderHook, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import * as useSafeAreaInsetsModule from '@hooks/useSafeAreaInsets';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import ChangeReceiptBillingAccountPage from '@pages/workspace/receiptPartners/ChangeReceiptBillingAccountPage';
import DynamicEditInviteReceiptPartnerPolicyPage from '@pages/workspace/receiptPartners/DynamicEditInviteReceiptPartnerPolicyPage';
import DynamicInviteReceiptPartnerPolicyPage from '@pages/workspace/receiptPartners/DynamicInviteReceiptPartnerPolicyPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/OnyxTabNavigator', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const React2 = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const OnyxTabNavigator = ({children}: {children: React.ReactNode}) => React2.createElement(React2.Fragment, null, children);
    const TopTab = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        Screen: ({children}: {children: () => React.ReactNode}) => React2.createElement(React2.Fragment, null, typeof children === 'function' ? children() : children),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const TabScreenWithFocusTrapWrapper = ({children}: {children: React.ReactNode}) => React2.createElement(React2.Fragment, null, children);
    return {
        __esModule: true,
        default: OnyxTabNavigator,
        TopTab,
        TabScreenWithFocusTrapWrapper,
    };
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();
const UBER_INTEGRATION = CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER;
const EMPLOYEE_EMAIL = 'employee@company.com';
const BILLING_EMAIL = 'billing@company.com';

const employeePersonalDetails: Record<number, PersonalDetails> = {};
employeePersonalDetails[2] = {
    accountID: 2,
    login: EMPLOYEE_EMAIL,
    displayName: 'Employee User',
    firstName: 'Employee',
    lastName: 'User',
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
    avatarThumbnail: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
    pronouns: '',
    timezone: CONST.DEFAULT_TIME_ZONE,
    phoneNumber: '',
};
employeePersonalDetails[3] = {
    accountID: 3,
    login: BILLING_EMAIL,
    displayName: 'Billing User',
    firstName: 'Billing',
    lastName: 'User',
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
    avatarThumbnail: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
    pronouns: '',
    timezone: CONST.DEFAULT_TIME_ZONE,
    phoneNumber: '',
};

const renderInvitePage = (initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE}
                                component={DynamicInviteReceiptPartnerPolicyPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const renderEditInvitePage = (initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE_EDIT]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE_EDIT}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE_EDIT}
                                component={DynamicEditInviteReceiptPartnerPolicyPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const renderChangeBillingAccountPage = (initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT}
                                component={ChangeReceiptBillingAccountPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

describe('WorkspaceReceiptPartners', () => {
    const policyID = 'policy123';
    const basePolicy = {
        ...LHNTestUtils.getFakePolicy(),
        id: policyID,
        role: CONST.POLICY.ROLE.ADMIN,
        receiptPartners: {
            enabled: true,
            uber: {
                enabled: true,
                centralBillingAccountEmail: BILLING_EMAIL,
                employees: {
                    [EMPLOYEE_EMAIL]: {
                        status: CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.CREATED,
                    },
                },
            },
        },
        employeeList: {
            [EMPLOYEE_EMAIL]: {
                email: EMPLOYEE_EMAIL,
                role: CONST.POLICY.ROLE.USER,
            },
            [BILLING_EMAIL]: {
                email: BILLING_EMAIL,
                role: CONST.POLICY.ROLE.USER,
            },
        },
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        const responsiveLayoutMock: ResponsiveLayoutResult = {
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: false,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: false,
            isInLandscapeMode: false,
        };
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(responsiveLayoutMock);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('renders the invite receipt partner page', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, basePolicy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, employeePersonalDetails);
        });

        renderInvitePage({policyID, integration: UBER_INTEGRATION});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.sendInvites'))).toBeOnTheScreen();
        });
        expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.sendInvites'))).toBeOnTheScreen();
    });

    it('renders the edit invite receipt partner page', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, basePolicy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, employeePersonalDetails);
        });

        renderEditInvitePage({policyID, integration: UBER_INTEGRATION});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.manageInvites'))).toBeOnTheScreen();
        });
        expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.manageInvites'))).toBeOnTheScreen();
    });

    it('renders the change billing account page', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, basePolicy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, employeePersonalDetails);
        });

        renderChangeBillingAccountPage({
            policyID,
            integration: UBER_INTEGRATION,
        });

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.centralBillingAccount'))).toBeOnTheScreen();
        });
        expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.centralBillingAccount'))).toBeOnTheScreen();
    });

    describe('bottom safe area padding', () => {
        const BOTTOM_INSET = 34;
        let useSafeAreaInsetsSpy: jest.SpyInstance;

        beforeEach(() => {
            useSafeAreaInsetsSpy = jest.spyOn(useSafeAreaInsetsModule, 'default');
        });

        afterEach(() => {
            useSafeAreaInsetsSpy.mockRestore();
        });

        /** Renders the invite page on a device with the given bottom inset and sums the bottom padding of every view on the screen. */
        const getInvitePageBottomPadding = async (bottomInset: number, headerTitle: string) => {
            useSafeAreaInsetsSpy.mockReturnValue({top: 0, right: 0, bottom: bottomInset, left: 0});
            const {unmount} = renderInvitePage({policyID, integration: UBER_INTEGRATION});

            await waitForBatchedUpdatesWithAct();
            await waitFor(() => {
                expect(screen.getByText(headerTitle)).toBeOnTheScreen();
            });

            const totalBottomPadding = screen
                .getByTestId('DynamicInviteReceiptPartnerPolicyPage')
                .findAll((node) => typeof node.type === 'string')
                .reduce((total, node) => {
                    const style: unknown = StyleSheet.flatten(node.props.style);
                    if (!style || typeof style !== 'object' || !('paddingBottom' in style) || typeof style.paddingBottom !== 'number') {
                        return total;
                    }
                    return total + style.paddingBottom;
                }, 0);

            unmount();
            return totalBottomPadding;
        };

        /** Returns how much bottom padding the inset adds to the invite page, compared to a device without a bottom inset. */
        const getBottomPaddingAddedByInset = async (headerTitle: string) => {
            const bottomPaddingWithoutInset = await getInvitePageBottomPadding(0, headerTitle);
            const bottomPaddingWithInset = await getInvitePageBottomPadding(BOTTOM_INSET, headerTitle);
            return bottomPaddingWithInset - bottomPaddingWithoutInset;
        };

        const getSafeAreaPaddingBottom = () => renderHook(() => useSafeAreaPaddings(true)).result.current.paddingBottom;

        it('applies the bottom safe area padding only once on the send invites page', async () => {
            // Given a workspace with members that can still be invited to Uber, so the page shows the member list with the confirm button footer
            await TestHelper.signInWithTestUser();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, basePolicy);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, employeePersonalDetails);
            });

            // When the page is rendered on a device that has a bottom safe area inset
            const bottomPaddingAddedByInset = await getBottomPaddingAddedByInset(TestHelper.translateLocal('workspace.receiptPartners.uber.sendInvites'));

            // Then the inset should be added only once, because the confirm button footer already includes it and ScreenWrapper adding it again leaves an oversized gap below the button
            expect(bottomPaddingAddedByInset).toBeCloseTo(getSafeAreaPaddingBottom());
        });

        it('keeps the bottom safe area padding on the all set page', async () => {
            // Given a workspace where every member is already linked to Uber, so there is nobody left to invite and the page skips to the "All set" confirmation
            await TestHelper.signInWithTestUser();
            const linkedEmployee = {status: CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED};
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    ...basePolicy,
                    receiptPartners: {
                        ...basePolicy.receiptPartners,
                        uber: {
                            ...basePolicy.receiptPartners.uber,
                            employees: {
                                [EMPLOYEE_EMAIL]: linkedEmployee,
                                [BILLING_EMAIL]: linkedEmployee,
                            },
                        },
                    },
                });
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, employeePersonalDetails);
            });

            // When the page is rendered on a device that has a bottom safe area inset
            const bottomPaddingAddedByInset = await getBottomPaddingAddedByInset(TestHelper.translateLocal('workspace.receiptPartners.uber.allSet'));

            // Then the inset should still be added once, because the confirmation footer does not include it and relies on ScreenWrapper to keep the button above the home indicator
            expect(bottomPaddingAddedByInset).toBeCloseTo(getSafeAreaPaddingBottom());
        });
    });
});
