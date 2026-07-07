import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceTaxRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import type {WorkspaceTaxTableRowData} from '@components/Tables/WorkspaceTaxesTable';
import WorkspaceTaxesTable from '@components/Tables/WorkspaceTaxesTable';
import Text from '@components/Text';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearTaxRateError, deletePolicyTaxes, setPolicyTaxesEnabled} from '@libs/actions/TaxRate';
import {getLatestErrorFieldForAnyField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    canEditTaxRate as canEditTaxRatePolicyUtils,
    getConnectedIntegration,
    getCurrentConnectionName,
    hasAccountingConnections as hasAccountingConnectionsPolicyUtils,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import {openPolicyTaxesPage} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TaxRate} from '@src/types/onyx';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

type WorkspaceTaxesPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES>;

function WorkspaceTaxesPage({
    policy,
    route: {
        params: {policyID},
    },
}: WorkspaceTaxesPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.taxes');
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [selectedTaxesIDs, setSelectedTaxesIDs] = useState<string[]>([]);
    const {showConfirmModal} = useConfirmModal();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {canWrite: canWriteTaxes, showReadOnlyModal, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.TAXES);
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const syncingAccountingIntegration = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.find((connectionName) => connectionName === connectionSyncProgress?.connectionName);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);

    const connectedIntegration = getConnectedIntegration(policy) ?? syncingAccountingIntegration;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);

    const enabledRatesCount = selectedTaxesIDs.filter((taxID) => !policy?.taxRates?.taxes[taxID]?.isDisabled).length;
    const disabledRatesCount = selectedTaxesIDs.length - enabledRatesCount;
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Close', 'Gear', 'Plus', 'Trashcan']);
    const illustrations = useMemoizedLazyIllustrations(['Coins']);

    const fetchTaxes = useCallback(() => {
        openPolicyTaxesPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchTaxes});

    useEffect(() => {
        fetchTaxes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearTableSelection = useCallback(() => {
        setSelectedTaxesIDs((prevSelectedTaxesIDs) => (prevSelectedTaxesIDs.length > 0 ? [] : prevSelectedTaxesIDs));
    }, []);

    useCleanupSelectedOptions(clearTableSelection);

    useEffect(() => {
        if (selectedTaxesIDs.length === 0) {
            return;
        }

        setSelectedTaxesIDs((prevSelectedTaxesIDs) => {
            const newSelectedTaxesIDs = [];

            for (const taxID of prevSelectedTaxesIDs) {
                if (
                    policy?.taxRates?.taxes?.[taxID] &&
                    policy?.taxRates?.taxes?.[taxID].pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                    canEditTaxRatePolicyUtils(policy, taxID)
                ) {
                    newSelectedTaxesIDs.push(taxID);
                }
            }

            return newSelectedTaxesIDs;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policy?.taxRates?.taxes]);

    useSearchBackPress({
        onClearSelection: clearTableSelection,
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const textForDefault = useCallback(
        (taxID: string, taxRate: TaxRate): string => {
            let suffix;
            if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
                suffix = translate('common.default');
            } else if (taxID === defaultExternalID) {
                suffix = translate('workspace.taxes.workspaceDefault');
            } else if (taxID === foreignTaxDefault) {
                suffix = translate('workspace.taxes.foreignDefault');
            }
            if (suffix) {
                return `${taxRate.value} ${CONST.DOT_SEPARATOR} ${suffix}`;
            }
            return `${taxRate.value}`;
        },
        [defaultExternalID, foreignTaxDefault, translate],
    );

    const updateWorkspaceTaxEnabled = useCallback(
        (value: boolean, taxID: string) => {
            if (!canWriteTaxes) {
                showReadOnlyModal();
                return;
            }
            setPolicyTaxesEnabled(policy, [taxID], value);
        },
        [canWriteTaxes, policy, showReadOnlyModal],
    );

    const navigateToEditTaxRate = useCallback(
        (taxID: string) => {
            Navigation.navigate(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID, taxID));
        },
        [policyID],
    );

    const taxRows = useMemo<WorkspaceTaxTableRowData[]>(() => {
        if (!policy) {
            return [];
        }

        return Object.entries(policy.taxRates?.taxes ?? {}).reduce<WorkspaceTaxTableRowData[]>((acc, [key, value]) => {
            const isDeleting = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (!isOffline && isDeleting) {
                return acc;
            }

            const canEditTaxRate = canWriteTaxes && canEditTaxRatePolicyUtils(policy, key);

            acc.push({
                keyForList: key,
                name: value.name,
                alternateText: textForDefault(key, value),
                enabled: !value.isDisabled,
                disabled: isDeleting || !canEditTaxRatePolicyUtils(policy, key),
                isLocked: !canEditTaxRate,
                isSwitchDisabled: !canEditTaxRate || isDeleting,
                pendingAction: value.pendingAction ?? (Object.keys(value.pendingFields ?? {}).length > 0 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
                errors: value.errors ?? getLatestErrorFieldForAnyField(value),
                action: () => navigateToEditTaxRate(key),
                onToggleEnabled: (newValue: boolean) => updateWorkspaceTaxEnabled(newValue, key),
                onDisabledSwitchPress: withReadOnlyFallback(),
                onClose: () => clearTaxRateError(policyID, key, value.pendingAction),
            });

            return acc;
        }, []);
    }, [canWriteTaxes, isOffline, navigateToEditTaxRate, policy, policyID, textForDefault, updateWorkspaceTaxEnabled, withReadOnlyFallback]);

    const hasVisibleTaxes = taxRows.length > 0;
    const isLoading = !isOffline && !policy?.taxRates;
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'WorkspaceTaxesPage', isOffline, isTaxesListUndefined: !policy?.taxRates};

    const deleteTaxes = useCallback(() => {
        if (!policy?.id) {
            return;
        }
        deletePolicyTaxes(policy, selectedTaxesIDs, localeCompare);

        setSelectedTaxesIDs([]);
    }, [policy, selectedTaxesIDs, localeCompare]);

    const toggleTaxes = useCallback(
        (isEnabled: boolean) => {
            if (!policy?.id) {
                return;
            }
            setPolicyTaxesEnabled(policy, selectedTaxesIDs, isEnabled);
            setSelectedTaxesIDs([]);
        },
        [policy, selectedTaxesIDs],
    );

    const dropdownMenuOptions = useMemo(() => {
        const isMultiple = selectedTaxesIDs.length > 1;
        const options: Array<DropdownOption<WorkspaceTaxRatesBulkActionType>> = [];
        if (!hasAccountingConnections) {
            options.push({
                icon: icons.Trashcan,
                text: isMultiple ? translate('workspace.taxes.actions.deleteMultiple') : translate('workspace.taxes.actions.delete'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: async () => {
                    const {action} = await showConfirmModal({
                        title: translate('workspace.taxes.actions.delete'),
                        prompt:
                            selectedTaxesIDs.length > 1
                                ? translate('workspace.taxes.deleteMultipleTaxConfirmation', selectedTaxesIDs.length)
                                : translate('workspace.taxes.deleteTaxConfirmation'),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });
                    if (action === ModalActions.CONFIRM) {
                        deleteTaxes();
                    }
                },
            });
        }

        // `Disable rates` when at least one enabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => !policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: icons.Close,
                text: translate('workspace.taxes.actions.disableTaxRates', {count: enabledRatesCount}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: () => toggleTaxes(false),
            });
        }

        // `Enable rates` when at least one disabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: icons.Checkmark,
                text: translate('workspace.taxes.actions.enableTaxRates', {count: disabledRatesCount}),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: () => toggleTaxes(true),
            });
        }
        return options;
    }, [
        hasAccountingConnections,
        icons.Checkmark,
        icons.Close,
        icons.Trashcan,
        policy?.taxRates?.taxes,
        selectedTaxesIDs,
        toggleTaxes,
        translate,
        enabledRatesCount,
        disabledRatesCount,
        showConfirmModal,
        deleteTaxes,
    ]);

    const shouldShowBulkActionsButton = canWriteTaxes && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : selectedTaxesIDs.length > 0);

    const secondaryActions = useMemo(
        () => [
            {
                icon: icons.Gear,
                text: translate('common.settings'),
                onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID)),
                value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
            },
        ],
        [icons.Gear, policyID, translate],
    );

    const getHeaderButtons = () => {
        if (!canWriteTaxes) {
            return null;
        }

        if (!shouldShowBulkActionsButton) {
            return (
                <View style={[!isInLandscapeMode && styles.w100, styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
                    {!hasAccountingConnections && (
                        <Button
                            success
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_CREATE.getRoute(policyID))}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAXES.ADD_BUTTON}
                            icon={icons.Plus}
                            text={translate('workspace.taxes.addRate')}
                            style={[shouldDisplayButtonsInSeparateLine && styles.flex1]}
                        />
                    )}
                    <ButtonWithDropdownMenu
                        success={false}
                        onPress={() => {}}
                        shouldUseOptionIcon
                        customText={translate('common.more')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAXES.MORE_DROPDOWN}
                        options={secondaryActions}
                        isSplitButton={false}
                        wrapperStyle={hasAccountingConnections ? styles.flexGrow1 : styles.flexGrow0}
                    />
                </View>
            );
        }

        return (
            <ButtonWithDropdownMenu<WorkspaceTaxRatesBulkActionType>
                onPress={() => {}}
                options={dropdownMenuOptions}
                buttonSize={CONST.BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {count: selectedTaxesIDs.length})}
                shouldAlwaysShowDropdownMenu
                isSplitButton={false}
                style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                isDisabled={!selectedTaxesIDs.length}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAXES.BULK_ACTIONS_DROPDOWN}
            />
        );
    };

    const headerButtons = getHeaderButtons();

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const headerContent = (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {!hasSyncError && isConnectionVerified && currentConnectionName ? (
                <ImportedFromAccountingSoftware
                    policyID={policyID}
                    currentConnectionName={currentConnectionName}
                    connectedIntegration={connectedIntegration}
                    translatedText={translate('workspace.taxes.importedFromAccountingSoftware')}
                />
            ) : (
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.taxes.subtitle')}</Text>
            )}
        </View>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.TAXES}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={[styles.defaultModalContainer]}
                testID="WorkspaceTaxesPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={!selectionModeHeader ? illustrations.Coins : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.taxes')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldDisplayHelpButton
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            clearTableSelection();
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!shouldDisplayButtonsInSeparateLine && headerButtons}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && !!headerButtons && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}
                {(!hasVisibleTaxes || isLoading) && headerContent}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        reasonAttributes={reasonAttributes}
                    />
                )}
                {!isLoading && (
                    <WorkspaceTaxesTable
                        taxes={taxRows}
                        selectionEnabled={canWriteTaxes}
                        selectedKeys={selectedTaxesIDs}
                        onRowSelectionChange={setSelectedTaxesIDs}
                        headerComponent={hasVisibleTaxes ? headerContent : undefined}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceTaxesPage);
