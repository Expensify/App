import ActivityIndicator from '@components/ActivityIndicator';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import WorkspacePerDiemTable from '@components/Tables/WorkspacePerDiemTable';
import type {PerDiemTableRowData} from '@components/Tables/WorkspacePerDiemTable';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilteredSelection from '@hooks/useFilteredSelection';
import useGenericEmptyStateIllustration from '@hooks/useGenericEmptyStateIllustration';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {canMemberWrite, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {close} from '@userActions/Modal';
import {deleteWorkspacePerDiemRates, downloadPerDiemCSV, openPolicyPerDiemPage} from '@userActions/Policy/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

type SubRateData = {
    pendingAction?: PendingAction;
    destination: string;
    subRateName: string;
    rate: number;
    currency: string;
    rateID: string;
    subRateID: string;
};

function getPerDiemRowKey(rateID: string, subRateID: string) {
    return `${rateID}:${subRateID}`;
}

function getSubRatesData(customUnitRates: Rate[]) {
    const subRatesData: SubRateData[] = [];
    for (const rate of customUnitRates) {
        const subRates = rate.subRates;
        if (subRates) {
            for (const subRate of subRates) {
                subRatesData.push({
                    pendingAction: rate.pendingAction,
                    destination: rate.name ?? '',
                    subRateName: subRate.name,
                    rate: subRate.rate,
                    currency: rate.currency ?? CONST.CURRENCY.USD,
                    rateID: rate.customUnitRateID,
                    subRateID: subRate.id,
                });
            }
        }
    }
    return subRatesData;
}

type WorkspacePerDiemPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM>;

function WorkspacePerDiemPage({route}: WorkspacePerDiemPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const policyID = route.params.policyID;
    const backTo = route.params?.backTo;
    const policy = usePolicy(policyID);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const canWritePerDiem = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.PER_DIEM);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.perDiem');
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const illustrations = useMemoizedLazyIllustrations(['PerDiem']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear', 'Table', 'Download', 'Trashcan']);
    const genericIllustration = useGenericEmptyStateIllustration();

    const [customUnit, allSubRates] = useMemo(() => {
        const customUnits = getPerDiemCustomUnit(policy);
        const customUnitRates: Record<string, Rate> = customUnits?.rates ?? {};
        const allRates = Object.values(customUnitRates);
        const allSubRatesMemo = getSubRatesData(allRates);
        return [customUnits, allSubRatesMemo];
    }, [policy]);

    const fetchPerDiem = useCallback(() => {
        openPolicyPerDiemPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchPerDiem});

    useFocusEffect(
        useCallback(() => {
            fetchPerDiem();
        }, [fetchPerDiem]),
    );

    const selectableSubRatesByKey = useMemo(() => {
        const map: Record<string, SubRateData> = {};
        for (const subRate of allSubRates) {
            if (subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                map[getPerDiemRowKey(subRate.rateID, subRate.subRateID)] = subRate;
            }
        }
        return map;
    }, [allSubRates]);

    const filterSelectableSubRate = useCallback((subRate?: SubRateData) => !!subRate, []);

    const [selectedSubRateKeys, setSelectedSubRateKeys] = useFilteredSelection(selectableSubRatesByKey, filterSelectableSubRate);

    const clearTableSelection = useCallback(() => {
        setSelectedSubRateKeys((prev) => (prev.length > 0 ? [] : prev));
    }, [setSelectedSubRateKeys]);

    useCleanupSelectedOptions(clearTableSelection);

    const openSettings = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_SETTINGS.getRoute(policyID));
    }, [policyID]);

    const openSubRateDetails = useCallback(
        (rateID: string, subRateID: string) => {
            Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
        },
        [policyID],
    );

    const showOfflineModal = useCallback(() => {
        close(() => {
            showConfirmModal({
                title: translate('common.youAppearToBeOffline'),
                prompt: translate('common.thisFeatureRequiresInternet'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
        });
    }, [showConfirmModal, translate]);

    const handleDeletePerDiemRates = useCallback(() => {
        const subRatesToDelete = selectedSubRateKeys.map((rowKey) => selectableSubRatesByKey[rowKey]).filter((subRate): subRate is SubRateData => !!subRate);
        deleteWorkspacePerDiemRates(policyID, customUnit, subRatesToDelete);
        setSelectedSubRateKeys([]);
        turnOffMobileSelectionMode();
    }, [selectedSubRateKeys, selectableSubRatesByKey, policyID, customUnit, setSelectedSubRateKeys]);

    const hasVisibleSubRates = allSubRates.some((subRate) => subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const perDiemRows: PerDiemTableRowData[] = useMemo(
        () =>
            allSubRates
                .filter((subRate) => isOffline || subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                .map((subRate) => {
                    const isDeleting = subRate.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

                    return {
                        keyForList: getPerDiemRowKey(subRate.rateID, subRate.subRateID),
                        subRateID: subRate.subRateID,
                        rateID: subRate.rateID,
                        destination: subRate.destination,
                        subRateName: subRate.subRateName,
                        rate: subRate.rate,
                        formattedAmount: convertAmountToDisplayString(subRate.rate, subRate.currency),
                        disabled: isDeleting,
                        pendingAction: subRate.pendingAction,
                        action: () => openSubRateDetails(subRate.rateID, subRate.subRateID),
                    };
                }),
        [allSubRates, isOffline, openSubRateDetails],
    );

    const secondaryActions = useMemo(() => {
        const menuItems = [];
        if (canWritePerDiem && policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {})) {
            menuItems.push({
                icon: expensifyIcons.Gear,
                text: translate('common.settings'),
                onSelected: openSettings,
                value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
            });
        }
        if (canWritePerDiem) {
            menuItems.push({
                icon: expensifyIcons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: () => {
                    if (isOffline) {
                        showOfflineModal();
                        return;
                    }
                    Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            });
        }
        if (hasVisibleSubRates) {
            menuItems.push({
                icon: expensifyIcons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        showOfflineModal();
                        return;
                    }
                    close(() =>
                        downloadPerDiemCSV(
                            policyID,
                            () => {
                                setIsDownloadFailureModalVisible(true);
                            },
                            translate,
                        ),
                    );
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }

        return menuItems;
    }, [
        showOfflineModal,
        policy?.areCategoriesEnabled,
        policyCategories,
        canWritePerDiem,
        translate,
        hasVisibleSubRates,
        openSettings,
        isOffline,
        policyID,
        expensifyIcons.Gear,
        expensifyIcons.Table,
        expensifyIcons.Download,
    ]);

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (canWritePerDiem && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : selectedSubRateKeys.length > 0)) {
            options.push({
                icon: expensifyIcons.Trashcan,
                text: translate('workspace.perDiem.deleteRates', {count: selectedSubRateKeys.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: async () => {
                    const {action} = await showConfirmModal({
                        title: translate('workspace.perDiem.deletePerDiemRate'),
                        prompt: translate('workspace.perDiem.areYouSureDelete', {count: selectedSubRateKeys.length}),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });
                    if (action === ModalActions.CONFIRM) {
                        handleDeletePerDiemRates();
                    }
                },
            });

            return (
                <ButtonWithDropdownMenu
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedSubRateKeys.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                    isDisabled={!selectedSubRateKeys.length}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.BULK_ACTIONS_DROPDOWN}
                />
            );
        }

        if (secondaryActions.length === 0) {
            return null;
        }

        return (
            <View style={[styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
                <ButtonWithDropdownMenu
                    variant={undefined}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    options={secondaryActions}
                    isSplitButton={false}
                    wrapperStyle={isInLandscapeMode ? undefined : styles.flexGrow1}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.MORE_DROPDOWN}
                />
            </View>
        );
    };

    const isLoading = !isOffline && customUnit === undefined;
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'WorkspacePerDiemPage', isOffline, isCustomUnitUndefined: customUnit === undefined};

    useEffect(() => {
        if (isMobileSelectionModeEnabled) {
            return;
        }

        setSelectedSubRateKeys([]);
    }, [setSelectedSubRateKeys, isMobileSelectionModeEnabled]);

    useSearchBackPress({
        onClearSelection: clearTableSelection,
        onNavigationCallBack: () => Navigation.goBack(backTo),
    });

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const headerButtons = getHeaderButtons();

    const subtitleContent = (
        <View style={[styles.flexRow, styles.renderHTML, styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <RenderHTML html={translate('workspace.perDiem.subtitle')} />
        </View>
    );

    const emptyStateContent = (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent
                {...genericIllustration}
                title={translate('workspace.perDiem.emptyList.title')}
                subtitle={translate('workspace.perDiem.emptyList.subtitle')}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                buttons={
                    canWritePerDiem
                        ? [
                              {
                                  buttonText: translate('spreadsheet.importSpreadsheet'),
                                  buttonAction: () => {
                                      if (isOffline) {
                                          showOfflineModal();
                                          return;
                                      }
                                      Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
                                  },
                                  success: true,
                              },
                          ]
                        : []
                }
            />
        </ScrollView>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.PER_DIEM}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={[styles.defaultModalContainer]}
                testID="WorkspacePerDiemPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'common.perDiem')}
                    icon={!selectionModeHeader ? illustrations.PerDiem : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    shouldDisplayHelpButton
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            clearTableSelection();
                            turnOffMobileSelectionMode();
                            return;
                        }

                        if (backTo) {
                            Navigation.goBack(backTo);
                            return;
                        }

                        Navigation.goBack();
                    }}
                >
                    {!shouldDisplayButtonsInSeparateLine && headerButtons}
                </HeaderWithBackButton>
                {!!headerButtons && shouldDisplayButtonsInSeparateLine && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}
                {(!hasVisibleSubRates || isLoading) && subtitleContent}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        reasonAttributes={reasonAttributes}
                    />
                )}
                {!isLoading && (
                    <>
                        {hasVisibleSubRates && subtitleContent}
                        <WorkspacePerDiemTable
                            perDiemData={perDiemRows}
                            selectionEnabled={canWritePerDiem}
                            selectedKeys={selectedSubRateKeys}
                            onRowSelectionChange={setSelectedSubRateKeys}
                            EmptyStateComponent={emptyStateContent}
                        />
                    </>
                )}
                <DecisionModal
                    title={translate('common.downloadFailedTitle')}
                    prompt={translate('common.downloadFailedDescription')}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onSecondOptionSubmit={() => setIsDownloadFailureModalVisible(false)}
                    secondOptionText={translate('common.buttonConfirm')}
                    isVisible={isDownloadFailureModalVisible}
                    onClose={() => setIsDownloadFailureModalVisible(false)}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspacePerDiemPage;
