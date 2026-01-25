import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceTaxRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearTaxRateError, deletePolicyTaxes, setPolicyTaxesEnabled} from '@libs/actions/TaxRate';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
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
import tokenizedSearch from '@libs/tokenizedSearch';
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

type WorkspaceTaxesPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES>;

function WorkspaceTaxesPage({
    policy,
    route: {
        params: {policyID},
    },
}: WorkspaceTaxesPageProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [selectedTaxesIDs, setSelectedTaxesIDs] = useState<string[]>([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);

    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;

    const enabledRatesCount = selectedTaxesIDs.filter((taxID) => !policy?.taxRates?.taxes[taxID]?.isDisabled).length;
    const disabledRatesCount = selectedTaxesIDs.length - enabledRatesCount;
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'Plus', 'Trashcan', 'Close', 'Checkmark'] as const);
    const illustrations = useMemoizedLazyIllustrations(['Coins'] as const);

    const fetchTaxes = useCallback(() => {
        openPolicyTaxesPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchTaxes});

    useEffect(() => {
        fetchTaxes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cleanupSelectedOption = useCallback(() => setSelectedTaxesIDs([]), []);
    useCleanupSelectedOptions(cleanupSelectedOption);

    useEffect(() => {
        if (selectedTaxesIDs.length === 0 || !canSelectMultiple) {
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
        onClearSelection: () => {
            setSelectedTaxesIDs([]);
        },
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
            setPolicyTaxesEnabled(policy, [taxID], value);
        },
        [policy],
    );

    const taxesList = useMemo<ListItem[]>(() => {
        if (!policy) {
            return [];
        }
        return Object.entries(policy.taxRates?.taxes ?? {}).map(([key, value]) => {
            const canEditTaxRate = policy && canEditTaxRatePolicyUtils(policy, key);

            return {
                text: value.name,
                alternateText: textForDefault(key, value),
                keyForList: key,
                isDisabledCheckbox: !canEditTaxRatePolicyUtils(policy, key),
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: value.pendingAction ?? (Object.keys(value.pendingFields ?? {}).length > 0 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
                errors: value.errors ?? getLatestErrorFieldForAnyField(value),
                rightElement: (
                    <Switch
                        isOn={!value.isDisabled}
                        disabled={!canEditTaxRate || value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                        accessibilityLabel={translate('workspace.taxes.actions.enable')}
                        onToggle={(newValue: boolean) => updateWorkspaceTaxEnabled(newValue, key)}
                    />
                ),
            };
        });
    }, [policy, textForDefault, translate, updateWorkspaceTaxEnabled]);

    const filterTax = useCallback((tax: ListItem, searchInput: string) => {
        const results = tokenizedSearch([tax], searchInput, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    }, []);
    const sortTaxes = useCallback(
        (taxes: ListItem[]) => {
            return taxes.sort((a, b) => {
                const aText = a.text ?? a.keyForList ?? '';
                const bText = b.text ?? b.keyForList ?? '';
                return localeCompare(aText, bText);
            });
        },
        [localeCompare],
    );
    const [inputValue, setInputValue, filteredTaxesList] = useSearchResults(taxesList, filterTax, sortTaxes);

    const isLoading = !isOffline && taxesList === undefined;

    const toggleTax = (tax: ListItem) => {
        const key = tax.keyForList;
        if (typeof key !== 'string' || key === defaultExternalID || key === foreignTaxDefault) {
            return;
        }

        setSelectedTaxesIDs((prev) => {
            if (prev?.includes(key)) {
                return prev.filter((item) => item !== key);
            }
            return [...prev, key];
        });
    };

    const toggleAllTaxes = () => {
        const taxesToSelect = filteredTaxesList.filter(
            (tax) => tax.keyForList !== defaultExternalID && tax.keyForList !== foreignTaxDefault && tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        setSelectedTaxesIDs((prev) => {
            if (prev.length > 0) {
                return [];
            }
            return taxesToSelect.map((item) => (item.keyForList ? item.keyForList : ''));
        });
    };

    const getCustomListHeader = () => {
        if (filteredTaxesList.length === 0) {
            return null;
        }
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate('common.enabled')}
                shouldShowRightCaret
            />
        );
    };

    const deleteTaxes = useCallback(() => {
        if (!policy?.id) {
            return;
        }
        deletePolicyTaxes(policy, selectedTaxesIDs, localeCompare);
        setIsDeleteModalVisible(false);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedTaxesIDs([]);
        });
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

    const navigateToEditTaxRate = (taxRate: ListItem) => {
        if (!taxRate.keyForList) {
            return;
        }
        if (isSmallScreenWidth && isMobileSelectionModeEnabled) {
            toggleTax(taxRate);
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID, taxRate.keyForList));
    };

    const dropdownMenuOptions = useMemo(() => {
        const isMultiple = selectedTaxesIDs.length > 1;
        const options: Array<DropdownOption<WorkspaceTaxRatesBulkActionType>> = [];
        if (!hasAccountingConnections) {
            options.push({
                icon: icons.Trashcan,
                text: isMultiple ? translate('workspace.taxes.actions.deleteMultiple') : translate('workspace.taxes.actions.delete'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => setIsDeleteModalVisible(true),
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
    }, [hasAccountingConnections, policy?.taxRates?.taxes, selectedTaxesIDs, toggleTaxes, translate, enabledRatesCount, disabledRatesCount, icons.Checkmark, icons.Close, icons.Trashcan]);

    const shouldShowBulkActionsButton = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : selectedTaxesIDs.length > 0;

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

    const headerButtons = !shouldShowBulkActionsButton ? (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            {!hasAccountingConnections && (
                <Button
                    success
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_CREATE.getRoute(policyID))}
                    icon={icons.Plus}
                    text={translate('workspace.taxes.addRate')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
            )}
            <ButtonWithDropdownMenu
                success={false}
                onPress={() => {}}
                shouldUseOptionIcon
                customText={translate('common.more')}
                options={secondaryActions}
                isSplitButton={false}
                wrapperStyle={hasAccountingConnections ? styles.flexGrow1 : styles.flexGrow0}
            />
        </View>
    ) : (
        <ButtonWithDropdownMenu<WorkspaceTaxRatesBulkActionType>
            onPress={() => {}}
            options={dropdownMenuOptions}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            customText={translate('workspace.common.selected', {count: selectedTaxesIDs.length})}
            shouldAlwaysShowDropdownMenu
            isSplitButton={false}
            style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
            isDisabled={!selectedTaxesIDs.length}
        />
    );

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const headerContent = (
        <>
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
            {taxesList.length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.taxes.findTaxRate')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={filteredTaxesList.length === 0}
                />
            )}
        </>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspaceTaxesPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    icon={!selectionModeHeader ? illustrations.Coins : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.taxes')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedTaxesIDs([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.popToSidebar();
                    }}
                >
                    {!shouldUseNarrowLayout && headerButtons}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}
                <SelectionListWithModal
                    data={filteredTaxesList}
                    ListItem={TableListItem}
                    selectedItems={selectedTaxesIDs}
                    onSelectRow={navigateToEditTaxRate}
                    canSelectMultiple={canSelectMultiple}
                    onTurnOnSelectionMode={(item) => item && toggleTax(item)}
                    onSelectAll={filteredTaxesList.length > 0 ? toggleAllTaxes : undefined}
                    onDismissError={(item) => (item.keyForList ? clearTaxRateError(policyID, item.keyForList, item.pendingAction) : undefined)}
                    style={{listHeaderWrapperStyle: [styles.ph9, styles.pv3, styles.pb5]}}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    shouldUseDefaultRightHandSideCheckmark={false}
                    customListHeader={getCustomListHeader()}
                    customListHeaderContent={headerContent}
                    showListEmptyContent={false}
                    onCheckboxPress={toggleTax}
                    showScrollIndicator={false}
                    turnOnSelectionModeOnLongPress
                    shouldHeaderBeInsideList
                    shouldShowRightCaret
                />
                <ConfirmModal
                    title={translate('workspace.taxes.actions.delete')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={deleteTaxes}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    prompt={
                        selectedTaxesIDs.length > 1
                            ? translate('workspace.taxes.deleteMultipleTaxConfirmation', {taxAmount: selectedTaxesIDs.length})
                            : translate('workspace.taxes.deleteTaxConfirmation')
                    }
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceTaxesPage);
