import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PopoverContextProvider from '@components/PopoverProvider';
import * as measureTooltipCoordinateModule from '@components/Tooltip/EducationalTooltip/measureTooltipCoordinate';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import * as VendorActions from '@libs/actions/Policy/Vendor';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceVendorDetailsPage from '@pages/workspace/vendors/WorkspaceVendorDetailsPage';
import WorkspaceVendorsPage from '@pages/workspace/vendors/WorkspaceVendorsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, PolicyVendors} from '@src/types/onyx';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.mock('@libs/actions/Policy/Vendor', () => ({
    ...jest.requireActual<typeof VendorActions>('@libs/actions/Policy/Vendor'),
    openPolicyVendorsPage: jest.fn(),
    setPolicyVendorsEnabled: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
    useIsDisplayedInWideRHP: () => false,
}));

const mockSetPolicyVendorsEnabled = jest.mocked(VendorActions.setPolicyVendorsEnabled);

const WIDE_LAYOUT: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isInLandscapeMode: false,
};

const POLICY_ID = 'policy-vendors-1';
const VENDOR_ID = '122';
const DEFAULT_VENDOR_ID = 'default-1';
const ERROR_KEY = '1';
const VendorsListStack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();
const VendorDetailsStack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function buildQBOPolicy(defaultVendorID?: string): Policy {
    return createMock<Policy>({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        outputCurrency: CONST.CURRENCY.USD,
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {
                    nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                    nonReimbursableCreditCardDefaultVendor: defaultVendorID,
                },
                data: {
                    vendors: [],
                },
            },
        },
    });
}

function buildIntacctPolicy(defaultVendorID?: string): Policy {
    return createMock<Policy>({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        outputCurrency: CONST.CURRENCY.USD,
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                config: {
                    export: {
                        nonReimbursable: CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
                        nonReimbursableCreditCardChargeDefaultVendor: defaultVendorID,
                    },
                },
                data: {
                    vendors: [],
                },
            },
        },
    });
}

function buildXeroPolicy(defaultVendorID?: string): Policy {
    return createMock<Policy>({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        outputCurrency: CONST.CURRENCY.USD,
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                config: {
                    isConfigured: true,
                    defaultVendor: defaultVendorID,
                },
                data: {
                    contacts: {},
                },
            },
        },
    });
}

async function renderVendorsPage(policy: Policy, policyVendors: PolicyVendors) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${POLICY_ID}`, policyVendors);
    });

    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PopoverContextProvider>
                <PortalProvider>
                    <ModalProvider>
                        <NavigationContainer>
                            <VendorsListStack.Navigator initialRouteName={SCREENS.WORKSPACE.VENDORS}>
                                <VendorsListStack.Screen
                                    name={SCREENS.WORKSPACE.VENDORS}
                                    initialParams={{policyID: POLICY_ID}}
                                >
                                    {(props) => (
                                        <WorkspaceVendorsPage
                                            {...props}
                                            isConnectionDataFetchNeeded={false}
                                        />
                                    )}
                                </VendorsListStack.Screen>
                            </VendorsListStack.Navigator>
                        </NavigationContainer>
                    </ModalProvider>
                </PortalProvider>
            </PopoverContextProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function renderVendorDetailsPage(policy: Policy, policyVendors: PolicyVendors, vendorID: string) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${POLICY_ID}`, policyVendors);
    });

    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PopoverContextProvider>
                <PortalProvider>
                    <ModalProvider>
                        <NavigationContainer>
                            <VendorDetailsStack.Navigator initialRouteName={SCREENS.WORKSPACE.VENDOR_DETAILS}>
                                <VendorDetailsStack.Screen
                                    name={SCREENS.WORKSPACE.VENDOR_DETAILS}
                                    component={WorkspaceVendorDetailsPage}
                                    initialParams={{policyID: POLICY_ID, vendorID}}
                                />
                            </VendorDetailsStack.Navigator>
                        </NavigationContainer>
                    </ModalProvider>
                </PortalProvider>
            </PopoverContextProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('WorkspaceVendorsPage and WorkspaceVendorDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(WIDE_LAYOUT);
        jest.spyOn(measureTooltipCoordinateModule, 'getTooltipCoordinates').mockImplementation((_target, callback) => {
            callback({x: 200, y: 80, width: 50, height: 28});
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('WorkspaceVendorsPage row navigation', () => {
        it('opens the vendor details RHP when a vendor row is pressed', async () => {
            // Given a workspace with an imported vendor in policyVendors_
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            await renderVendorsPage(buildQBOPolicy(), {
                [VENDOR_ID]: {externalID: VENDOR_ID, name: 'AB Consulting', enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO},
            });

            // When the admin clicks the vendor row
            fireEvent.press(screen.getByLabelText('AB Consulting, Enabled'));

            // Then navigation opens that vendor's details RHP
            expect(navigateSpy).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_VENDOR_DETAILS.getRoute(POLICY_ID, VENDOR_ID));
        });

        it('keeps row checkbox selection and row toggle from opening the RHP', async () => {
            // Given a workspace with an imported vendor
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            await renderVendorsPage(buildQBOPolicy(), {
                [VENDOR_ID]: {externalID: VENDOR_ID, name: 'AB Consulting', enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO},
            });

            // When the admin clicks the row checkbox and then the row enable toggle
            fireEvent.press(screen.getAllByLabelText(TestHelper.translateLocal('common.select'))[0]);
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: `${TestHelper.translateLocal('workspace.vendors.enableVendor')}: AB Consulting`}));
            await waitForBatchedUpdatesWithAct();

            // Then the RHP does not open and setPolicyVendorsEnabled is dispatched for the row toggle
            expect(navigateSpy).not.toHaveBeenCalled();
            expect(mockSetPolicyVendorsEnabled).toHaveBeenCalledWith(
                expect.objectContaining({
                    policyID: POLICY_ID,
                    vendorIDs: [VENDOR_ID],
                    enabled: false,
                }),
            );
        });

        it('shows the accounting export settings tooltip when pressing a locked default vendor row toggle', async () => {
            // Given a workspace whose default vendor appears in the Vendors table
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            await renderVendorsPage(buildQBOPolicy(DEFAULT_VENDOR_ID), {
                [DEFAULT_VENDOR_ID]: {externalID: DEFAULT_VENDOR_ID, name: 'Default Vendor', enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO},
            });

            // When the admin presses the locked row toggle
            const toggle = screen.getByRole(CONST.ROLE.SWITCH, {
                name: `${TestHelper.translateLocal('workspace.vendors.enableVendor')}: Default Vendor, ${TestHelper.translateLocal('common.locked')}`,
            });
            fireEvent.press(toggle);
            await waitForBatchedUpdatesWithAct();

            // Then the RHP does not open, no disable call is sent, and the tooltip link routes to accounting export settings
            expect(mockSetPolicyVendorsEnabled).not.toHaveBeenCalled();
            expect(navigateSpy).not.toHaveBeenCalled();
            const exportSettingsLink = await screen.findByText(TestHelper.translateLocal('workspace.vendors.accountingExportSettings'));
            expect(exportSettingsLink).toBeOnTheScreen();

            fireEvent.press(exportSettingsLink, {preventDefault: jest.fn()});
            await waitForBatchedUpdatesWithAct();
            expect(navigateSpy).toHaveBeenCalledWith(`workspaces/${POLICY_ID}/connections/accounting/quickbooks-online/export`);
        });
    });

    describe('WorkspaceVendorDetailsPage', () => {
        it('renders Enable vendor, read-only Name, and read-only External ID', async () => {
            // Given an enabled vendor with an external ID
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            await renderVendorDetailsPage(
                buildQBOPolicy(),
                {
                    [VENDOR_ID]: {externalID: VENDOR_ID, name: 'AB Consulting', enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO},
                },
                VENDOR_ID,
            );

            // Then the RHP shows Enable vendor on, Name, and External ID
            const toggle = screen.getByRole(CONST.ROLE.SWITCH, {name: TestHelper.translateLocal('workspace.vendors.enableVendor')});
            expect(toggle.props.accessibilityState).toMatchObject({checked: true});
            expect(screen.getByText(TestHelper.translateLocal('common.name'))).toBeOnTheScreen();
            expect(screen.getByText(TestHelper.translateLocal('workspace.vendors.externalID'))).toBeOnTheScreen();
            expect(screen.getByText(VENDOR_ID)).toBeOnTheScreen();

            // When tapping Name or External ID
            fireEvent.press(screen.getByLabelText(`${TestHelper.translateLocal('common.name')}, AB Consulting`));
            fireEvent.press(screen.getByLabelText(`${TestHelper.translateLocal('workspace.vendors.externalID')}, ${VENDOR_ID}`));

            // Then nothing happens and no navigation occurs
            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('renders an empty External ID field when the normalized vendor entry has no externalID', async () => {
            // Given a vendor entry with an empty externalID
            // When the vendor details RHP renders for that vendor
            await renderVendorDetailsPage(
                buildQBOPolicy(),
                {
                    vendorKeyNoExternalID: {externalID: '', name: 'Manual Vendor', enabled: true},
                },
                'vendorKeyNoExternalID',
            );

            // Then Name shows the vendor name and External ID renders with an empty value
            expect(screen.getByLabelText(`${TestHelper.translateLocal('common.name')}, Manual Vendor`)).toBeOnTheScreen();
            expect(screen.getByLabelText(TestHelper.translateLocal('workspace.vendors.externalID'))).toBeOnTheScreen();
        });

        it('toggles vendor enablement through setPolicyVendorsEnabled and stays open', async () => {
            // Given an enabled non-default vendor in the RHP
            const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            await renderVendorDetailsPage(
                buildQBOPolicy(),
                {
                    [VENDOR_ID]: {externalID: VENDOR_ID, name: 'Bright Horizons', enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO},
                },
                VENDOR_ID,
            );

            // When the admin turns Enable vendor off
            fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: TestHelper.translateLocal('workspace.vendors.enableVendor')}));
            await waitForBatchedUpdatesWithAct();

            // Then setPolicyVendorsEnabled is called with the single externalID and the RHP stays open
            expect(mockSetPolicyVendorsEnabled).toHaveBeenCalledWith(
                expect.objectContaining({
                    policyID: POLICY_ID,
                    vendorIDs: [VENDOR_ID],
                    enabled: false,
                }),
            );
            expect(goBackSpy).not.toHaveBeenCalled();
        });

        it('shows an inline error when the vendor update fails and reverts the toggle', async () => {
            // Given a vendor whose toggle command fails with failureData
            await renderVendorDetailsPage(
                buildQBOPolicy(),
                {
                    [VENDOR_ID]: {externalID: VENDOR_ID, name: 'Bright Horizons', enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO},
                },
                VENDOR_ID,
            );

            // When the vendor receives an error from failureData while staying enabled
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${POLICY_ID}`, {
                    [VENDOR_ID]: {
                        enabled: true,
                        errors: {[ERROR_KEY]: TestHelper.translateLocal('workspace.vendors.updateFailureMessage')},
                    },
                });
            });
            await waitForBatchedUpdatesWithAct();

            // Then the toggle remains on and the inline error message is displayed
            const toggle = screen.getByRole(CONST.ROLE.SWITCH, {name: TestHelper.translateLocal('workspace.vendors.enableVendor')});
            expect(toggle.props.accessibilityState).toMatchObject({checked: true});
            expect(screen.getByText(TestHelper.translateLocal('workspace.vendors.updateFailureMessage'))).toBeOnTheScreen();
        });

        it.each<[string, (defaultVendorID: string) => Policy, PolicyConnectionName, string]>([
            ['QBO', buildQBOPolicy, CONST.POLICY.CONNECTIONS.NAME.QBO, `workspaces/${POLICY_ID}/connections/accounting/quickbooks-online/export`],
            ['Sage Intacct', buildIntacctPolicy, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, `workspaces/${POLICY_ID}/connections/accounting/sage-intacct/export`],
            ['Xero', buildXeroPolicy, CONST.POLICY.CONNECTIONS.NAME.XERO, `workspaces/${POLICY_ID}/connections/accounting/xero/export`],
        ])('locks the default vendor toggle and links to accounting export settings on %s', async (_label, buildPolicy, origin, expectedExportRoute) => {
            // Given the workspace's default vendor for this accounting integration
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            await renderVendorDetailsPage(
                buildPolicy(DEFAULT_VENDOR_ID),
                {
                    [DEFAULT_VENDOR_ID]: {
                        externalID: DEFAULT_VENDOR_ID,
                        name: 'Default Vendor',
                        enabled: true,
                        origin,
                    },
                },
                DEFAULT_VENDOR_ID,
            );

            // Then the toggle is on and shows the lock icon
            const toggle = screen.getByRole(CONST.ROLE.SWITCH, {
                name: `${TestHelper.translateLocal('workspace.vendors.enableVendor')}, ${TestHelper.translateLocal('common.locked')}`,
            });
            expect(toggle.props.accessibilityState).toMatchObject({checked: true});
            expect(screen.getByTestId(CONST.SWITCH_LOCK_ICON_TEST_ID, {includeHiddenElements: true})).toBeOnTheScreen();

            // When the admin clicks the locked toggle
            fireEvent.press(toggle);
            await waitForBatchedUpdatesWithAct();

            // Then no disable request is dispatched and the tooltip with the export settings link appears
            expect(mockSetPolicyVendorsEnabled).not.toHaveBeenCalled();
            const exportSettingsLink = await screen.findByText(TestHelper.translateLocal('workspace.vendors.accountingExportSettings'));
            expect(exportSettingsLink).toBeOnTheScreen();

            // When the admin presses the accounting export settings link
            fireEvent.press(exportSettingsLink, {preventDefault: jest.fn()});
            await waitForBatchedUpdatesWithAct();

            // Then navigation routes to that connection's accounting export settings
            expect(navigateSpy).toHaveBeenCalledWith(expectedExportRoute);
        });

        it('unlocks the vendor once the workspace default vendor changes to another vendor', async () => {
            // Given a vendor that starts as the workspace's default vendor
            await renderVendorDetailsPage(
                buildQBOPolicy(VENDOR_ID),
                {
                    [VENDOR_ID]: {externalID: VENDOR_ID, name: 'AB Consulting', enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO},
                },
                VENDOR_ID,
            );
            expect(screen.getByTestId(CONST.SWITCH_LOCK_ICON_TEST_ID, {includeHiddenElements: true})).toBeOnTheScreen();

            // When the default vendor changes to another vendor
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildQBOPolicy('999'));
            });
            await waitForBatchedUpdatesWithAct();

            // Then the lock disappears and the toggle works
            await waitFor(() => {
                expect(screen.queryByTestId(CONST.SWITCH_LOCK_ICON_TEST_ID, {includeHiddenElements: true})).toBeNull();
            });
            fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: TestHelper.translateLocal('workspace.vendors.enableVendor')}));
            await waitForBatchedUpdatesWithAct();
            expect(mockSetPolicyVendorsEnabled).toHaveBeenCalledWith(expect.objectContaining({vendorIDs: [VENDOR_ID], enabled: false}));
        });

        it('renders NotFoundPage when the vendor is no longer present in policyVendors_', async () => {
            // Given a vendor ID that is no longer in policyVendors_ after a sync
            // When the vendor details RHP renders for that removed vendor
            await renderVendorDetailsPage(buildQBOPolicy(), {}, 'removed-vendor');

            // Then the vendor details RHP is not rendered
            expect(screen.queryByTestId('WorkspaceVendorDetailsPage')).toBeNull();
        });
    });
});
