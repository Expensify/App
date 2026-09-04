import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceWorkflowsPage from '@pages/workspace/workflows/WorkspaceWorkflowsPage';
import WorkspaceWorkflowsPayerPage from '@pages/workspace/workflows/WorkspaceWorkflowsPayerPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {BankAccountList, Policy} from '@src/types/onyx';

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

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-payer-test';

type TestNavigatorParamList = WorkspaceSplitNavigatorParamList & Pick<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_PAYER>;

const Stack = createPlatformStackNavigator<TestNavigatorParamList>();

const buildPolicy = (overrides: Partial<Policy> = {}): Policy =>
    ({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        outputCurrency: 'USD',
        areWorkflowsEnabled: true,
        ...overrides,
    }) as Policy;

const renderPage = (initialRouteName: keyof TestNavigatorParamList = SCREENS.WORKSPACE.WORKFLOWS) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={initialRouteName}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.WORKFLOWS}
                                component={WorkspaceWorkflowsPage}
                                // The payer row lives on the Payments tab, so deep-link straight to it.
                                initialParams={{policyID: POLICY_ID, tab: CONST.TAB.WORKFLOWS.PAYMENTS}}
                            />
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.WORKFLOWS_PAYER}
                                component={WorkspaceWorkflowsPayerPage}
                                initialParams={{policyID: POLICY_ID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

describe('WorkspaceWorkflowsPage - Payer row visibility', () => {
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
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    it('shows the Payer row when reimbursementChoice is REIMBURSEMENT_YES and a bank account exists', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                buildPolicy({
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    achAccount: {
                        reimburser: 'test@user.com',
                        bankAccountID: 123456,
                        accountNumber: '1234567890',
                        routingNumber: '011000015',
                        bankName: 'Test Bank',
                        addressName: 'Test Address',
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                    },
                }),
            );
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('workflowsPayerPage.payer'))).toBeOnTheScreen();
    });

    it('shows the Payer row when reimbursementChoice is REIMBURSEMENT_MANUAL', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                buildPolicy({
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                }),
            );
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('workflowsPayerPage.payer'))).toBeOnTheScreen();
    });

    it('shows the Payer row when reimbursementChoice is undefined (legacy workspaces)', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                buildPolicy({
                    reimbursementChoice: undefined,
                    achAccount: {
                        reimburser: 'test@user.com',
                        bankAccountID: 123456,
                        accountNumber: '1234567890',
                        routingNumber: '011000015',
                        bankName: 'Test Bank',
                        addressName: 'Test Address',
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                    },
                }),
            );
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('workflowsPayerPage.payer'))).toBeOnTheScreen();
    });

    it('shows the Payer row during partial bank setup when reimbursementChoice is REIMBURSEMENT_YES', async () => {
        await TestHelper.signInWithTestUser();

        const bankAccountID = 123456;
        const bankAccountList: BankAccountList = {
            [bankAccountID]: {
                methodID: bankAccountID,
                bankCurrency: 'USD',
                bankCountry: 'US',
                accountData: {
                    additionalData: {
                        policyID: POLICY_ID,
                        bankName: CONST.BANK_NAMES.GENERIC_BANK,
                    },
                    addressName: 'Test Address',
                    state: CONST.BANK_ACCOUNT.STATE.SETUP,
                },
            },
        };

        await act(async () => {
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                buildPolicy({
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                }),
            );
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('workflowsPayerPage.payer'))).toBeOnTheScreen();
    });

    it.each([CONST.BANK_ACCOUNT.STATE.SETUP, CONST.BANK_ACCOUNT.STATE.VERIFYING, CONST.BANK_ACCOUNT.STATE.PENDING])(
        'keeps the Payer row non-clickable when bank account is %s',
        async (state) => {
            await TestHelper.signInWithTestUser();

            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            const bankAccountID = 123456;
            const bankAccountList: BankAccountList = {
                [bankAccountID]: {
                    methodID: bankAccountID,
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                    accountData: {
                        additionalData: {
                            policyID: POLICY_ID,
                            bankName: CONST.BANK_NAMES.GENERIC_BANK,
                        },
                        addressName: 'Test Address',
                        state,
                    },
                },
            };

            await act(async () => {
                await Onyx.merge(
                    `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                    buildPolicy({
                        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    }),
                );
                await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
            });

            renderPage();
            await waitForBatchedUpdatesWithAct();

            const payerRow = screen.getByText(TestHelper.translateLocal('workflowsPayerPage.payer'));
            expect(payerRow).toBeOnTheScreen();

            navigateSpy.mockClear();
            fireEvent.press(payerRow);

            expect(navigateSpy).not.toHaveBeenCalled();
        },
    );

    it.each([CONST.BANK_ACCOUNT.STATE.SETUP, CONST.BANK_ACCOUNT.STATE.VERIFYING, CONST.BANK_ACCOUNT.STATE.PENDING])(
        'blocks the direct Payer route when bank account is %s',
        async (state) => {
            await TestHelper.signInWithTestUser();

            const bankAccountID = 123456;
            await act(async () => {
                await Onyx.merge(
                    `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                    buildPolicy({
                        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    }),
                );
                await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                    [bankAccountID]: {
                        methodID: bankAccountID,
                        bankCurrency: 'USD',
                        bankCountry: 'US',
                        accountData: {
                            additionalData: {
                                policyID: POLICY_ID,
                                bankName: CONST.BANK_NAMES.GENERIC_BANK,
                            },
                            addressName: 'Test Address',
                            state,
                        },
                    },
                });
            });

            renderPage(SCREENS.WORKSPACE.WORKFLOWS_PAYER);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId('FullPageNotFoundView')).toBeOnTheScreen();
            expect(screen.queryByTestId('WorkspaceWorkflowsPayerPage')).not.toBeOnTheScreen();
        },
    );

    it('allows a payments admin to change the Payer only after bank setup is complete', async () => {
        const currentUserLogin = 'test@user.com';
        const reimburser = 'owner@test.com';
        const bankAccountID = 123456;
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        await TestHelper.signInWithTestUser(undefined, currentUserLogin);
        await act(async () => {
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                buildPolicy({
                    owner: reimburser,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    employeeList: {
                        [currentUserLogin]: {
                            email: currentUserLogin,
                            role: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
                        },
                    },
                }),
            );
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    methodID: bankAccountID,
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                    accountData: {
                        additionalData: {
                            policyID: POLICY_ID,
                            bankName: CONST.BANK_NAMES.GENERIC_BANK,
                        },
                        addressName: 'Test Address',
                        state: CONST.BANK_ACCOUNT.STATE.SETUP,
                    },
                },
            });
        });

        const {unmount} = renderPage();
        await waitForBatchedUpdatesWithAct();

        const payerRow = screen.getByText(TestHelper.translateLocal('workflowsPayerPage.payer'));
        expect(payerRow).toBeOnTheScreen();

        fireEvent.press(screen.getByLabelText(`${TestHelper.translateLocal('workflowsPayerPage.payer')}, ${reimburser}`), {type: 'press'});
        expect(navigateSpy).not.toHaveBeenCalled();
        unmount();

        await act(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    methodID: bankAccountID,
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                    accountData: {
                        additionalData: {
                            policyID: POLICY_ID,
                            bankName: CONST.BANK_NAMES.GENERIC_BANK,
                        },
                        addressName: 'Test Address',
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                    },
                },
            });
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText(`${TestHelper.translateLocal('workflowsPayerPage.payer')}, ${reimburser}`), {type: 'press'});
        expect(navigateSpy).toHaveBeenCalledWith('workspaces/workflows-payer-test/workflows/payer');
    });

    it('sets the payer without sharing when the policy has no withdrawal account', async () => {
        const currentUserLogin = 'test@user.com';
        const currentUserAccountID = 1;
        const otherAdminLogin = 'other-admin@test.com';
        const otherAdminAccountID = 2;
        const bankAccountID = 123456;
        const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});

        await TestHelper.signInWithTestUser(currentUserAccountID, currentUserLogin);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [currentUserAccountID]: TestHelper.buildPersonalDetails(currentUserLogin, currentUserAccountID),
                [otherAdminAccountID]: TestHelper.buildPersonalDetails(otherAdminLogin, otherAdminAccountID, 'Other'),
            });
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                buildPolicy({
                    owner: currentUserLogin,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    employeeList: {
                        [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.ADMIN},
                        [otherAdminLogin]: {email: otherAdminLogin, role: CONST.POLICY.ROLE.ADMIN},
                    },
                }),
            );

            // This account is linked to the policy. It is not the withdrawal account, because the policy has none.
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    methodID: bankAccountID,
                    bankCurrency: 'USD',
                    bankCountry: 'US',
                    accountData: {
                        bankAccountID,
                        additionalData: {
                            policyID: POLICY_ID,
                            bankName: CONST.BANK_NAMES.GENERIC_BANK,
                        },
                        addressName: 'Test Address',
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                    },
                },
            });
        });

        renderPage(SCREENS.WORKSPACE.WORKFLOWS_PAYER);
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(otherAdminLogin));
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.save')));
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(TestHelper.translateLocal('workflowsPayerPage.shareBankAccount.shareTitle'))).not.toBeOnTheScreen();
        expect(closeRHPFlowSpy).toHaveBeenCalled();
    });
});
