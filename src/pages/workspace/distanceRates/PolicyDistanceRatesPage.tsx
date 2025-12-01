import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import type {DropdownOption, WorkspaceDistanceRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolation from '@hooks/useTransactionViolation';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearCreateDistanceRateItemAndError,
    clearDeleteDistanceRateError,
    deletePolicyDistanceRates,
    openPolicyDistanceRatesPage,
    setPolicyDistanceRatesEnabled,
} from '@libs/actions/Policy/DistanceRate';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ButtonWithDropdownMenu from '@src/components/ButtonWithDropdownMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';

type RateForList = ListItem & {value: string; rate?: number};

type PolicyDistanceRatesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES>;

function PolicyDistanceRatesPage({
    route: {
        params: {policyID},
    },
}: PolicyDistanceRatesPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Gear'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const policy = usePolicy(policyID);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;
    const {asset: CarIce} = useMemoizedLazyAsset(() => loadIllustration('CarIce' as IllustrationName));
    const customUnit = useMemo(() => getDistanceRateCustomUnit(policy), [policy]);
    const customUnitRates: Record<string, Rate> = useMemo(() => customUnit?.rates ?? {}, [customUnit?.rates]);

    const selectableRates = useMemo(
        () =>
            Object.values(customUnitRates).reduce<Record<string, Rate>>((acc, rate) => {
                acc[rate.customUnitRateID] = rate;
                return acc;
            }, {}),
        [customUnitRates],
    );

    const rateIDs = useMemo(() => new Set(Object.keys(selectableRates)), [selectableRates]);

    const policyReportsSelector = useCallback(
        (reports: OnyxCollection<Report>) => {
            return Object.values(reports ?? {}).reduce((reportIDs, report) => {
                if (report && report.policyID === policyID) {
                    reportIDs.add(report.reportID);
                }
                return reportIDs;
            }, new Set<string>());
        },
        [policyID],
    );

    const [policyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: policyReportsSelector,
        canBeMissing: true,
    });

    const transactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            if (!customUnit?.customUnitID || rateIDs.size === 0) {
                return undefined;
            }
            return Object.values(transactions ?? {}).reduce(
                (transactionsData, transaction) => {
                    if (
                        transaction &&
                        transaction.reportID &&
                        policyReports?.has(transaction.reportID) &&
                        customUnit?.customUnitID &&
                        transaction?.comment?.customUnit?.customUnitID === customUnit.customUnitID &&
                        transaction?.comment?.customUnit?.customUnitRateID &&
                        rateIDs.has(transaction?.comment?.customUnit?.customUnitRateID)
                    ) {
                        transactionsData.transactionIDs.add(transaction.transactionID);
                        if (!transactionsData.rateIDToTransactionIDsMap[transaction?.comment?.customUnit?.customUnitRateID]) {
                            // eslint-disable-next-line no-param-reassign
                            transactionsData.rateIDToTransactionIDsMap[transaction?.comment?.customUnit?.customUnitRateID] = [];
                        }
                        transactionsData.rateIDToTransactionIDsMap[transaction?.comment?.customUnit?.customUnitRateID]?.push(transaction?.transactionID);
                    }
                    return transactionsData;
                },
                {transactionIDs: new Set<string>(), rateIDToTransactionIDsMap: {} as Record<string, string[]>},
            );
        },
        [customUnit?.customUnitID, rateIDs, policyReports],
    );

    const [eligibleTransactionsData] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: transactionsSelector,
        canBeMissing: true,
    });

    const eligibleTransactionIDs = eligibleTransactionsData?.transactionIDs;

    const transactionViolations = useTransactionViolation(eligibleTransactionIDs);

    const filterRateSelection = useCallback(
        (rate?: Rate) => !!rate && !!customUnitRates?.[rate.customUnitRateID] && customUnitRates?.[rate.customUnitRateID]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        [customUnitRates],
    );

    const [selectedDistanceRates, setSelectedDistanceRates] = useFilteredSelection(selectableRates, filterRateSelection);

    const canDisableOrDeleteSelectedRates = useMemo(
        () =>
            Object.keys(selectableRates)
                .filter((rateID) => !selectedDistanceRates.includes(rateID))
                .some((rateID) => selectableRates[rateID].enabled),
        [selectableRates, selectedDistanceRates],
    );

    const fetchDistanceRates = useCallback(() => {
        openPolicyDistanceRatesPage(policyID);
    }, [policyID]);

    const dismissError = useCallback(
        (item: RateForList) => {
            if (!customUnit?.customUnitID) {
                return;
            }

            if (customUnitRates[item.value].errors) {
                clearDeleteDistanceRateError(policyID, customUnit.customUnitID, item.value);
                return;
            }

            clearCreateDistanceRateItemAndError(policyID, customUnit.customUnitID, item.value);
        },
        [customUnit?.customUnitID, customUnitRates, policyID],
    );

    const {isOffline} = useNetwork({onReconnect: fetchDistanceRates});

    useEffect(() => {
        fetchDistanceRates();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useSearchBackPress({
        onClearSelection: () => setSelectedDistanceRates([]),
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const canDisableOrDeleteRate = useCallback(
        (rateID: string): boolean => {
            return Object.values(customUnit?.rates ?? {}).some(
                (distanceRate: Rate) => distanceRate?.enabled && rateID !== distanceRate?.customUnitRateID && distanceRate?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            );
        },
        [customUnit?.rates],
    );

    const updateDistanceRateEnabled = useCallback(
        (value: boolean, rateID: string) => {
            if (!customUnit) {
                return;
            }
            const rate = customUnit?.rates?.[rateID];
            // Rates can be disabled or deleted as long as in the remaining rates there is always at least one enabled rate and there are no pending delete actions
            if (!rate?.enabled || canDisableOrDeleteRate(rateID)) {
                setPolicyDistanceRatesEnabled(policyID, customUnit, [{...rate, enabled: value}]);
            } else {
                setIsWarningModalVisible(true);
            }
        },
        [canDisableOrDeleteRate, customUnit, policyID],
    );

    const distanceRatesList = useMemo<RateForList[]>(
        () =>
            Object.values(customUnitRates).map((value) => ({
                rate: value.rate,
                value: value.customUnitRateID,
                text: value.name,
                alternateText: `${convertAmountToDisplayString(value.rate, value.currency ?? CONST.CURRENCY.USD)} / ${translate(
                    `common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`,
                )}`,
                keyForList: value.customUnitRateID,
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction:
                    value.pendingAction ??
                    value.pendingFields?.rate ??
                    value.pendingFields?.enabled ??
                    value.pendingFields?.currency ??
                    value.pendingFields?.taxRateExternalID ??
                    value.pendingFields?.taxClaimablePercentage ??
                    value.pendingFields?.name ??
                    customUnit?.pendingFields?.attributes ??
                    (policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ? policy?.pendingAction : undefined),
                errors: value.errors ?? undefined,
                rightElement: (
                    <Switch
                        isOn={!!value?.enabled}
                        accessibilityLabel={translate('workspace.distanceRates.trackTax')}
                        onToggle={(newValue: boolean) => updateDistanceRateEnabled(newValue, value.customUnitRateID)}
                        showLockIcon={!canDisableOrDeleteRate(value.customUnitRateID)}
                        disabled={value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    />
                ),
            })),
        [canDisableOrDeleteRate, customUnitRates, translate, customUnit?.attributes?.unit, customUnit?.pendingFields?.attributes, policy?.pendingAction, updateDistanceRateEnabled],
    );

    const filterRate = useCallback((rate: RateForList, searchInput: string) => {
        const results = tokenizedSearch([rate], searchInput, (option) => [option.text ?? '']);
        return results.length > 0;
    }, []);
    const sortRates = useCallback((rates: RateForList[]) => rates.sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')), [localeCompare]);
    const [inputValue, setInputValue, filteredDistanceRatesList] = useSearchResults(distanceRatesList, filterRate, sortRates);

    const addRate = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(policyID));
    };

    const openSettings = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    }, [policyID]);

    const openRateDetails = (rate: RateForList) => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rate.value));
    };

    const disableRates = () => {
        if (customUnit === undefined) {
            return;
        }

        setPolicyDistanceRatesEnabled(
            policyID,
            customUnit,
            selectedDistanceRates
                .map((rateID) => selectableRates[rateID])
                .filter((rate) => rate.enabled)
                .map((rate) => ({...rate, enabled: false})),
        );
        setSelectedDistanceRates([]);
    };

    const enableRates = () => {
        if (customUnit === undefined) {
            return;
        }

        setPolicyDistanceRatesEnabled(
            policyID,
            customUnit,
            selectedDistanceRates
                .map((rateID) => selectableRates[rateID])
                .filter((rate) => !rate.enabled)
                .map((rate) => ({...rate, enabled: true})),
        );
        setSelectedDistanceRates([]);
    };

    const deleteRates = () => {
        if (customUnit === undefined) {
            return;
        }

        const transactionIDsAffected = selectedDistanceRates.flatMap((rateID) => eligibleTransactionsData?.rateIDToTransactionIDsMap?.[rateID] ?? []);

        deletePolicyDistanceRates(policyID, customUnit, selectedDistanceRates, transactionIDsAffected, transactionViolations);
        setIsDeleteModalVisible(false);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedDistanceRates([]);
        });
    };

    const toggleRate = (rate: RateForList) => {
        setSelectedDistanceRates((prevSelectedRates) => {
            if (prevSelectedRates.includes(rate.value)) {
                return prevSelectedRates.filter((selectedRate) => selectedRate !== rate.value);
            }
            return [...prevSelectedRates, rate.value];
        });
    };

    const toggleAllRates = () => {
        if (selectedDistanceRates.length > 0) {
            setSelectedDistanceRates([]);
        } else {
            setSelectedDistanceRates(
                Object.entries(selectableRates)
                    .filter(([, rate]) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && filteredDistanceRatesList.some((item) => item.value === rate.customUnitRateID))
                    .map(([key]) => key),
            );
        }
    };

    const getCustomListHeader = () => {
        if (filteredDistanceRatesList.length === 0) {
            return null;
        }
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('workspace.distanceRates.rate')}
                rightHeaderText={translate('common.enabled')}
                shouldShowRightCaret
            />
        );
    };

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceDistanceRatesBulkActionType>> = [
            {
                text: translate('workspace.distanceRates.deleteRates', {count: selectedDistanceRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                icon: Expensicons.Trashcan,
                onSelected: () => (canDisableOrDeleteSelectedRates ? setIsDeleteModalVisible(true) : setIsWarningModalVisible(true)),
            },
        ];

        const enabledRates = selectedDistanceRates.filter((rateID) => selectableRates[rateID].enabled);
        if (enabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.disableRates', {count: enabledRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                icon: Expensicons.Close,
                onSelected: () => (canDisableOrDeleteSelectedRates ? disableRates() : setIsWarningModalVisible(true)),
            });
        }

        const disabledRates = selectedDistanceRates.filter((rateID) => !selectableRates[rateID].enabled);
        if (disabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.enableRates', {count: disabledRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                icon: Expensicons.Checkmark,
                onSelected: enableRates,
            });
        }

        return options;
    };

    const isLoading = !isOffline && customUnit === undefined;

    const secondaryActions = useMemo(
        () => [
            {
                icon: icons.Gear,
                text: translate('common.settings'),
                onSelected: openSettings,
                value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
            },
        ],
        [icons.Gear, openSettings, translate],
    );

    const headerButtons = (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            {(shouldUseNarrowLayout ? !isMobileSelectionModeEnabled : selectedDistanceRates.length === 0) ? (
                <>
                    <Button
                        text={translate('workspace.distanceRates.addRate')}
                        onPress={addRate}
                        style={[shouldUseNarrowLayout && styles.flex1]}
                        icon={Expensicons.Plus}
                        success
                    />
                    <ButtonWithDropdownMenu
                        success={false}
                        onPress={() => {}}
                        shouldUseOptionIcon
                        customText={translate('common.more')}
                        options={secondaryActions}
                        isSplitButton={false}
                        wrapperStyle={styles.flexGrow0}
                    />
                </>
            ) : (
                <ButtonWithDropdownMenu<WorkspaceDistanceRatesBulkActionType>
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    customText={translate('workspace.common.selected', {count: selectedDistanceRates.length})}
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    onPress={() => null}
                    options={getBulkActionsButtonOptions()}
                    style={[shouldUseNarrowLayout && styles.flexGrow1]}
                    wrapperStyle={styles.w100}
                    isSplitButton={false}
                    isDisabled={!selectedDistanceRates.length}
                />
            )}
        </View>
    );

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const headerContent = (
        <>
            {Object.values(customUnitRates).length > 0 && (
                <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.distanceRates.centrallyManage')}</Text>
                </View>
            )}
            {Object.values(customUnitRates).length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.distanceRates.findRate')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={filteredDistanceRatesList.length === 0}
                />
            )}
        </>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={PolicyDistanceRatesPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    icon={!selectionModeHeader ? CarIce : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    title={translate(!selectionModeHeader ? 'workspace.common.distanceRates' : 'common.selectMultiple')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedDistanceRates([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.popToSidebar();
                    }}
                >
                    {!shouldUseNarrowLayout && headerButtons}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.ph5]}>{headerButtons}</View>}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}
                {Object.values(customUnitRates).length > 0 && (
                    <SelectionListWithModal
                        addBottomSafeAreaPadding
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleRate(item)}
                        sections={[{data: filteredDistanceRatesList, isDisabled: false}]}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        selectedItems={selectedDistanceRates}
                        onCheckboxPress={toggleRate}
                        onSelectRow={openRateDetails}
                        onSelectAll={filteredDistanceRatesList.length > 0 ? toggleAllRates : undefined}
                        onDismissError={dismissError}
                        ListItem={TableListItem}
                        listHeaderContent={headerContent}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        customListHeader={getCustomListHeader()}
                        shouldShowListEmptyContent={false}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
                        shouldShowRightCaret
                    />
                )}
                <ConfirmModal
                    onConfirm={() => setIsWarningModalVisible(false)}
                    onCancel={() => setIsWarningModalVisible(false)}
                    isVisible={isWarningModalVisible}
                    title={translate('workspace.distanceRates.oopsNotSoFast')}
                    prompt={translate('workspace.distanceRates.workspaceNeeds')}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
                />
                <ConfirmModal
                    title={translate('workspace.distanceRates.deleteDistanceRate')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={deleteRates}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    prompt={translate('workspace.distanceRates.areYouSureDelete', {count: selectedDistanceRates.length})}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

PolicyDistanceRatesPage.displayName = 'PolicyDistanceRatesPage';

export default PolicyDistanceRatesPage;
