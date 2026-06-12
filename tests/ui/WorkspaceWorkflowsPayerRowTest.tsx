import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceWorkflowsPage from '@pages/workspace/workflows/WorkspaceWorkflowsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {BankAccountList, Policy} from '@src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@native-html/render', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

jest.mock('@components/Modal/ReanimatedModal', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {useEffect, useRef}: {useEffect: typeof React.useEffect; useRef: typeof React.useRef} = require('react');

    return function MockReanimatedModal({isVisible, onModalHide, children}: {isVisible: boolean; onModalHide?: () => void; children: React.ReactNode}) {
        const wasVisible = useRef<boolean>(isVisible);

        useEffect(() => {
            if (wasVisible.current && !isVisible) {
                onModalHide?.();
            }
            wasVisible.current = isVisible;
        }, [isVisible, onModalHide]);

        if (!isVisible) {
            return null;
        }

        return children as React.ReactElement;
    };
});

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-payer-test';

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const buildPolicy = (overrides: Partial<Policy> = {}): Policy =>
    ({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        outputCurrency: 'USD',
        areWorkflowsEnabled: true,
        ...overrides,
    }) as Policy;

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.WORKFLOWS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.WORKFLOWS}
                                component={WorkspaceWorkflowsPage}
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
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
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

    it('hides the Payer row when reimbursementChoice is REIMBURSEMENT_MANUAL', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                buildPolicy({
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
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

        expect(screen.queryByText(TestHelper.translateLocal('workflowsPayerPage.payer'))).not.toBeOnTheScreen();
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
});
