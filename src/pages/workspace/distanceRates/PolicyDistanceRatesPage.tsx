import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import type {DropdownOption, WorkspaceDistanceRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceDistanceRatesTable from '@components/Tables/WorkspaceDistanceRatesTable';
import type {DistanceRateTableItemData} from '@components/Tables/WorkspaceDistanceRatesTable/WorkspaceDistanceRatesTableRow';
import Text from '@components/Text';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useFilteredSelection from '@hooks/useFilteredSelection';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolation from '@hooks/useTransactionViolation';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearCreateDistanceRateItemAndError,
    clearDeleteDistanceRateError,
    clearPolicyDistanceRateErrorFields,
    deletePolicyDistanceRates,
    openPolicyDistanceRatesPage,
    setPolicyDistanceRatesEnabled,
} from '@libs/actions/Policy/DistanceRate';
import {renameDistanceRateInline, updateDistanceRateValueInline, updateDistanceTaxClaimableValueInline} from '@libs/actions/Policy/InlineEdit';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {getLatestErrorFieldForAnyField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getTaxReclaimableAmount} from '@libs/PolicyDistanceRatesUtils';
import {getDistanceRateCustomUnit, isTaxTrackingEnabled, shouldShowUKFuelRateTaxError} from '@libs/PolicyUtils';
import showInlineEditError from '@libs/showInlineEditError';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import ButtonWithDropdownMenu from '@src/components/ButtonWithDropdownMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type PolicyDistanceRatesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES>;

function PolicyDistanceRatesPage({
    route: {
        params: {policyID},
    },
}: PolicyDistanceRatesPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Close', 'DotIndicator', 'Gear', 'Plus', 'Trashcan']);
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {pageGutter} = useLayoutSpacing();
    const {translate, toLocaleDigit} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.distanceRates');
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {canWrite: canWriteDistanceRates, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES);

    const [customUnit] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: getDistanceRateCustomUnit});
    const customUnitID = customUnit?.customUnitID;
    const customUnitRates: Record<string, Rate> = customUnit?.rates ?? {};
    const isDistanceRateTaxEnabled = isTaxTrackingEnabled(true, policy, true);

    const selectableRates = Object.values(customUnitRates).reduce<Record<string, Rate>>((acc, rate) => {
        acc[rate.customUnitRateID] = rate;
        return acc;
    }, {});

    const rateIDs = new Set(Object.keys(selectableRates));

    const policyReportsSelector = (reports: OnyxCollection<Report>) => {
        const reportIDs: Record<string, true> = {};
        for (const report of Object.values(reports ?? {})) {
            if (report?.policyID === policyID) {
                reportIDs[report.reportID] = true;
            }
        }
        return reportIDs;
    };

    const [policyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: policyReportsSelector,
    });

    const transactionsSelector = (transactions: OnyxCollection<Transaction>) => {
        if (!customUnit?.customUnitID || rateIDs.size === 0) {
            return undefined;
        }
        return Object.values(transactions ?? {}).reduce(
            (transactionsData, transaction) => {
                if (
                    transaction?.reportID &&
                    policyReports?.[transaction.reportID] &&
                    transaction?.comment?.customUnit?.customUnitRateID &&
                    rateIDs.has(transaction?.comment?.customUnit?.customUnitRateID)
                ) {
                    transactionsData.transactionIDs.push(transaction.transactionID);
                    if (!transactionsData.rateIDToTransactionIDsMap[transaction?.comment?.customUnit?.customUnitRateID]) {
                        // eslint-disable-next-line no-param-reassign
                        transactionsData.rateIDToTransactionIDsMap[transaction?.comment?.customUnit?.customUnitRateID] = [];
                    }
                    transactionsData.rateIDToTransactionIDsMap[transaction?.comment?.customUnit?.customUnitRateID]?.push(transaction?.transactionID);
                }
                return transactionsData;
            },
            {transactionIDs: [] as string[], rateIDToTransactionIDsMap: {} as Record<string, string[]>},
        );
    };

    const [eligibleTransactionsData] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: transactionsSelector,
    });

    const eligibleTransactionIDs = eligibleTransactionsData?.transactionIDs;

    const transactionViolations = useTransactionViolation(eligibleTransactionIDs);

    const filterRateSelection = (rate?: Rate) =>
        !!rate && !!customUnitRates?.[rate.customUnitRateID] && customUnitRates?.[rate.customUnitRateID]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const [selectedDistanceRates, setSelectedDistanceRates] = useFilteredSelection(selectableRates, filterRateSelection);

    const clearTableSelection = () => {
        setSelectedDistanceRates((prev) => (prev.length > 0 ? [] : prev));
    };

    useCleanupSelectedOptions(clearTableSelection);

    const isSelectionModeActive = selectedDistanceRates.length > 0 || isMobileSelectionModeEnabled;

    const canDisableOrDeleteSelectedRates = Object.keys(selectableRates)
        .filter((rateID) => !selectedDistanceRates.includes(rateID))
        .some((rateID) => selectableRates[rateID].enabled);

    const fetchDistanceRates = () => {
        openPolicyDistanceRatesPage(policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchDistanceRates});

    useEffect(() => {
        fetchDistanceRates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useSearchBackPress({
        onClearSelection: () => setSelectedDistanceRates([]),
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const canDisableOrDeleteRate = (rateID: string): boolean => {
        return Object.values(customUnit?.rates ?? {}).some(
            (distanceRate: Rate) => distanceRate?.enabled && rateID !== distanceRate?.customUnitRateID && distanceRate?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
    };

    const showWarningModal = () => {
        showConfirmModal({
            title: translate('workspace.distanceRates.oopsNotSoFast'),
            prompt: translate('workspace.distanceRates.workspaceNeeds'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const updateDistanceRateEnabled = (value: boolean, rateID: string) => {
        if (!canWriteDistanceRates) {
            showReadOnlyModal();
            return;
        }
        if (!customUnit) {
            return;
        }
        const rate = customUnit?.rates?.[rateID];
        if (!rate?.enabled || canDisableOrDeleteRate(rateID)) {
            setPolicyDistanceRatesEnabled(policyID, customUnit, [{...rate, enabled: value}]);
        } else {
            showWarningModal();
        }
    };

    const unitTranslation = translate(`common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`);
    const currentUnit = customUnit?.attributes?.unit;

    const addRate = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(policyID));
    };

    const openSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
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
        setSelectedDistanceRates([]);
    };

    const dismissErrorByID = (rateID: string) => {
        if (!customUnitID) {
            return;
        }
        if (customUnitRates[rateID]?.errors) {
            clearDeleteDistanceRateError(policyID, customUnitID, rateID);
            return;
        }
        const errorFields = customUnitRates[rateID]?.errorFields;
        if (errorFields && Object.keys(errorFields).length > 0) {
            clearPolicyDistanceRateErrorFields(policyID, customUnitID, rateID, Object.fromEntries(Object.keys(errorFields).map((field) => [field, null])));
            return;
        }
        clearCreateDistanceRateItemAndError(policyID, customUnitID, rateID);
    };

    const openRateDetailsByID = (rateID: string) => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
    };

    const ratesData: DistanceRateTableItemData[] = Object.values(customUnitRates).map((rate) => {
        const resolvedPendingAction =
            rate.pendingAction ??
            rate.pendingFields?.rate ??
            rate.pendingFields?.enabled ??
            rate.pendingFields?.currency ??
            rate.pendingFields?.taxRateExternalID ??
            rate.pendingFields?.taxClaimablePercentage ??
            rate.pendingFields?.name ??
            customUnit?.pendingFields?.attributes ??
            (policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ? policy?.pendingAction : undefined);

        const isDeleting = resolvedPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        const rateCurrency = rate.currency ?? CONST.CURRENCY.USD;
        const taxReclaimableAmount = getTaxReclaimableAmount(rate);
        const taxRateExternalID = rate.attributes?.taxRateExternalID;
        const hasTaxRate = !!taxRateExternalID && !!policy?.taxRates?.taxes[taxRateExternalID];

        return {
            keyForList: rate.customUnitRateID,
            rateID: rate.customUnitRateID,
            rate,
            disabled: isDeleting,
            enabled: !!rate.enabled,
            isLocked: !canWriteDistanceRates || !canDisableOrDeleteRate(rate.customUnitRateID) || isDeleting,
            formattedRate: `${convertAmountToDisplayString(rate.rate, rateCurrency)} / ${unitTranslation}`,
            taxReclaimableAmount,
            formattedTaxReclaimable: taxReclaimableAmount !== undefined ? convertAmountToDisplayString(taxReclaimableAmount, rateCurrency) : '',
            pendingAction: resolvedPendingAction ?? undefined,
            errors: rate.errors ?? getLatestErrorFieldForAnyField(rate),
            canEditName: canWriteDistanceRates && !isDeleting && !isSelectionModeActive,
            canEditRate: canWriteDistanceRates && !isDeleting && !isSelectionModeActive,
            canEditTaxReclaimable: canWriteDistanceRates && !isDeleting && !isSelectionModeActive && (hasTaxRate || !!rate.attributes?.taxClaimablePercentage),
            action: () => openRateDetailsByID(rate.customUnitRateID),
            dismissError: () => dismissErrorByID(rate.customUnitRateID),
            onToggleEnabled: (value: boolean) => updateDistanceRateEnabled(value, rate.customUnitRateID),
            onRenameName: (newName: string) => {
                if (!customUnit) {
                    return;
                }
                showInlineEditError(renameDistanceRateInline(translate, policyID, customUnit, rate, newName));
            },
            onChangeRate: (newRate: string) => {
                if (!customUnit) {
                    return;
                }
                showInlineEditError(updateDistanceRateValueInline(translate, policyID, customUnit, rate, newRate, toLocaleDigit));
            },
            onChangeTaxReclaimable: (newAmount: string) => {
                if (!customUnit) {
                    return;
                }
                showInlineEditError(updateDistanceTaxClaimableValueInline(translate, policyID, customUnit, rate, newAmount));
            },
        };
    });

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceDistanceRatesBulkActionType>> = [
            {
                text: translate('workspace.distanceRates.deleteRates', {count: selectedDistanceRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.BULK_ACTIONS_DELETE,
                icon: icons.Trashcan,
                shouldSkipFocusRestore: true,
                onSelected: async () => {
                    if (!canDisableOrDeleteSelectedRates) {
                        showWarningModal();
                        return;
                    }
                    const {action} = await showConfirmModal({
                        title: translate('workspace.distanceRates.deleteDistanceRate'),
                        prompt: translate('workspace.distanceRates.areYouSureDelete', {count: selectedDistanceRates.length}),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                    });
                    if (action === ModalActions.CONFIRM) {
                        deleteRates();
                    }
                },
            },
        ];

        const enabledRates = selectedDistanceRates.filter((rateID) => selectableRates[rateID].enabled);
        if (enabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.disableRates', {count: enabledRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.BULK_ACTIONS.DISABLE,
                icon: icons.Close,
                shouldSkipFocusRestore: !canDisableOrDeleteSelectedRates,
                onSelected: () => (canDisableOrDeleteSelectedRates ? disableRates() : showWarningModal()),
            });
        }

        const disabledRates = selectedDistanceRates.filter((rateID) => !selectableRates[rateID].enabled);
        if (disabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.enableRates', {count: disabledRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.BULK_ACTIONS.ENABLE,
                icon: icons.Checkmark,
                onSelected: enableRates,
            });
        }

        return options;
    };

    const isLoading = !isOffline && customUnit === undefined;
    const hasFuelRateTaxError = shouldShowUKFuelRateTaxError(policy);

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const headerButtons = canWriteDistanceRates ? (
        <View style={[!isInLandscapeMode && styles.w100, styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
            {(shouldUseNarrowLayout ? !isMobileSelectionModeEnabled : selectedDistanceRates.length === 0) ? (
                <>
                    <Button
                        onPress={addRate}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.ADD_BUTTON}
                        style={[shouldDisplayButtonsInSeparateLine && styles.flex1]}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                    >
                        <Button.Icon src={icons.Plus} />
                        <Button.Text>{translate('workspace.distanceRates.addRate')}</Button.Text>
                    </Button>
                    <Button
                        onPress={openSettings}
                        accessibilityLabel={translate('common.settings')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.MORE_DROPDOWN}
                        style={styles.flexGrow0}
                    >
                        <Button.Icon
                            src={hasFuelRateTaxError ? icons.DotIndicator : icons.Gear}
                            fill={hasFuelRateTaxError ? theme.danger : undefined}
                            hoverFill={hasFuelRateTaxError ? theme.danger : undefined}
                        />
                        <Button.Text>{translate('common.settings')}</Button.Text>
                    </Button>
                </>
            ) : (
                <ButtonWithDropdownMenu<WorkspaceDistanceRatesBulkActionType>
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    customText={translate('workspace.common.selected', {count: selectedDistanceRates.length})}
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    onPress={() => null}
                    options={getBulkActionsButtonOptions()}
                    style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1]}
                    wrapperStyle={!isInLandscapeMode ? styles.w100 : undefined}
                    isSplitButton={false}
                    isDisabled={!selectedDistanceRates.length}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.BULK_ACTIONS_DROPDOWN}
                />
            )}
        </View>
    ) : null;

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const distanceRatesTableHeader =
        ratesData.length > 0 ? (
            <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.distanceRates.centrallyManage')}</Text>
            </View>
        ) : undefined;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={[styles.defaultModalContainer]}
                testID="PolicyDistanceRatesPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    title={translate(!selectionModeHeader ? 'workspace.common.distanceRates' : 'common.selectMultiple')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldDisplayHelpButton
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedDistanceRates([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!shouldDisplayButtonsInSeparateLine && headerButtons}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && !!headerButtons && <View style={pageGutter}>{headerButtons}</View>}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}
                {!isLoading && (
                    <WorkspaceDistanceRatesTable
                        policyID={policyID}
                        ratesData={ratesData}
                        unit={currentUnit}
                        selectedKeys={selectedDistanceRates}
                        selectionEnabled={canWriteDistanceRates}
                        onRowSelectionChange={setSelectedDistanceRates}
                        canWriteDistanceRates={canWriteDistanceRates}
                        isDistanceRateTaxEnabled={isDistanceRateTaxEnabled}
                        headerComponent={distanceRatesTableHeader}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRatesPage;
