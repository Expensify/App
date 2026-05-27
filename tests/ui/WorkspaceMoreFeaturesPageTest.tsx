import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import useIsPolicyConnectedToUberReceiptPartner from '@hooks/useIsPolicyConnectedToUberReceiptPartner';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceMoreFeaturesPage from '@pages/workspace/WorkspaceMoreFeaturesPage';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

// useConfirmModal resolves only after react-native-modal calls onModalHide via the underlying
// Modal's onDismiss callback, which never fires in tests because animations are disabled. This mock
// ports the same trick used by WorkspaceCategoriesTest so that showConfirmModal promises resolve.
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

jest.mock('@hooks/useIsPolicyConnectedToUberReceiptPartner', () => ({__esModule: true, default: jest.fn(() => false)}));

jest.mock('@libs/CardUtils', () => {
    const actual: typeof CardUtils = jest.requireActual('@libs/CardUtils');
    return {
        ...actual,
        isSmartLimitEnabled: jest.fn(() => false),
        getCompanyFeeds: jest.fn(() => ({})),
    };
});

jest.mock('@libs/PolicyUtils', () => {
    const actual: typeof PolicyUtils = jest.requireActual('@libs/PolicyUtils');
    return {
        ...actual,
        hasAccountingConnections: jest.fn(() => false),
        hasAccountingFeatureConnection: jest.fn(() => false),
    };
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const renderPage = (initialParams: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.MORE_FEATURES]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.MORE_FEATURES}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.MORE_FEATURES}
                                component={WorkspaceMoreFeaturesPage}
                                initialParams={initialParams}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

/** Build a minimal admin policy for use as Onyx fixture. Lock states are driven by mocked hooks/utils, not policy fields. */
const buildPolicy = (overrides: Partial<ReturnType<typeof LHNTestUtils.getFakePolicy>> = {}) => ({
    ...LHNTestUtils.getFakePolicy(),
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.CORPORATE,
    areWorkflowsEnabled: true,
    areConnectionsEnabled: false,
    areCategoriesEnabled: true,
    areTagsEnabled: false,
    areReportFieldsEnabled: false,
    areExpensifyCardsEnabled: false,
    areCompanyCardsEnabled: false,
    areDistanceRatesEnabled: false,
    areRulesEnabled: false,
    isTravelEnabled: false,
    ...overrides,
});

const isSmartLimitEnabledMock = jest.mocked(CardUtils.isSmartLimitEnabled);
const getCompanyFeedsMock = jest.mocked(CardUtils.getCompanyFeeds);
const hasAccountingConnectionsMock = jest.mocked(PolicyUtils.hasAccountingConnections);
const hasAccountingFeatureConnectionMock = jest.mocked(PolicyUtils.hasAccountingFeatureConnection);
const useIsUberConnectedMock = jest.mocked(useIsPolicyConnectedToUberReceiptPartner);

const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => undefined);
const navigateToConciergeChatSpy = jest.spyOn(ReportActions, 'navigateToConciergeChat').mockImplementation(() => undefined);

function escapeRegExp(value: string): string {
    return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Resolves to the locked switch row for the given subtitle. */
const findLockedSwitch = (subtitleKey: Parameters<typeof TestHelper.translateLocal>[0]) =>
    screen.findByRole(CONST.ROLE.SWITCH, {name: new RegExp(`${escapeRegExp(TestHelper.translateLocal(subtitleKey))}.*Locked`, 'i')});

/** Resolves to the unlocked switch row for the given subtitle (no `, Locked` suffix). */
const findUnlockedSwitch = (subtitleKey: Parameters<typeof TestHelper.translateLocal>[0]) => screen.findByRole(CONST.ROLE.SWITCH, {name: TestHelper.translateLocal(subtitleKey)});

describe('WorkspaceMoreFeaturesPage', () => {
    const POLICY_ID = '1';

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

        isSmartLimitEnabledMock.mockReturnValue(false);
        getCompanyFeedsMock.mockReturnValue({});
        hasAccountingConnectionsMock.mockReturnValue(false);
        hasAccountingFeatureConnectionMock.mockReturnValue(false);
        useIsUberConnectedMock.mockReturnValue(false);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Workflows toggle', () => {
        it('locks the Workflows switch when the workspace has a Smart-Limit Expensify Card', async () => {
            await TestHelper.signInWithTestUser();
            isSmartLimitEnabledMock.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();

            await expect(findLockedSwitch('workspace.moreFeatures.workflows.subtitle')).resolves.toBeOnTheScreen();
        });

        it('leaves the Workflows switch interactive when no Smart-Limit card exists', async () => {
            await TestHelper.signInWithTestUser();
            isSmartLimitEnabledMock.mockReturnValue(false);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();

            await expect(findUnlockedSwitch('workspace.moreFeatures.workflows.subtitle')).resolves.toBeOnTheScreen();
        });

        it('opens the Smart-Limit warning modal when the locked Workflows row is pressed', async () => {
            await TestHelper.signInWithTestUser();
            isSmartLimitEnabledMock.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(await findLockedSwitch('workspace.moreFeatures.workflows.subtitle'));

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.moreFeatures.workflowWarningModal.featureEnabledText'))).toBeOnTheScreen();
            });
            expect(screen.getByText(TestHelper.translateLocal('workspace.moreFeatures.workflowWarningModal.confirmText'))).toBeOnTheScreen();
            expect(screen.getByText(TestHelper.translateLocal('common.cancel'))).toBeOnTheScreen();
        });

        it('navigates to the Expensify Card page when the user confirms the Smart-Limit warning', async () => {
            await TestHelper.signInWithTestUser();
            isSmartLimitEnabledMock.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(await findLockedSwitch('workspace.moreFeatures.workflows.subtitle'));

            const confirmButton = await screen.findByLabelText(TestHelper.translateLocal('workspace.moreFeatures.workflowWarningModal.confirmText'));
            fireEvent.press(confirmButton);
            await waitForBatchedUpdatesWithAct();

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID));
        });

        it('does not navigate when the user cancels the Smart-Limit warning', async () => {
            await TestHelper.signInWithTestUser();
            isSmartLimitEnabledMock.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(await findLockedSwitch('workspace.moreFeatures.workflows.subtitle'));

            const cancelButton = await screen.findByText(TestHelper.translateLocal('common.cancel'));
            fireEvent.press(cancelButton);
            await waitForBatchedUpdatesWithAct();

            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe('Accounting toggle (locked when an integration is connected)', () => {
        it('locks the Accounting switch when the policy has an active connection', async () => {
            await TestHelper.signInWithTestUser();
            hasAccountingConnectionsMock.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();

            await expect(findLockedSwitch('workspace.moreFeatures.connections.subtitle')).resolves.toBeOnTheScreen();
        });

        it('routes confirm to the accounting page', async () => {
            await TestHelper.signInWithTestUser();
            hasAccountingConnectionsMock.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(await findLockedSwitch('workspace.moreFeatures.connections.subtitle'));

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.moreFeatures.connectionsWarningModal.disconnectText'))).toBeOnTheScreen();
            });
            fireEvent.press(await screen.findByLabelText(TestHelper.translateLocal('workspace.moreFeatures.connectionsWarningModal.manageSettings')));
            await waitForBatchedUpdatesWithAct();

            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING.getRoute(POLICY_ID));
        });
    });

    describe('Concierge-routed disable flows', () => {
        it('opens Concierge chat when the user confirms the Expensify Card disable warning', async () => {
            await TestHelper.signInWithTestUser();
            getCompanyFeedsMock.mockReturnValue({});
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID, areExpensifyCardsEnabled: true}));
                await Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${LHNTestUtils.getFakePolicy().workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID}_${CONST.EXPENSIFY_CARD.BANK}`, {
                    someCardID: {nameValuePairs: {}},
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}1`, {paymentBankAccountID: 1});
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(await findLockedSwitch('workspace.moreFeatures.expensifyCard.subtitle'));

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.moreFeatures.expensifyCard.disableCardPrompt'))).toBeOnTheScreen();
            });
            fireEvent.press(await screen.findByLabelText(TestHelper.translateLocal('workspace.moreFeatures.expensifyCard.disableCardButton')));
            await waitForBatchedUpdatesWithAct();

            expect(navigateToConciergeChatSpy).toHaveBeenCalledTimes(1);
        });

        it('opens Concierge chat when the user confirms the Company Cards disable warning', async () => {
            await TestHelper.signInWithTestUser();
            getCompanyFeedsMock.mockReturnValue({someFeed: {}} as ReturnType<typeof CardUtils.getCompanyFeeds>);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID, areCompanyCardsEnabled: true}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(await findLockedSwitch('workspace.moreFeatures.companyCards.subtitle'));

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.moreFeatures.companyCards.disableCardPrompt'))).toBeOnTheScreen();
            });
            fireEvent.press(await screen.findByLabelText(TestHelper.translateLocal('workspace.moreFeatures.companyCards.disableCardButton')));
            await waitForBatchedUpdatesWithAct();

            expect(navigateToConciergeChatSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Receipt partners (informational warning, no confirm action)', () => {
        it('opens the disconnect-Uber info modal without a Cancel button when locked', async () => {
            await TestHelper.signInWithTestUser();
            useIsUberConnectedMock.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy({id: POLICY_ID}));
            });

            renderPage({policyID: POLICY_ID});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(await findLockedSwitch('workspace.moreFeatures.receiptPartners.subtitle'));

            await waitFor(() => {
                expect(screen.getByText(TestHelper.translateLocal('workspace.moreFeatures.receiptPartnersWarningModal.disconnectText'))).toBeOnTheScreen();
            });
            expect(screen.queryByText(TestHelper.translateLocal('common.cancel'))).toBeNull();

            fireEvent.press(await screen.findByLabelText(TestHelper.translateLocal('workspace.moreFeatures.receiptPartnersWarningModal.confirmText')));
            await waitForBatchedUpdatesWithAct();

            expect(navigateSpy).not.toHaveBeenCalled();
            expect(navigateToConciergeChatSpy).not.toHaveBeenCalled();
        });
    });
});
