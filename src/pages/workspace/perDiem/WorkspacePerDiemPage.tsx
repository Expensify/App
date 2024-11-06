import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashSortBy from 'lodash/sortBy';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Modal from '@userActions/Modal';
import * as PerDiem from '@userActions/Policy/PerDiem';
import CONST from '@src/CONST';
// import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PolicyOption = ListItem & {
    /** subRateID is used as a key for identification of the entry */
    subRateID: string;

    /** rateID is used as a key for identification of the entry */
    rateID: string;
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
                    rateID: rate.customUnitRateID ?? '',
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
        rateID: selectedRate.customUnitRateID ?? '',
        subRateID: selectedSubRate.id,
    };
}

type WorkspacePerDiemPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspacePerDiemPage({route}: WorkspacePerDiemPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [selectedPerDiem, setSelectedPerDiem] = useState<SubRateData[]>([]);
    const [deletePerDiemConfirmModalVisible, setDeletePerDiemConfirmModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID ?? '-1';
    const backTo = route.params?.backTo;
    const policy = usePolicy(policyID);
    const {selectionMode} = useMobileSelectionMode();

    const customUnit = getPerDiemCustomUnit(policy);
    const customUnitRates: Record<string, Rate> = useMemo(() => customUnit?.rates ?? {}, [customUnit]);

    const allRatesArray = Object.values(customUnitRates);

    const allSubRates = getSubRatesData(allRatesArray);

    // Filter out rates that will be deleted
    const allSelectableSubRates = useMemo(() => allSubRates.filter((subRate) => subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE), [allSubRates]);

    const canSelectMultiple = shouldUseNarrowLayout ? selectionMode?.isEnabled : true;

    const fetchPerDiem = useCallback(() => {
        PerDiem.openPolicyPerDiemPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchPerDiem});

    useFocusEffect(
        useCallback(() => {
            fetchPerDiem();
        }, [fetchPerDiem]),
    );

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedPerDiem([]);
    }, [isFocused]);

    const subRatesList = useMemo<PolicyOption[]>(
        () =>
            (lodashSortBy(allSubRates, 'destination', localeCompare) as SubRateData[]).map((value) => {
                const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                return {
                    text: value.destination,
                    subRateID: value.subRateID,
                    rateID: value.rateID,
                    keyForList: value.subRateID,
                    isSelected: selectedPerDiem.find((rate) => rate.subRateID === value.subRateID) !== undefined && canSelectMultiple,
                    isDisabled,
                    pendingAction: value.pendingAction,
                    rightElement: (
                        <>
                            <View style={styles.flex1}>
                                <Text style={[styles.alignItemsStart, styles.textSupporting, styles.label]}>{value.subRateName}</Text>
                            </View>
                            <View style={styles.flex1}>
                                <Text style={[styles.alignSelfEnd, styles.textSupporting, styles.pl2, styles.label]}>
                                    {CurrencyUtils.convertAmountToDisplayString(value.rate, value.currency)}
                                </Text>
                            </View>
                            <ListItemRightCaretWithLabel />
                        </>
                    ),
                };
            }),
        [allSubRates, selectedPerDiem, canSelectMultiple, styles.flex1, styles.alignItemsStart, styles.textSupporting, styles.label, styles.alignSelfEnd, styles.pl2],
    );

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
        if (selectedPerDiem.length === allSelectableSubRates.length) {
            setSelectedPerDiem([]);
        } else {
            setSelectedPerDiem([...allSelectableSubRates]);
        }
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr8, !canSelectMultiple && styles.m5]}>
            <View style={styles.flex1}>
                <Text style={[styles.searchInputStyle, styles.alignSelfStart]}>{translate('workspace.perDiem.destination')}</Text>
            </View>
            <View style={styles.flex1}>
                <Text style={[styles.searchInputStyle, styles.alignItemsStart]}>{translate('workspace.perDiem.subrate')}</Text>
            </View>
            <View style={styles.flex1}>
                <Text style={[styles.searchInputStyle, styles.alignSelfEnd]}>{translate('workspace.perDiem.amount')}</Text>
            </View>
        </View>
    );

    const openSettings = () => {
        // TODO: Uncomment this when the import feature is ready
        // Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_RATES_SETTINGS.getRoute(policyID));
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const openSubRateDetails = (rate: PolicyOption) => {
        // TODO: Uncomment this when the import feature is ready
        // Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_RATE_DETAILS.getRoute(policyID, rate.rateID, rate.subRateID));
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dismissError = (item: PolicyOption) => {
        // TODO: Implement this when the editing feature is ready
    };

    const handleDeletePerDiemRates = () => {
        setSelectedPerDiem([]);
        setDeletePerDiemConfirmModalVisible(false);
    };

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (shouldUseNarrowLayout ? canSelectMultiple : selectedPerDiem.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('workspace.perDiem.deleteRates', {count: selectedPerDiem.length}),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => setDeletePerDiemConfirmModalVisible(true),
            });

            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
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
                <Button
                    onPress={openSettings}
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
            </View>
        );
    };

    const isLoading = !isOffline && customUnit === undefined;

    useEffect(() => {
        if (selectionMode?.isEnabled) {
            return;
        }

        setSelectedPerDiem([]);
    }, [setSelectedPerDiem, selectionMode?.isEnabled]);

    const hasVisibleSubRates = subRatesList.some((subRate) => subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.perDiem.subtitle')}</Text>
        </View>
    );

    const threeDotsMenuItems = useMemo(() => {
        const menuItems = [
            {
                icon: Expensicons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                // eslint-disable-next-line rulesdir/prefer-early-return
                onSelected: () => {
                    if (isOffline) {
                        Modal.close(() => setIsOfflineModalVisible(true));
                        // eslint-disable-next-line no-useless-return
                        return;
                    }
                    // TODO: Uncomment this when the import feature is ready
                    // Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
                },
            },
            {
                icon: Expensicons.Download,
                text: translate('spreadsheet.downloadCSV'),
                // eslint-disable-next-line rulesdir/prefer-early-return
                onSelected: () => {
                    if (isOffline) {
                        Modal.close(() => setIsOfflineModalVisible(true));
                        // eslint-disable-next-line no-useless-return
                        return;
                    }
                    // Category.downloadPerDiemCSV(policyID);
                },
            },
        ];

        return menuItems;
    }, [translate, isOffline]);

    const selectionModeHeader = selectionMode?.isEnabled && shouldUseNarrowLayout;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspacePerDiemPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.perDiem')}
                    icon={!selectionModeHeader ? Illustrations.PerDiem : undefined}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedPerDiem([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack(backTo);
                    }}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={threeDotsMenuItems}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
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
                {(!shouldUseNarrowLayout || !hasVisibleSubRates || isLoading) && getHeaderText()}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}

                {!hasVisibleSubRates && !isLoading && (
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
                                // eslint-disable-next-line rulesdir/prefer-early-return
                                buttonAction: () => {
                                    if (isOffline) {
                                        setIsOfflineModalVisible(true);
                                        // eslint-disable-next-line no-useless-return
                                        return;
                                    }
                                    // TODO: Uncomment this when the import feature is ready
                                    // Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
                                },
                                success: true,
                            },
                        ]}
                    />
                )}
                {hasVisibleSubRates && !isLoading && (
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleSubRate(item)}
                        sections={[{data: subRatesList, isDisabled: false}]}
                        onCheckboxPress={toggleSubRate}
                        onSelectRow={openSubRateDetails}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        onSelectAll={toggleAllSubRates}
                        ListItem={TableListItem}
                        onDismissError={dismissError}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        listHeaderContent={shouldUseNarrowLayout ? getHeaderText() : null}
                        showScrollIndicator={false}
                    />
                )}

                <ConfirmModal
                    isVisible={isOfflineModalVisible}
                    onConfirm={() => setIsOfflineModalVisible(false)}
                    title={translate('common.youAppearToBeOffline')}
                    prompt={translate('common.thisFeatureRequiresInternet')}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspacePerDiemPage.displayName = 'WorkspacePerDiemPage';

export default WorkspacePerDiemPage;
