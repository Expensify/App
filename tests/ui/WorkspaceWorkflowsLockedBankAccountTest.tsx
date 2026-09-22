import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {setForceOffline} from '@libs/NetworkState';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceWorkflowsPageRevamp from '@pages/workspace/workflows/WorkspaceWorkflowsPageRevamp';

import type * as ReportUserActionsModule from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockReanimatedModalModule from '../utils/mockReanimatedModal';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});

const mockNavigateToConciergeChat = jest.fn();
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportUserActionsModule>('@userActions/Report'),
    navigateToConciergeChat: () => {
        mockNavigateToConciergeChat();
    },
}));

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-locked-bank-account-test';
const CURRENT_USER_LOGIN = 'test@user.com';
const OTHER_REIMBURSER_LOGIN = 'reimburser@user.com';
const BANK_ACCOUNT_ID = 123456;

type TestNavigatorParamList = WorkspaceSplitNavigatorParamList;

const Stack = createPlatformStackNavigator<TestNavigatorParamList>();

const buildPolicyWithLockedBankAccount = (reimburser: string): Policy =>
    ({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        outputCurrency: 'USD',
        areWorkflowsEnabled: true,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        achAccount: {
            reimburser,
            bankAccountID: BANK_ACCOUNT_ID,
            accountNumber: '1234567890',
            routingNumber: '011000015',
            bankName: 'Test Bank',
            addressName: 'Test Address',
            state: CONST.BANK_ACCOUNT.STATE.LOCKED,
        },
    }) as Policy;

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.WORKFLOWS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.WORKFLOWS}
                                component={WorkspaceWorkflowsPageRevamp}
                                // The locked bank account row lives on the Payments tab, so deep-link straight to it.
                                initialParams={{policyID: POLICY_ID, tab: CONST.TAB.WORKFLOWS.PAYMENTS}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const setUpLockedBankAccount = async (reimburser: string) => {
    await TestHelper.signInWithTestUser(1, CURRENT_USER_LOGIN);
    await act(async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: CURRENT_USER_LOGIN});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicyWithLockedBankAccount(reimburser));
    });
};

const getInitiatingBankAccountUnlock = () =>
    new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });

describe('WorkspaceWorkflowsPageRevamp - locked bank account row', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        setForceOffline(false);
        mockNavigateToConciergeChat.mockClear();
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    it('lets the reimburser request an unlock while offline, because the request is optimistic and queues until reconnect', async () => {
        await setUpLockedBankAccount(CURRENT_USER_LOGIN);
        setForceOffline(true);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('walletPage.bankAccountStatus.unlock')));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigateToConciergeChat).toHaveBeenCalled();
        await expect(getInitiatingBankAccountUnlock()).resolves.toEqual(expect.objectContaining({bankAccountIDToUnlock: BANK_ACCOUNT_ID}));
    });

    it('does not offer the unlock action offline to someone who is not the reimburser', async () => {
        await setUpLockedBankAccount(OTHER_REIMBURSER_LOGIN);
        setForceOffline(true);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Only the reimburser can send the unlock request, so nobody else gets an Unlock button to press.
        expect(screen.queryByText(TestHelper.translateLocal('walletPage.bankAccountStatus.unlock'))).not.toBeOnTheScreen();
        await expect(getInitiatingBankAccountUnlock()).resolves.toBeUndefined();
    });
});
