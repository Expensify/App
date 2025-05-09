import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import type {DropdownOption, WorkspaceDistanceRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useFilteredSelection from '@hooks/useFilteredSelection';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
import goBackFromWorkspaceCentralScreen from '@libs/Navigation/helpers/goBackFromWorkspaceCentralScreen';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ButtonWithDropdownMenu from '@src/components/ButtonWithDropdownMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Rate} from '@src/types/onyx/Policy';

type RateForList = ListItem & {value: string; rate?: number};

type PolicyDistanceRatesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES>;

function PolicyDistanceRatesPage({
    route: {
        params: {policyID},
    },
}: PolicyDistanceRatesPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const policy = usePolicy(policyID);
    const {selectionMode} = useMobileSelectionMode();

    const canSelectMultiple = shouldUseNarrowLayout ? selectionMode?.isEnabled : true;

    const customUnit = getDistanceRateCustomUnit(policy);
    const customUnitRates: Record<string, Rate> = useMemo(() => customUnit?.rates ?? {}, [customUnit]);

    const selectableRates = useMemo(
        () =>
            Object.values(customUnitRates).reduce<Record<string, Rate>>((acc, rate) => {
                acc[rate.customUnitRateID] = rate;
                return acc;
            }, {}),
        [customUnitRates],
    );

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

    const updateDistanceRateEnabled = useCallback(
        (value: boolean, rateID: string) => {
            if (!customUnit) {
                return;
            }
            const rate = customUnit?.rates?.[rateID];
            // Rates can be disabled or deleted as long as in the remaining rates there is always at least one enabled rate and there are no pending delete actions
            const canDisableOrDeleteRate = Object.values(customUnit?.rates ?? {}).some(
                (distanceRate: Rate) => distanceRate?.enabled && rateID !== distanceRate?.customUnitRateID && distanceRate?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            );

            if (!rate?.enabled || canDisableOrDeleteRate) {
                setPolicyDistanceRatesEnabled(policyID, customUnit, [{...rate, enabled: value}]);
            } else {
                setIsWarningModalVisible(true);
            }
        },
        [customUnit, policyID],
    );

    const distanceRatesList = useMemo<RateForList[]>(
        () =>
            Object.values(customUnitRates).map((value) => ({
                rate: value.rate,
                value: value.customUnitRateID,
                text: `${convertAmountToDisplayString(value.rate, value.currency ?? CONST.CURRENCY.USD)} / ${translate(
                    `common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`,
                )}`,
                keyForList: value.customUnitRateID,
                isSelected: selectedDistanceRates.includes(value.customUnitRateID) && canSelectMultiple,
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction:
                    value.pendingAction ??
                    value.pendingFields?.rate ??
                    value.pendingFields?.enabled ??
                    value.pendingFields?.currency ??
                    value.pendingFields?.taxRateExternalID ??
                    value.pendingFields?.taxClaimablePercentage ??
                    (policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ? policy?.pendingAction : undefined),
                errors: value.errors ?? undefined,
                rightElement: (
                    <Switch
                        isOn={!!value?.enabled}
                        accessibilityLabel={translate('workspace.distanceRates.trackTax')}
                        onToggle={(newValue: boolean) => updateDistanceRateEnabled(newValue, value.customUnitRateID)}
                        disabled={value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    />
                ),
            })),
        [customUnitRates, translate, customUnit, selectedDistanceRates, canSelectMultiple, policy?.pendingAction, updateDistanceRateEnabled],
    );

    const filterRate = useCallback((rate: RateForList, searchInput: string) => {
        const rateText = StringUtils.normalize(rate.text?.toLowerCase() ?? '');
        const normalizedSearchInput = StringUtils.normalize(searchInput.toLowerCase());
        return rateText.includes(normalizedSearchInput);
    }, []);
    const sortRates = useCallback((rates: RateForList[]) => rates.sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0)), []);
    const [inputValue, setInputValue, filteredDistanceRatesList] = useSearchResults(distanceRatesList, filterRate, sortRates);

    const addRate = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(policyID));
    };

    const openSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    };

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

        deletePolicyDistanceRates(policyID, customUnit, selectedDistanceRates);
        setSelectedDistanceRates([]);
        setIsDeleteModalVisible(false);
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
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('workspace.distanceRates.rate')}
                rightHeaderText={translate('common.enabled')}
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

    const headerButtons = (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            {(shouldUseNarrowLayout ? !selectionMode?.isEnabled : selectedDistanceRates.length === 0) ? (
                <>
                    <Button
                        text={translate('workspace.distanceRates.addRate')}
                        onPress={addRate}
                        style={[shouldUseNarrowLayout && styles.flex1]}
                        icon={Expensicons.Plus}
                        success
                    />

                    <Button
                        text={translate('workspace.common.settings')}
                        onPress={openSettings}
                        style={[shouldUseNarrowLayout && styles.flex1]}
                        icon={Expensicons.Gear}
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

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.distanceRates.centrallyManage')}</Text>
        </View>
    );

    const selectionModeHeader = selectionMode?.isEnabled && shouldUseNarrowLayout;

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
                    icon={!selectionModeHeader ? Illustrations.CarIce : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    title={translate(!selectionModeHeader ? 'workspace.common.distanceRates' : 'common.selectMultiple')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedDistanceRates([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        goBackFromWorkspaceCentralScreen(policyID);
                    }}
                >
                    {!shouldUseNarrowLayout && headerButtons}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.ph5]}>{headerButtons}</View>}
                {Object.values(customUnitRates).length > 0 && getHeaderText()}
                {Object.values(customUnitRates).length > CONST.SEARCH_ITEM_LIMIT && (
                    <SearchBar
                        label={translate('workspace.distanceRates.findRate')}
                        inputValue={inputValue}
                        onChangeText={setInputValue}
                        shouldShowEmptyState={filteredDistanceRatesList.length === 0}
                    />
                )}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}
                {Object.values(customUnitRates).length > 0 && (
                    <SelectionListWithModal
                        addBottomSafeAreaPadding
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleRate(item)}
                        sections={[{data: filteredDistanceRatesList, isDisabled: false}]}
                        onCheckboxPress={toggleRate}
                        onSelectRow={openRateDetails}
                        onSelectAll={toggleAllRates}
                        onDismissError={dismissError}
                        ListItem={TableListItem}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
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
