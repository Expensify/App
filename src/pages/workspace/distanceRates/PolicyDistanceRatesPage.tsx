import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import type {DropdownOption, WorkspaceDistanceRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as DistanceRate from '@userActions/Policy/DistanceRate';
import ButtonWithDropdownMenu from '@src/components/ButtonWithDropdownMenu';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

type RateForList = ListItem & {value: string};

type PolicyDistanceRatesPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES>;

function PolicyDistanceRatesPage({
    route: {
        params: {policyID},
    },
}: PolicyDistanceRatesPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedDistanceRates, setSelectedDistanceRates] = useState<Rate[]>([]);
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const policy = usePolicy(policyID);
    const {selectionMode} = useMobileSelectionMode();

    const canSelectMultiple = shouldUseNarrowLayout ? selectionMode?.isEnabled : true;

    const customUnit: CustomUnit | undefined = useMemo(
        () => (policy?.customUnits !== undefined ? policy?.customUnits[Object.keys(policy?.customUnits)[0]] : undefined),
        [policy?.customUnits],
    );
    const customUnitRates: Record<string, Rate> = useMemo(() => customUnit?.rates ?? {}, [customUnit]);
    // Filter out rates that will be deleted
    const allSelectableRates = useMemo(() => Object.values(customUnitRates).filter((rate) => rate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE), [customUnitRates]);
    const canDisableOrDeleteSelectedRates = useMemo(
        () => allSelectableRates.filter((rate: Rate) => !selectedDistanceRates.some((selectedRate) => selectedRate.customUnitRateID === rate.customUnitRateID)).some((rate) => rate.enabled),
        [allSelectableRates, selectedDistanceRates],
    );

    const fetchDistanceRates = useCallback(() => {
        DistanceRate.openPolicyDistanceRatesPage(policyID);
    }, [policyID]);

    const dismissError = useCallback(
        (item: RateForList) => {
            if (customUnitRates[item.value].errors) {
                DistanceRate.clearDeleteDistanceRateError(policyID, customUnit?.customUnitID ?? '', item.value);
                return;
            }

            DistanceRate.clearCreateDistanceRateItemAndError(policyID, customUnit?.customUnitID ?? '', item.value);
        },
        [customUnit?.customUnitID, customUnitRates, policyID],
    );

    const {isOffline} = useNetwork({onReconnect: fetchDistanceRates});

    useFocusEffect(
        useCallback(() => {
            fetchDistanceRates();
        }, [fetchDistanceRates]),
    );

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedDistanceRates([]);
    }, [isFocused]);

    const distanceRatesList = useMemo<RateForList[]>(
        () =>
            Object.values(customUnitRates)
                .sort((rateA, rateB) => (rateA?.rate ?? 0) - (rateB?.rate ?? 0))
                .map((value) => ({
                    value: value.customUnitRateID ?? '',
                    text: `${CurrencyUtils.convertAmountToDisplayString(value.rate, value.currency ?? CONST.CURRENCY.USD)} / ${translate(
                        `common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`,
                    )}`,
                    keyForList: value.customUnitRateID ?? '',
                    isSelected: selectedDistanceRates.find((rate) => rate.customUnitRateID === value.customUnitRateID) !== undefined && canSelectMultiple,
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
                    rightElement: <ListItemRightCaretWithLabel labelText={value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')} />,
                })),
        [customUnit?.attributes?.unit, customUnitRates, selectedDistanceRates, translate, policy?.pendingAction, canSelectMultiple],
    );

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

        DistanceRate.setPolicyDistanceRatesEnabled(
            policyID,
            customUnit,
            selectedDistanceRates.filter((rate) => rate.enabled).map((rate) => ({...rate, enabled: false})),
        );
        setSelectedDistanceRates([]);
    };

    const enableRates = () => {
        if (customUnit === undefined) {
            return;
        }

        DistanceRate.setPolicyDistanceRatesEnabled(
            policyID,
            customUnit,
            selectedDistanceRates.filter((rate) => !rate.enabled).map((rate) => ({...rate, enabled: true})),
        );
        setSelectedDistanceRates([]);
    };

    const deleteRates = () => {
        if (customUnit === undefined) {
            return;
        }

        DistanceRate.deletePolicyDistanceRates(
            policyID,
            customUnit,
            selectedDistanceRates.map((rate) => rate.customUnitRateID ?? ''),
        );
        setSelectedDistanceRates([]);
        setIsDeleteModalVisible(false);
    };

    const toggleRate = (rate: RateForList) => {
        if (selectedDistanceRates.find((selectedRate) => selectedRate.customUnitRateID === rate.value) !== undefined) {
            setSelectedDistanceRates((prev) => prev.filter((selectedRate) => selectedRate.customUnitRateID !== rate.value));
        } else {
            setSelectedDistanceRates((prev) => [...prev, customUnitRates[rate.value]]);
        }
    };

    const toggleAllRates = () => {
        if (selectedDistanceRates.length === allSelectableRates.length) {
            setSelectedDistanceRates([]);
        } else {
            setSelectedDistanceRates([...allSelectableRates]);
        }
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9, !canSelectMultiple && styles.m5]}>
            <Text style={styles.searchInputStyle}>{translate('workspace.distanceRates.rate')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceDistanceRatesBulkActionType>> = [
            {
                text: translate('workspace.distanceRates.deleteRates', {count: selectedDistanceRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                icon: Expensicons.Trashcan,
                onSelected: () => (canDisableOrDeleteSelectedRates ? setIsDeleteModalVisible(true) : setIsWarningModalVisible(true)),
            },
        ];

        const enabledRates = selectedDistanceRates.filter((rate) => rate.enabled);
        if (enabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.disableRates', {count: enabledRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                icon: Expensicons.DocumentSlash,
                onSelected: () => (canDisableOrDeleteSelectedRates ? disableRates() : setIsWarningModalVisible(true)),
            });
        }

        const disabledRates = selectedDistanceRates.filter((rate) => !rate.enabled);
        if (disabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.enableRates', {count: disabledRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                icon: Expensicons.Document,
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
                        medium
                        text={translate('workspace.distanceRates.addRate')}
                        onPress={addRate}
                        style={[shouldUseNarrowLayout && styles.flex1]}
                        icon={Expensicons.Plus}
                        success
                    />

                    <Button
                        medium
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
                    customText={translate('workspace.common.selected', {selectedNumber: selectedDistanceRates.length})}
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
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={PolicyDistanceRatesPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    icon={!selectionModeHeader ? Illustrations.CarIce : undefined}
                    title={translate(!selectionModeHeader ? 'workspace.common.distanceRates' : 'common.selectMultiple')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedDistanceRates([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!shouldUseNarrowLayout && headerButtons}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.ph5]}>{headerButtons}</View>}
                {!shouldUseNarrowLayout && getHeaderText()}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}
                {Object.values(customUnitRates).length > 0 && (
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleRate(item)}
                        sections={[{data: distanceRatesList, isDisabled: false}]}
                        onCheckboxPress={toggleRate}
                        onSelectRow={openRateDetails}
                        onSelectAll={toggleAllRates}
                        onDismissError={dismissError}
                        ListItem={TableListItem}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        listHeaderContent={shouldUseNarrowLayout ? getHeaderText() : null}
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
