import ActivityIndicator from '@components/ActivityIndicator';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderCentralPane from '@components/Header/composed/HeaderCentralPane';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import ScreenWrapper from '@components/ScreenWrapper';
import type {WorkspaceVendorTableRowData} from '@components/Tables/WorkspaceVendorsTable';
import WorkspaceVendorsTable from '@components/Tables/WorkspaceVendorsTable';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearVendorErrors, setPolicyVendorsEnabled} from '@libs/actions/Policy/Vendor';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getActiveVendorMatchingIntegration, getDefaultVendorID, hasVendorFeature, sortVendors} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PolicyVendors} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type VendorBulkActionsProps = {
    policyID: string;
    selectedVendorKeys: string[];
    policyVendors?: OnyxEntry<PolicyVendors>;
    defaultVendorID?: string;
    onClearSelection: () => void;
};

function VendorBulkActions({policyID, selectedVendorKeys, policyVendors, defaultVendorID, onClearSelection}: VendorBulkActionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Close']);

    const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
    const disabledVendors = selectedVendorKeys.filter((id) => !policyVendors?.[id]?.enabled);
    if (disabledVendors.length > 0) {
        options.push({
            icon: icons.Checkmark,
            text: translate(disabledVendors.length === 1 ? 'workspace.vendors.enableVendor' : 'workspace.vendors.enableVendors'),
            value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
            onSelected: () => {
                onClearSelection();
                setPolicyVendorsEnabled({
                    policyID,
                    vendorIDs: disabledVendors,
                    enabled: true,
                    policyVendors,
                });
            },
        });
    }

    const vendorsToDisable = selectedVendorKeys.filter((id) => policyVendors?.[id]?.enabled && id !== defaultVendorID);
    if (vendorsToDisable.length > 0) {
        options.push({
            icon: icons.Close,
            text: translate(vendorsToDisable.length === 1 ? 'workspace.vendors.disableVendor' : 'workspace.vendors.disableVendors'),
            value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
            onSelected: () => {
                onClearSelection();
                setPolicyVendorsEnabled({
                    policyID,
                    vendorIDs: vendorsToDisable,
                    enabled: false,
                    policyVendors,
                });
            },
        });
    }

    if (options.length === 0) {
        return null;
    }

    return (
        <ButtonWithDropdownMenu
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => null}
            shouldAlwaysShowDropdownMenu
            size={CONST.BUTTON_SIZE.MEDIUM}
            customText={translate('workspace.common.selected', {count: selectedVendorKeys.length})}
            options={options}
            isSplitButton={false}
            style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
            isDisabled={!selectedVendorKeys.length}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INITIAL.VENDORS}
            testID="WorkspaceVendorsPage-header-dropdown-menu-button"
        />
    );
}

VendorBulkActions.displayName = 'VendorBulkActions';

type WorkspaceVendorsPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VENDORS>;

function WorkspaceVendorsPage({policy, route}: WorkspaceVendorsPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {canWrite: canWriteVendors, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.VENDORS);

    const [policyVendors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}`);
    const [selectedVendorKeys, setSelectedVendorKeys] = useFilteredSelection(policyVendors, (vendor) => !!vendor);

    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.vendors');

    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const isFeatureAvailable = hasVendorFeature(policy, isVendorMatchingBetaEnabled);
    const connectedIntegration = getActiveVendorMatchingIntegration(policy);
    const currentConnectionName = connectedIntegration ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectedIntegration] : undefined;
    const defaultVendorID = getDefaultVendorID(policy, connectedIntegration);

    const canSelectMultiple = canWriteVendors && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true);

    const clearTableSelection = () => {
        setSelectedVendorKeys((prev) => (prev.length > 0 ? [] : prev));
    };

    useCleanupSelectedOptions(clearTableSelection);

    useSearchBackPress({
        onClearSelection: clearTableSelection,
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const handleVendorToggle = (enabled: boolean, vendorID: string) => {
        if (!canWriteVendors) {
            showReadOnlyModal();
            return;
        }

        if (!enabled && vendorID === defaultVendorID) {
            return;
        }

        setPolicyVendorsEnabled({
            policyID,
            vendorIDs: [vendorID],
            enabled,
            policyVendors,
        });
    };

    const sortedVendors = sortVendors(Object.values(policyVendors ?? {}), localeCompare);

    const vendorRows: WorkspaceVendorTableRowData[] = sortedVendors.map((vendor) => {
        const isDefaultVendor = vendor.externalID === defaultVendorID;
        const isLocked = (vendor.enabled && isDefaultVendor) || !canWriteVendors;

        return {
            keyForList: vendor.externalID,
            name: vendor.name,
            enabled: vendor.enabled,
            disabled: !canWriteVendors,
            isLocked,
            errors: vendor.errors ?? undefined,
            pendingAction: vendor.pendingAction,
            onToggleEnabled: (enabled: boolean) => handleVendorToggle(enabled, vendor.externalID),
            dismissError: () => clearVendorErrors(policyID, vendor.externalID),
        };
    });

    const headerContent = currentConnectionName ? (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <ImportedFromAccountingSoftware
                policyID={policyID}
                currentConnectionName={currentConnectionName}
                connectedIntegration={connectedIntegration}
                translatedText={translate('workspace.vendors.managedInAccountingSoftware')}
            />
        </View>
    ) : undefined;

    const canShowBulkActions = canWriteVendors && selectedVendorKeys.length > 0;
    const isLoading = !isOffline && policyVendors === undefined;
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.VENDORS}
            shouldBeBlocked={!isFeatureAvailable}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={[styles.defaultModalContainer]}
                testID="WorkspaceVendorsPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderCentralPane
                    isHeadline={!selectionModeHeader}
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.vendors')}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            clearTableSelection();
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!shouldDisplayButtonsInSeparateLine && canShowBulkActions && (
                        <VendorBulkActions
                            policyID={policyID}
                            selectedVendorKeys={selectedVendorKeys}
                            policyVendors={policyVendors}
                            defaultVendorID={defaultVendorID}
                            onClearSelection={clearTableSelection}
                        />
                    )}
                </HeaderCentralPane>
                {shouldDisplayButtonsInSeparateLine && canShowBulkActions && (
                    <View style={[styles.pl5, styles.pr5]}>
                        <VendorBulkActions
                            policyID={policyID}
                            selectedVendorKeys={selectedVendorKeys}
                            policyVendors={policyVendors}
                            defaultVendorID={defaultVendorID}
                            onClearSelection={clearTableSelection}
                        />
                    </View>
                )}

                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}

                {!isLoading && (
                    <WorkspaceVendorsTable
                        vendors={vendorRows}
                        selectionEnabled={canSelectMultiple}
                        selectedKeys={selectedVendorKeys}
                        onRowSelectionChange={setSelectedVendorKeys}
                        headerComponent={headerContent}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceVendorsPage.displayName = 'WorkspaceVendorsPage';

export default withPolicyConnections(WorkspaceVendorsPage);
