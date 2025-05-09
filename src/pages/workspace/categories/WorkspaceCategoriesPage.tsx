import lodashSortBy from 'lodash/sortBy';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useAutoTurnSelectionModeOffWhenHasNoActiveOption from '@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useEnvironment from '@hooks/useEnvironment';
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
import useThreeDotsAnchorPosition from '@hooks/useThreeDotsAnchorPosition';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import goBackFromWorkspaceCentralScreen from '@libs/Navigation/helpers/goBackFromWorkspaceCentralScreen';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections, shouldShowSyncError} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {close} from '@userActions/Modal';
import {clearCategoryErrors, deleteWorkspaceCategories, downloadCategoriesCSV, openPolicyCategoriesPage, setWorkspaceCategoryEnabled} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyCategory} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PolicyOption = ListItem & {
    /** Category name is used as a key for the selectedCategories state */
    keyForList: string;
};

type WorkspaceCategoriesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceCategoriesPage({route}: WorkspaceCategoriesPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const threeDotsAnchorPosition = useThreeDotsAnchorPosition(styles.threeDotsPopoverOffsetNoCloseButton);
    const {translate} = useLocalize();
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const [deleteCategoriesConfirmModalVisible, setDeleteCategoriesConfirmModalVisible] = useState(false);
    const {environmentURL} = useEnvironment();
    const policyId = route.params.policyID;
    const backTo = route.params?.backTo;
    const policy = usePolicy(policyId);
    const {selectionMode} = useMobileSelectionMode();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyId}`, {canBeMissing: true});
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const isQuickSettingsFlow = !!backTo;
    const filterCategories = useCallback((category: PolicyCategory | undefined) => !!category && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, []);

    const [selectedCategories, setSelectedCategories] = useFilteredSelection(policyCategories, filterCategories);

    const canSelectMultiple = isSmallScreenWidth ? selectionMode?.isEnabled : true;

    const fetchCategories = useCallback(() => {
        openPolicyCategoriesPage(policyId);
    }, [policyId]);

    const {isOffline} = useNetwork({onReconnect: fetchCategories});

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cleanupSelectedOption = useCallback(() => setSelectedCategories([]), [setSelectedCategories]);
    useCleanupSelectedOptions(cleanupSelectedOption);

    useSearchBackPress({
        onClearSelection: () => setSelectedCategories([]),
        onNavigationCallBack: () => Navigation.goBack(backTo),
    });

    const updateWorkspaceRequiresCategory = useCallback(
        (value: boolean, categoryName: string) => {
            setWorkspaceCategoryEnabled(policyId, {[categoryName]: {name: categoryName, enabled: value}});
        },
        [policyId],
    );

    const categoryList = useMemo<PolicyOption[]>(() => {
        const categories = Object.values(policyCategories ?? {});
        return categories.reduce<PolicyOption[]>((acc, value) => {
            const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (!isOffline && isDisabled) {
                return acc;
            }

            acc.push({
                text: value.name,
                keyForList: value.name,
                isSelected: selectedCategories.includes(value.name) && canSelectMultiple,
                isDisabled,
                pendingAction: value.pendingAction,
                errors: value.errors ?? undefined,
                rightElement: (
                    <Switch
                        isOn={value.enabled}
                        disabled={isDisabled}
                        accessibilityLabel={translate('workspace.categories.enableCategory')}
                        onToggle={(newValue: boolean) => updateWorkspaceRequiresCategory(newValue, value.name)}
                    />
                ),
            });

            return acc;
        }, []);
    }, [policyCategories, isOffline, selectedCategories, canSelectMultiple, translate, updateWorkspaceRequiresCategory]);

    const filterCategory = useCallback((categoryOption: PolicyOption, searchInput: string) => {
        const categoryText = StringUtils.normalize(categoryOption.text?.toLowerCase() ?? '');
        const alternateText = StringUtils.normalize(categoryOption.alternateText?.toLowerCase() ?? '');
        const normalizedSearchInput = StringUtils.normalize(searchInput);
        return categoryText.includes(normalizedSearchInput) || alternateText.includes(normalizedSearchInput);
    }, []);
    const sortCategories = useCallback((data: PolicyOption[]) => {
        return lodashSortBy(data, 'text', localeCompare) as PolicyOption[];
    }, []);
    const [inputValue, setInputValue, filteredCategoryList] = useSearchResults(categoryList, filterCategory, sortCategories);

    useAutoTurnSelectionModeOffWhenHasNoActiveOption(filteredCategoryList);

    const toggleCategory = useCallback(
        (category: PolicyOption) => {
            setSelectedCategories((prev) => {
                if (prev.includes(category.keyForList)) {
                    return prev.filter((key) => key !== category.keyForList);
                }
                return [...prev, category.keyForList];
            });
        },
        [setSelectedCategories],
    );

    const toggleAllCategories = () => {
        const availableCategories = filteredCategoryList.filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const someSelected = availableCategories.some((category) => selectedCategories.includes(category.keyForList));
        setSelectedCategories(someSelected ? [] : availableCategories.map((item) => item.keyForList));
    };

    const getCustomListHeader = () => {
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate('common.enabled')}
            />
        );
    };

    const navigateToCategorySettings = (category: PolicyOption) => {
        if (isSmallScreenWidth && selectionMode?.isEnabled) {
            toggleCategory(category);
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList, backTo)
                : ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList),
        );
    };

    const navigateToCategoriesSettings = () => {
        Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_SETTINGS.getRoute(policyId, backTo) : ROUTES.WORKSPACE_CATEGORIES_SETTINGS.getRoute(policyId));
    };

    const navigateToCreateCategoryPage = () => {
        Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORY_CREATE.getRoute(policyId, backTo) : ROUTES.WORKSPACE_CATEGORY_CREATE.getRoute(policyId));
    };

    const dismissError = (item: PolicyOption) => {
        clearCategoryErrors(policyId, item.keyForList);
    };

    const handleDeleteCategories = () => {
        setSelectedCategories([]);
        deleteWorkspaceCategories(policyId, selectedCategories);
        setDeleteCategoriesConfirmModalVisible(false);
    };

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;

        if (isSmallScreenWidth ? canSelectMultiple : selectedCategories.length > 0) {
            if (!isThereAnyAccountingConnection) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedCategories.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: () => setDeleteCategoriesConfirmModalVisible(true),
                });
            }

            const enabledCategories = selectedCategories.filter((categoryName) => policyCategories?.[categoryName]?.enabled);
            if (enabledCategories.length > 0) {
                const categoriesToDisable = selectedCategories
                    .filter((categoryName) => policyCategories?.[categoryName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: false,
                        };
                        return acc;
                    }, {});

                options.push({
                    icon: Expensicons.Close,
                    text: translate(enabledCategories.length === 1 ? 'workspace.categories.disableCategory' : 'workspace.categories.disableCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        setSelectedCategories([]);
                        setWorkspaceCategoryEnabled(policyId, categoriesToDisable);
                    },
                });
            }

            const disabledCategories = selectedCategories.filter((categoryName) => !policyCategories?.[categoryName]?.enabled);
            if (disabledCategories.length > 0) {
                const categoriesToEnable = selectedCategories
                    .filter((categoryName) => !policyCategories?.[categoryName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: true,
                        };
                        return acc;
                    }, {});
                options.push({
                    icon: Expensicons.Checkmark,
                    text: translate(disabledCategories.length === 1 ? 'workspace.categories.enableCategory' : 'workspace.categories.enableCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        setSelectedCategories([]);
                        setWorkspaceCategoryEnabled(policyId, categoriesToEnable);
                    },
                });
            }

            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedCategories.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    isDisabled={!selectedCategories.length}
                    testID={`${WorkspaceCategoriesPage.displayName}-header-dropdown-menu-button`}
                />
            );
        }

        return (
            <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                {!hasAccountingConnections(policy) && (
                    <Button
                        success
                        onPress={navigateToCreateCategoryPage}
                        icon={Expensicons.Plus}
                        text={translate('workspace.categories.addCategory')}
                        style={[shouldUseNarrowLayout && styles.flex1]}
                    />
                )}
                <Button
                    onPress={navigateToCategoriesSettings}
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
            </View>
        );
    };

    const isLoading = !isOffline && policyCategories === undefined;

    useEffect(() => {
        if (selectionMode?.isEnabled) {
            return;
        }

        setSelectedCategories([]);
    }, [setSelectedCategories, selectionMode?.isEnabled]);

    const hasVisibleCategories = categoryList.some((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const threeDotsMenuItems = useMemo(() => {
        const menuItems = [];
        if (!hasAccountingConnections(policy)) {
            menuItems.push({
                icon: Expensicons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: () => {
                    if (isOffline) {
                        close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    Navigation.navigate(
                        isQuickSettingsFlow
                            ? ROUTES.SETTINGS_CATEGORIES_IMPORT.getRoute(policyId, ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyId, backTo))
                            : ROUTES.WORKSPACE_CATEGORIES_IMPORT.getRoute(policyId),
                    );
                },
            });
        }
        if (hasVisibleCategories) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    close(() => {
                        downloadCategoriesCSV(policyId, () => {
                            setIsDownloadFailureModalVisible(true);
                        });
                    });
                },
            });
        }

        return menuItems;
    }, [policyId, translate, isOffline, hasVisibleCategories, policy, isQuickSettingsFlow, backTo]);

    const selectionModeHeader = selectionMode?.isEnabled && shouldUseNarrowLayout;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyId}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={WorkspaceCategoriesPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.categories')}
                    icon={!selectionModeHeader ? Illustrations.FolderOpen : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedCategories([]);
                            turnOffMobileSelectionMode();
                            return;
                        }

                        if (backTo) {
                            Navigation.goBack(backTo);
                            return;
                        }

                        goBackFromWorkspaceCentralScreen(policyId);
                    }}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={threeDotsMenuItems}
                    threeDotsAnchorPosition={threeDotsAnchorPosition}
                >
                    {!shouldUseNarrowLayout && getHeaderButtons()}
                </HeaderWithBackButton>
                <ConfirmModal
                    isVisible={deleteCategoriesConfirmModalVisible}
                    onConfirm={handleDeleteCategories}
                    onCancel={() => setDeleteCategoriesConfirmModalVisible(false)}
                    title={translate(selectedCategories.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories')}
                    prompt={translate(selectedCategories.length === 1 ? 'workspace.categories.deleteCategoryPrompt' : 'workspace.categories.deleteCategoriesPrompt')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {!hasSyncError && isConnectionVerified ? (
                        <Text>
                            <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.categories.importedFromAccountingSoftware')} `}</Text>
                            <TextLink
                                style={[styles.textNormal, styles.link]}
                                href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyId)}`}
                            >
                                {`${currentConnectionName} ${translate('workspace.accounting.settings')}`}
                            </TextLink>
                            <Text style={[styles.textNormal, styles.colorMuted]}>.</Text>
                        </Text>
                    ) : (
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.categories.subtitle')}</Text>
                    )}
                </View>
                {categoryList.length > CONST.SEARCH_ITEM_LIMIT && (
                    <SearchBar
                        label={translate('workspace.categories.findCategory')}
                        inputValue={inputValue}
                        onChangeText={setInputValue}
                        shouldShowEmptyState={hasVisibleCategories && !isLoading && filteredCategoryList.length === 0}
                    />
                )}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}
                {!hasVisibleCategories && !isLoading && inputValue.length === 0 && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        <EmptyStateComponent
                            SkeletonComponent={TableListItemSkeleton}
                            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                            headerMedia={LottieAnimations.GenericEmptyState}
                            title={translate('workspace.categories.emptyCategories.title')}
                            subtitle={translate('workspace.categories.emptyCategories.subtitle')}
                            headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]}
                            lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                            headerContentStyles={styles.emptyStateFolderWebStyles}
                        />
                    </ScrollView>
                )}
                {hasVisibleCategories && !isLoading && (
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress={isSmallScreenWidth}
                        onTurnOnSelectionMode={(item) => item && toggleCategory(item)}
                        sections={[{data: filteredCategoryList, isDisabled: false}]}
                        onCheckboxPress={toggleCategory}
                        onSelectRow={navigateToCategorySettings}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        onSelectAll={toggleAllCategories}
                        ListItem={TableListItem}
                        onDismissError={dismissError}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
                        addBottomSafeAreaPadding
                    />
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

WorkspaceCategoriesPage.displayName = 'WorkspaceCategoriesPage';

export default WorkspaceCategoriesPage;
