import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import FixedFooter from '@components/FixedFooter';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import DynamicEditInviteReceiptPartnerPolicyPage from '@pages/workspace/receiptPartners/DynamicEditInviteReceiptPartnerPolicyPage';
import DynamicInviteReceiptPartnerPolicyPage from '@pages/workspace/receiptPartners/DynamicInviteReceiptPartnerPolicyPage';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();
const UBER_INTEGRATION = CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER;
const EMPLOYEE_EMAIL = 'employee@company.com';
const BILLING_EMAIL = 'billing@company.com';
const POLICY_ID = 'policy123';

const BOTTOM_INSET = 34;
const SAFE_AREA_PADDING_BOTTOM = BOTTOM_INSET * variables.iosSafeAreaInsetsPercentage;
const FOOTER_BASE_PADDING_BOTTOM = 20;

jest.mock('@hooks/useSafeAreaInsets', () => ({
    __esModule: true,
    default: () => ({top: 24, right: 0, bottom: 34, left: 0}),
}));

const employeePersonalDetails: Record<number, PersonalDetails> = {};
employeePersonalDetails[2] = {
    accountID: 2,
    login: EMPLOYEE_EMAIL,
    displayName: 'Employee User',
    firstName: 'Employee',
    lastName: 'User',
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
    pronouns: '',
    timezone: CONST.DEFAULT_TIME_ZONE,
    phoneNumber: '',
};

const basePolicy = {
    ...LHNTestUtils.getFakePolicy(),
    id: POLICY_ID,
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

function renderWithProviders(children: React.ReactNode) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>{children}</NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
}

function renderInvitePage(initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE]) {
    return renderWithProviders(
        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE}>
            <Stack.Screen
                name={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE}
                component={DynamicInviteReceiptPartnerPolicyPage}
                initialParams={initialParams}
            />
        </Stack.Navigator>,
    );
}

function renderEditInvitePage(initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE_EDIT]) {
    return renderWithProviders(
        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE_EDIT}>
            <Stack.Screen
                name={SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE_EDIT}
                component={DynamicEditInviteReceiptPartnerPolicyPage}
                initialParams={initialParams}
            />
        </Stack.Navigator>,
    );
}

function getPaddingBottom(element: {props: {style?: StyleProp<ViewStyle>}} | string | undefined): number {
    if (!element || typeof element === 'string') {
        return 0;
    }
    const style = StyleSheet.flatten(element.props.style);
    return typeof style?.paddingBottom === 'number' ? style.paddingBottom : 0;
}

function getFixedFooterPaddingBottom(): number {
    return getPaddingBottom(screen.UNSAFE_getByType(FixedFooter).children.at(0));
}

function getLegacyScreenWrapperSpacerPaddingBottom(testID: string): number {
    const children = screen.getByTestId(testID).children.filter((child) => typeof child !== 'string');
    return children.length < 2 ? 0 : getPaddingBottom(children.at(-1));
}

describe('ReceiptPartnersInvitePadding', () => {
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

    it('applies the bottom safe area inset exactly once on the send invites page', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, basePolicy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, employeePersonalDetails);
        });

        renderInvitePage({policyID: POLICY_ID, integration: UBER_INTEGRATION});
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.confirm'))).toBeOnTheScreen();
        });

        expect(getFixedFooterPaddingBottom()).toBe(FOOTER_BASE_PADDING_BOTTOM + SAFE_AREA_PADDING_BOTTOM);
        expect(getLegacyScreenWrapperSpacerPaddingBottom('DynamicInviteReceiptPartnerPolicyPage')).toBe(0);
    });

    it('keeps the bottom safe area inset on the all set page, which relies on the legacy screen wrapper spacer', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {...basePolicy, employeeList: {}});
        });

        renderInvitePage({policyID: POLICY_ID, integration: UBER_INTEGRATION});
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.allSet'))).toBeOnTheScreen();
        });

        expect(getFixedFooterPaddingBottom()).toBe(FOOTER_BASE_PADDING_BOTTOM);
        expect(getLegacyScreenWrapperSpacerPaddingBottom('DynamicInviteReceiptPartnerPolicyPage')).toBe(SAFE_AREA_PADDING_BOTTOM);
    });

    it('applies the bottom safe area inset exactly once on the manage invites page', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, basePolicy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, employeePersonalDetails);
        });

        renderEditInvitePage({policyID: POLICY_ID, integration: UBER_INTEGRATION});
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.receiptPartners.uber.manageInvites'))).toBeOnTheScreen();
        });

        expect(getLegacyScreenWrapperSpacerPaddingBottom('DynamicEditInviteReceiptPartnerPolicyPage')).toBe(SAFE_AREA_PADDING_BOTTOM);
    });
});
