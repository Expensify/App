import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import SelectionListWithModal from '@components/SelectionListWithModal';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {turnOffMobileSelectionMode} from '@userActions/MobileSelectionMode';
import {close} from '@userActions/Modal';
import {deleteWorkspacePerDiemRates, downloadPerDiemCSV, openPolicyPerDiemPage} from '@userActions/Policy/PerDiem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PolicyOption = ListItem & {
    /** subRateID is used as a key for identification of the entry */
    subRateID: string;

    /** rateID is used as a key for identification of the entry */
    rateID: string;

    /** subRateName is used for filters */
    subRateName: string;
};

type SubRateData = {
    pendingAction?: PendingAction;
    destination: string;
    subRateName: string;
    rate: number;
    currency: string;
    rateID: string;
    subRateID: string;
};

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

function generateSingleSubRateData(customUnitRates: Rate[], rateID: string, subRateID: string) {
    const selectedRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
    if (!selectedRate) {
        return null;
    }
    const selectedSubRate = selectedRate.subRates?.find((subRate) => subRate.id === subRateID);
    if (!selectedSubRate) {
        return null;
    }
    return {
        pendingAction: selectedRate.pendingAction,
        destination: selectedRate.name ?? '',
        subRateName: selectedSubRate.name,
        rate: selectedSubRate.rate,
        currency: selectedRate.currency ?? CONST.CURRENCY.USD,
        rateID: selectedRate.customUnitRateID,
        subRateID: selectedSubRate.id,
    };
}

type WorkspacePerDiemPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspacePerDiemPage({route}: WorkspacePerDiemPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [selectedPerDiem, setSelectedPerDiem] = useState<SubRateData[]>([]);
    const [deletePerDiemConfirmModalVisible, setDeletePerDiemConfirmModalVisible] = useState(false);
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const policyID = route.params.policyID;
    const backTo = route.params?.backTo;
    const policy = usePolicy(policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: false});
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const illustrations = useMemoizedLazyIllustrations(['PerDiem'] as const);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear', 'Table', 'Download', 'Trashcan'] as const);

    const [customUnit, allRatesArray, allSubRates] = useMemo(() => {
        const customUnits = getPerDiemCustomUnit(policy);
        const customUnitRates: Record<string, Rate> = customUnits?.rates ?? {};
        const allRates = Object.values(customUnitRates);
        const allSubRatesMemo = getSubRatesData(allRates);
        return [customUnits, allRates, allSubRatesMemo];
    }, [policy]);

    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;

    const fetchPerDiem = useCallback(() => {
        openPolicyPerDiemPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchPerDiem});

    useFocusEffect(
        useCallback(() => {
            fetchPerDiem();
        }, [fetchPerDiem]),
    );

    const cleanupSelectedOption = useCallback(() => setSelectedPerDiem([]), []);
    useCleanupSelectedOptions(cleanupSelectedOption);

    const subRatesList = useMemo<PolicyOption[]>(
        () =>
            allSubRates.map((value) => {
                const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                return {
                    text: value.destination,
                    subRateID: value.subRateID,
                    rateID: value.rateID,
                    keyForList: value.subRateID,
                    isDisabled,
                    pendingAction: value.pendingAction,
                    subRateName: value.subRateName,
                    rightElement: (
                        <>
                            <View style={styles.flex2}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.alignItemsStart, styles.textSupporting, styles.label, styles.pl2]}
                                >
                                    {value.subRateName}
                                </Text>
                            </View>
                            <View style={styles.flex2}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.alignSelfEnd, styles.textSupporting, styles.pl2, styles.label]}
                                >
                                    {convertAmountToDisplayString(value.rate, value.currency)}
                                </Text>
                            </View>
                        </>
                    ),
                };
            }),
        [allSubRates, styles.flex2, styles.alignItemsStart, styles.textSupporting, styles.label, styles.pl2, styles.alignSelfEnd],
    );

    const filterRate = useCallback((rate: PolicyOption, searchInput: string) => {
        const results = tokenizedSearch([rate], searchInput, (option) => [option.text ?? '', option.subRateName ?? '']);
        return results.length > 0;
    }, []);
    const sortRates = useCallback((rates: PolicyOption[]) => rates.sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')), [localeCompare]);
    const [inputValue, setInputValue, filteredSubRatesList] = useSearchResults(subRatesList, filterRate, sortRates);

    const toggleSubRate = (subRate: PolicyOption) => {
        if (selectedPerDiem.find((selectedSubRate) => selectedSubRate.subRateID === subRate.subRateID) !== undefined) {
            setSelectedPerDiem((prev) => prev.filter((selectedSubRate) => selectedSubRate.subRateID !== subRate.subRateID));
        } else {
            const subRateData = generateSingleSubRateData(allRatesArray, subRate.rateID, subRate.subRateID);
            if (!subRateData) {
                return;
            }
            setSelectedPerDiem((prev) => [...prev, subRateData]);
        }
    };

    const toggleAllSubRates = () => {
        if (selectedPerDiem.length > 0) {
            setSelectedPerDiem([]);
        } else {
            const availablePerDiemRates = allSubRates.filter(
                (subRate) =>
                    subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && filteredSubRatesList.some((filteredSubRate) => filteredSubRate.subRateID === subRate.subRateID),
            );
            setSelectedPerDiem(availablePerDiemRates);
        }
    };

    const getCustomListHeader = () => {
        if (filteredSubRatesList.length === 0) {
            return null;
        }
        const header = (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, canSelectMultiple && styles.pl3, styles.mr6]}>
                <View style={styles.flex3}>
                    <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.destination')}</Text>
                </View>
                <View style={styles.flex2}>
                    <Text style={[styles.textMicroSupporting, styles.alignItemsStart, styles.pl2]}>{translate('common.subrate')}</Text>
                </View>
                <View style={styles.flex2}>
                    <Text style={[styles.textMicroSupporting, styles.alignSelfEnd]}>{translate('workspace.perDiem.amount')}</Text>
                </View>
            </View>
        );
        if (canSelectMultiple) {
            return header;
        }
        return <View style={!canSelectMultiple && [styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    const openSettings = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_SETTINGS.getRoute(policyID));
    }, [policyID]);

    const openSubRateDetails = (rate: PolicyOption) => {
        if (isSmallScreenWidth && isMobileSelectionModeEnabled) {
            toggleSubRate(rate);
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rate.rateID, rate.subRateID));
    };

    const handleDeletePerDiemRates = () => {
        deleteWorkspacePerDiemRates(policyID, customUnit, selectedPerDiem);
        setDeletePerDiemConfirmModalVisible(false);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedPerDiem([]);
        });
    };

    const hasVisibleSubRates = subRatesList.some((subRate) => subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const secondaryActions = useMemo(() => {
        const menuItems = [];
        if (policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {})) {
            menuItems.push({
                icon: expensifyIcons.Gear,
                text: translate('common.settings'),
                onSelected: openSettings,
                value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
            });
        }
        menuItems.push({
            icon: expensifyIcons.Table,
            text: translate('spreadsheet.importSpreadsheet'),
            onSelected: () => {
                if (isOffline) {
                    close(() => setIsOfflineModalVisible(true));
                    return;
                }
                Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
            },
            value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
        });
        if (hasVisibleSubRates) {
            menuItems.push({
                icon: expensifyIcons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    close(() =>
                        downloadPerDiemCSV(policyID, () => {
                            setIsDownloadFailureModalVisible(true);
                        }),
                    );
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }

        return menuItems;
    }, [
        policy?.areCategoriesEnabled,
        policyCategories,
        translate,
        hasVisibleSubRates,
        openSettings,
        isOffline,
        policyID,
        expensifyIcons.Gear,
        expensifyIcons.Table,
        expensifyIcons.Download,
    ]);

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (shouldUseNarrowLayout ? canSelectMultiple : selectedPerDiem.length > 0) {
            options.push({
                icon: expensifyIcons.Trashcan,
                text: translate('workspace.perDiem.deleteRates', {count: selectedPerDiem.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => setDeletePerDiemConfirmModalVisible(true),
            });

            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedPerDiem.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    isDisabled={!selectedPerDiem.length}
                />
            );
        }

        return (
            <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    options={secondaryActions}
                    isSplitButton={false}
                    wrapperStyle={styles.flexGrow1}
                />
            </View>
        );
    };

    const isLoading = !isOffline && customUnit === undefined;

    useEffect(() => {
        if (isMobileSelectionModeEnabled) {
            return;
        }

        setSelectedPerDiem([]);
    }, [setSelectedPerDiem, isMobileSelectionModeEnabled]);

    useSearchBackPress({
        onClearSelection: () => {
            setSelectedPerDiem([]);
        },
        onNavigationCallBack: () => Navigation.goBack(backTo),
    });

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const headerContent = (
        <>
            <View style={[styles.renderHTML, styles.ph5, styles.pb5, styles.pt3, styles.flexRow, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <RenderHTML html={translate('workspace.perDiem.subtitle')} />
            </View>
            {subRatesList.length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.perDiem.findPerDiemRate')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={hasVisibleSubRates && !isLoading && filteredSubRatesList.length === 0}
                />
            )}
        </>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={WorkspacePerDiemPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'common.perDiem')}
                    icon={!selectionModeHeader ? illustrations.PerDiem : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedPerDiem([]);
                            turnOffMobileSelectionMode();
                            return;
                        }

                        if (backTo) {
                            Navigation.goBack(backTo);
                            return;
                        }

                        Navigation.popToSidebar();
                    }}
                >
                    {!shouldUseNarrowLayout && getHeaderButtons()}
                </HeaderWithBackButton>
                <ConfirmModal
                    isVisible={deletePerDiemConfirmModalVisible}
                    onConfirm={handleDeletePerDiemRates}
                    onCancel={() => setDeletePerDiemConfirmModalVisible(false)}
                    title={translate('workspace.perDiem.deletePerDiemRate')}
                    prompt={translate('workspace.perDiem.areYouSureDelete', {count: selectedPerDiem.length})}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                {(!hasVisibleSubRates || isLoading) && headerContent}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}
                {hasVisibleSubRates && !isLoading && (
                    <SelectionListWithModal
                        addBottomSafeAreaPadding
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleSubRate(item)}
                        sections={[{data: filteredSubRatesList, isDisabled: false}]}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        selectedItems={selectedPerDiem.map((item) => item.subRateID)}
                        onCheckboxPress={toggleSubRate}
                        onSelectRow={openSubRateDetails}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        onSelectAll={filteredSubRatesList.length > 0 ? toggleAllSubRates : undefined}
                        ListItem={TableListItem}
                        listHeaderContent={headerContent}
                        shouldShowListEmptyContent={false}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        listItemTitleContainerStyles={styles.flex3}
                        showScrollIndicator={false}
                        shouldShowRightCaret
                    />
                )}
                {!hasVisibleSubRates && !isLoading && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        <EmptyStateComponent
                            SkeletonComponent={TableListItemSkeleton}
                            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                            headerMedia={LottieAnimations.GenericEmptyState}
                            title={translate('workspace.perDiem.emptyList.title')}
                            subtitle={translate('workspace.perDiem.emptyList.subtitle')}
                            headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]}
                            lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                            headerContentStyles={styles.emptyStateFolderWebStyles}
                            buttons={[
                                {
                                    buttonText: translate('spreadsheet.importSpreadsheet'),
                                    buttonAction: () => {
                                        if (isOffline) {
                                            setIsOfflineModalVisible(true);
                                            return;
                                        }
                                        Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
                                    },
                                    success: true,
                                },
                            ]}
                        />
                    </ScrollView>
                )}
                <ConfirmModal
                    isVisible={isOfflineModalVisible}
                    onConfirm={() => setIsOfflineModalVisible(false)}
                    title={translate('common.youAppearToBeOffline')}
                    prompt={translate('common.thisFeatureRequiresInternet')}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
                    onCancel={() => setIsOfflineModalVisible(false)}
                    shouldHandleNavigationBack
                />
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

WorkspacePerDiemPage.displayName = 'WorkspacePerDiemPage';

export default WorkspacePerDiemPage;
