import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import type {DropdownOption, WorkspaceDistanceRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import WorkspaceDistanceRatesTable from '@components/Tables/WorkspaceDistanceRatesTable';
import type {DistanceRateTableItemData} from '@components/Tables/WorkspaceDistanceRatesTable/WorkspaceDistanceRatesTableRow';
import Text from '@components/Text';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useFilteredSelection from '@hooks/useFilteredSelection';
import useGenericEmptyStateIllustration from '@hooks/useGenericEmptyStateIllustration';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolation from '@hooks/useTransactionViolation';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearCreateDistanceRateItemAndError,
    clearDeleteDistanceRateError,
    deletePolicyDistanceRates,
    openPolicyDistanceRatesPage,
    setPolicyDistanceRatesEnabled,
} from '@libs/actions/Policy/DistanceRate';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

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

import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

type PolicyDistanceRatesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES>;

function PolicyDistanceRatesPage({
    route: {
        params: {policyID},
    },
}: PolicyDistanceRatesPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Close', 'Gear', 'Plus', 'Trashcan']);
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.distanceRates');
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {canWrite: canWriteDistanceRates, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.DISTANCE_RATES);

    const {asset: CarIce} = useMemoizedLazyAsset(() => loadIllustration('CarIce' as IllustrationName));
    const genericIllustration = useGenericEmptyStateIllustration();
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
                if (report?.policyID === policyID) {
                    reportIDs.add(report.reportID);
                }
                return reportIDs;
            }, new Set<string>());
        },
        [policyID],
    );

    const [policyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: policyReportsSelector,
    });

    const transactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            if (!customUnit?.customUnitID || rateIDs.size === 0) {
                return undefined;
            }
            return Object.values(transactions ?? {}).reduce(
                (transactionsData, transaction) => {
                    if (
                        transaction?.reportID &&
                        policyReports?.has(transaction.reportID) &&
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
    });

    const eligibleTransactionIDs = eligibleTransactionsData?.transactionIDs;

    const transactionViolations = useTransactionViolation(eligibleTransactionIDs);

    const filterRateSelection = useCallback(
        (rate?: Rate) => !!rate && !!customUnitRates?.[rate.customUnitRateID] && customUnitRates?.[rate.customUnitRateID]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        [customUnitRates],
    );

    const [selectedDistanceRates, setSelectedDistanceRates] = useFilteredSelection(selectableRates, filterRateSelection);

    const clearTableSelection = useCallback(() => {
        setSelectedDistanceRates((prev) => (prev.length > 0 ? [] : prev));
    }, [setSelectedDistanceRates]);

    useCleanupSelectedOptions(clearTableSelection);

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

    const {isOffline} = useNetwork({onReconnect: fetchDistanceRates});

    useEffect(() => {
        fetchDistanceRates();
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

    const showWarningModal = useCallback(() => {
        showConfirmModal({
            title: translate('workspace.distanceRates.oopsNotSoFast'),
            prompt: translate('workspace.distanceRates.workspaceNeeds'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const updateDistanceRateEnabled = useCallback(
        (value: boolean, rateID: string) => {
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
        },
        [canDisableOrDeleteRate, canWriteDistanceRates, customUnit, policyID, showReadOnlyModal, showWarningModal],
    );

    const unitTranslation = translate(`common.${customUnit?.attributes?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}`);

    const addRate = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(policyID));
    };

    const openSettings = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
    }, [policyID]);

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

    const dismissErrorByID = useCallback(
        (rateID: string) => {
            if (!customUnit?.customUnitID) {
                return;
            }
            if (customUnitRates[rateID]?.errors) {
                clearDeleteDistanceRateError(policyID, customUnit.customUnitID, rateID);
                return;
            }
            clearCreateDistanceRateItemAndError(policyID, customUnit.customUnitID, rateID);
        },
        [customUnit?.customUnitID, customUnitRates, policyID],
    );

    const openRateDetailsByID = useCallback(
        (rateID: string) => {
            Navigation.navigate(ROUTES.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
        },
        [policyID],
    );

    const ratesData: DistanceRateTableItemData[] = useMemo(
        () =>
            Object.values(customUnitRates).map((rate) => {
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

                return {
                    keyForList: rate.customUnitRateID,
                    rateID: rate.customUnitRateID,
                    rate,
                    disabled: isDeleting,
                    enabled: !!rate.enabled,
                    isLocked: !canWriteDistanceRates || !canDisableOrDeleteRate(rate.customUnitRateID) || isDeleting,
                    formattedRate: `${convertAmountToDisplayString(rate.rate, rate.currency ?? CONST.CURRENCY.USD)} / ${unitTranslation}`,
                    pendingAction: resolvedPendingAction ?? undefined,
                    errors: rate.errors ?? undefined,
                    action: () => openRateDetailsByID(rate.customUnitRateID),
                    dismissError: () => dismissErrorByID(rate.customUnitRateID),
                    onToggleEnabled: (value: boolean) => updateDistanceRateEnabled(value, rate.customUnitRateID),
                };
            }),
        [
            customUnitRates,
            unitTranslation,
            customUnit?.pendingFields?.attributes,
            policy?.pendingAction,
            canWriteDistanceRates,
            canDisableOrDeleteRate,
            openRateDetailsByID,
            dismissErrorByID,
            updateDistanceRateEnabled,
        ],
    );

    const getBulkActionsButtonOptions = () => {
        const options: Array<DropdownOption<WorkspaceDistanceRatesBulkActionType>> = [
            {
                text: translate('workspace.distanceRates.deleteRates', {count: selectedDistanceRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                icon: icons.Trashcan,
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
                        danger: true,
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
                icon: icons.Close,
                onSelected: () => (canDisableOrDeleteSelectedRates ? disableRates() : showWarningModal()),
            });
        }

        const disabledRates = selectedDistanceRates.filter((rateID) => !selectableRates[rateID].enabled);
        if (disabledRates.length > 0) {
            options.push({
                text: translate('workspace.distanceRates.enableRates', {count: disabledRates.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                icon: icons.Checkmark,
                onSelected: enableRates,
            });
        }

        return options;
    };

    const isLoading = !isOffline && customUnit === undefined;
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'PolicyDistanceRatesPage', isOffline, isCustomUnitUndefined: customUnit === undefined};

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

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const headerButtons = canWriteDistanceRates ? (
        <View style={[!isInLandscapeMode && styles.w100, styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
            {(shouldUseNarrowLayout ? !isMobileSelectionModeEnabled : selectedDistanceRates.length === 0) ? (
                <>
                    <Button
                        text={translate('workspace.distanceRates.addRate')}
                        onPress={addRate}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.ADD_BUTTON}
                        style={[shouldDisplayButtonsInSeparateLine && styles.flex1]}
                        icon={icons.Plus}
                        success
                    />
                    <ButtonWithDropdownMenu
                        variant={undefined}
                        onPress={() => {}}
                        shouldUseOptionIcon
                        customText={translate('common.more')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.MORE_DROPDOWN}
                        options={secondaryActions}
                        isSplitButton={false}
                        wrapperStyle={styles.flexGrow0}
                    />
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

    const emptyStateContent = (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent
                {...genericIllustration}
                title={translate('workspace.distanceRates.emptyRates.title')}
                subtitle={translate('workspace.distanceRates.emptyRates.subtitle')}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                buttons={
                    canWriteDistanceRates
                        ? [
                              {
                                  icon: icons.Plus,
                                  buttonText: translate('workspace.distanceRates.addRate'),
                                  buttonAction: addRate,
                                  success: true,
                              },
                          ]
                        : undefined
                }
            />
        </ScrollView>
    );

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
                    icon={!selectionModeHeader ? CarIce : undefined}
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
                {shouldDisplayButtonsInSeparateLine && !!headerButtons && <View style={[styles.ph5]}>{headerButtons}</View>}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        reasonAttributes={reasonAttributes}
                    />
                )}
                {!isLoading && (
                    <>
                        {ratesData.length > 0 && (
                            <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.distanceRates.centrallyManage')}</Text>
                            </View>
                        )}
                        <WorkspaceDistanceRatesTable
                            ratesData={ratesData}
                            selectionEnabled={canWriteDistanceRates}
                            selectedKeys={selectedDistanceRates}
                            onRowSelectionChange={setSelectedDistanceRates}
                            EmptyStateComponent={emptyStateContent}
                        />
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRatesPage;
