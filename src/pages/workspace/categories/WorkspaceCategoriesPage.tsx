import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useAutoTurnSelectionModeOffWhenHasNoActiveOption from '@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import usePolicyData from '@hooks/usePolicyData';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isDisablingOrDeletingLastEnabledCategory} from '@libs/OptionsListUtils';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections, isControlPolicy, shouldShowSyncError} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {close} from '@userActions/Modal';
import {clearCategoryErrors, deleteWorkspaceCategories, downloadCategoriesCSV, openPolicyCategoriesPage, setWorkspaceCategoryEnabled} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type WorkspaceCategoriesPageProps =
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT>;

function WorkspaceCategoriesPage({route}: WorkspaceCategoriesPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, localeCompare} = useLocalize();
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const [deleteCategoriesConfirmModalVisible, setDeleteCategoriesConfirmModalVisible] = useState(false);
    const [isCannotDeleteOrDisableLastCategoryModalVisible, setIsCannotDeleteOrDisableLastCategoryModalVisible] = useState(false);
    const {environmentURL} = useEnvironment();
    const {backTo, policyID: policyId} = route.params;
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const policyData = usePolicyData(policyId);
    const {policy, categories: policyCategories} = policyData;
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const canSelectMultiple = isSmallScreenWidth ? isMobileSelectionModeEnabled : true;
    const isControlPolicyWithWideLayout = !shouldUseNarrowLayout && isControlPolicy(policy);
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'Gear', 'Table']);
    const illustrations = useMemoizedLazyIllustrations(['FolderOpen']);

    const {
        taskReport: setupCategoryTaskReport,
        taskParentReport: setupCategoryTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES);

    const fetchCategories = useCallback(() => {
        openPolicyCategoriesPage(policyId);
    }, [policyId]);

    const {isOffline} = useNetwork({onReconnect: fetchCategories});

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cleanupSelectedOption = useCallback(() => setSelectedCategories([]), []);
    useCleanupSelectedOptions(cleanupSelectedOption);

    useEffect(() => {
        if (selectedCategories.length === 0 || !canSelectMultiple) {
            return;
        }

        setSelectedCategories((prevSelectedCategories) => {
            const newSelectedCategories = [];

            for (const categoryName of prevSelectedCategories) {
                const categoryExists = policyCategories?.[categoryName];
                if (!categoryExists) {
                    const renamedCategory = Object.entries(policyCategories ?? {}).find(([, category]) => category.previousCategoryName === categoryName);
                    if (renamedCategory) {
                        newSelectedCategories.push(renamedCategory[0]);
                        continue;
                    }
                }

                if (categoryExists && categoryExists.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    newSelectedCategories.push(categoryName);
                }
            }

            return newSelectedCategories;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyCategories]);

    useSearchBackPress({
        onClearSelection: () => setSelectedCategories([]),
        onNavigationCallBack: () => Navigation.goBack(backTo),
    });

    const updateWorkspaceCategoryEnabled = useCallback(
        (value: boolean, categoryName: string) => {
            setWorkspaceCategoryEnabled(
                policyData,
                {[categoryName]: {name: categoryName, enabled: value}},
                isSetupCategoryTaskParentReportArchived,
                setupCategoryTaskReport,
                setupCategoryTaskParentReport,
                currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
            );
        },
        [
            policyData,
            isSetupCategoryTaskParentReportArchived,
            setupCategoryTaskReport,
            setupCategoryTaskParentReport,
            currentUserPersonalDetails.accountID,
            hasOutstandingChildTask,
            parentReportAction,
        ],
    );

    const glCodeContainerStyle = useMemo(() => [styles.flex1], [styles.flex1]);
    const glCodeTextStyle = useMemo(() => [styles.alignSelfStart], [styles.alignSelfStart]);
    const switchContainerStyle = useMemo(() => [StyleUtils.getMinimumWidth(variables.w72)], [StyleUtils]);

    const categoryList = useMemo<ListItem[]>(() => {
        const categories = Object.values(policyCategories ?? {});
        return categories.reduce<ListItem[]>((acc, value) => {
            const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (!isOffline && isDisabled) {
                return acc;
            }

            acc.push({
                text: getDecodedCategoryName(value.name),
                keyForList: value.name,
                isDisabled,
                pendingAction: value.pendingAction,
                errors: value.errors ?? undefined,
                rightElement: isControlPolicyWithWideLayout ? (
                    <>
                        <View style={glCodeContainerStyle}>
                            <Text
                                numberOfLines={1}
                                style={glCodeTextStyle}
                            >
                                {value['GL Code']}
                            </Text>
                        </View>
                        <View style={switchContainerStyle}>
                            <Switch
                                isOn={value.enabled}
                                disabled={isDisabled}
                                accessibilityLabel={`${translate('workspace.categories.enableCategory')}: ${getDecodedCategoryName(value.name)}`}
                                onToggle={(newValue: boolean) => {
                                    if (isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, [value])) {
                                        setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                                        return;
                                    }
                                    updateWorkspaceCategoryEnabled(newValue, value.name);
                                }}
                                showLockIcon={isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, [value])}
                            />
                        </View>
                    </>
                ) : (
                    <Switch
                        isOn={value.enabled}
                        disabled={isDisabled}
                        accessibilityLabel={`${translate('workspace.categories.enableCategory')}: ${getDecodedCategoryName(value.name)}`}
                        onToggle={(newValue: boolean) => {
                            if (isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, [value])) {
                                setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                                return;
                            }
                            updateWorkspaceCategoryEnabled(newValue, value.name);
                        }}
                        showLockIcon={isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, [value])}
                    />
                ),
            });

            return acc;
        }, []);
    }, [policyCategories, isOffline, translate, updateWorkspaceCategoryEnabled, policy, isControlPolicyWithWideLayout, glCodeContainerStyle, glCodeTextStyle, switchContainerStyle]);

    const filterCategory = useCallback((categoryOption: ListItem, searchInput: string) => {
        const results = tokenizedSearch([categoryOption], searchInput, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    }, []);
    const sortCategories = useCallback(
        (data: ListItem[]) => {
            return data.sort((a, b) => localeCompare(a.text ?? '', b?.text ?? ''));
        },
        [localeCompare],
    );
    const [inputValue, setInputValue, filteredCategoryList] = useSearchResults(categoryList, filterCategory, sortCategories);

    useAutoTurnSelectionModeOffWhenHasNoActiveOption(categoryList);

    const toggleCategory = useCallback(
        (category: ListItem) => {
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
        if (filteredCategoryList.length === 0) {
            return null;
        }

        // Show GL Code column only on wide screens for control policies
        if (isControlPolicyWithWideLayout) {
            return (
                <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3]}>
                    <View style={[styles.flex1, StyleUtils.getPaddingRight(variables.w52 + variables.w12)]}>
                        <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.name')}</Text>
                    </View>
                    <View style={[styles.flex1, styles.pr16]}>
                        <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('workspace.categories.glCode')}</Text>
                    </View>
                    <View style={[StyleUtils.getMinimumWidth(variables.w72), styles.mr5]}>
                        <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.enabled')}</Text>
                    </View>
                </View>
            );
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

    const navigateToCategorySettings = (category: ListItem) => {
        if (isSmallScreenWidth && isMobileSelectionModeEnabled) {
            toggleCategory(category);
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList, backTo)
                : ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList),
        );
    };

    const navigateToCategoriesSettings = useCallback(() => {
        Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_SETTINGS.getRoute(policyId, backTo) : ROUTES.WORKSPACE_CATEGORIES_SETTINGS.getRoute(policyId));
    }, [isQuickSettingsFlow, policyId, backTo]);

    const navigateToCreateCategoryPage = () => {
        Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORY_CREATE.getRoute(policyId, backTo) : ROUTES.WORKSPACE_CATEGORY_CREATE.getRoute(policyId));
    };

    const dismissError = (item: ListItem) => {
        clearCategoryErrors(policyId, item.keyForList, policyCategories);
    };

    const handleDeleteCategories = () => {
        if (selectedCategories.length > 0) {
            deleteWorkspaceCategories(
                policyData,
                selectedCategories,
                isSetupCategoryTaskParentReportArchived,
                setupCategoryTaskReport,
                setupCategoryTaskParentReport,
                currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
            );
        }
        setDeleteCategoriesConfirmModalVisible(false);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedCategories([]);
        });
    };
    const hasVisibleCategories = categoryList.some((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const policyHasAccountingConnections = hasAccountingConnections(policy);

    const navigateToImportSpreadsheet = useCallback(() => {
        if (isOffline) {
            close(() => setIsOfflineModalVisible(true));
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_CATEGORIES_IMPORT.getRoute(policyId, ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyId, backTo))
                : ROUTES.WORKSPACE_CATEGORIES_IMPORT.getRoute(policyId),
        );
    }, [backTo, isOffline, isQuickSettingsFlow, policyId]);

    const secondaryActions = useMemo(() => {
        const menuItems = [];
        menuItems.push({
            icon: icons.Gear,
            text: translate('common.settings'),
            onSelected: navigateToCategoriesSettings,
            value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
        });
        if (!policyHasAccountingConnections) {
            menuItems.push({
                icon: icons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: navigateToImportSpreadsheet,
                value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            });
        }
        if (hasVisibleCategories) {
            menuItems.push({
                icon: icons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    close(() => {
                        downloadCategoriesCSV(
                            policyId,
                            () => {
                                setIsDownloadFailureModalVisible(true);
                            },
                            translate,
                        );
                    });
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }

        return menuItems;
    }, [
        icons.Download,
        icons.Gear,
        icons.Table,
        translate,
        navigateToCategoriesSettings,
        policyHasAccountingConnections,
        hasVisibleCategories,
        navigateToImportSpreadsheet,
        isOffline,
        policyId,
    ]);

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
        const selectedCategoriesObject = selectedCategories.map((key) => policyCategories?.[key]);

        if (isSmallScreenWidth ? canSelectMultiple : selectedCategories.length > 0) {
            if (!isThereAnyAccountingConnection) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedCategories.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: () => {
                        if (isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, selectedCategoriesObject)) {
                            setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                            return;
                        }

                        setDeleteCategoriesConfirmModalVisible(true);
                    },
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
                        if (isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, selectedCategoriesObject)) {
                            setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                            return;
                        }
                        setSelectedCategories([]);
                        setWorkspaceCategoryEnabled(
                            policyData,
                            categoriesToDisable,
                            isSetupCategoryTaskParentReportArchived,
                            setupCategoryTaskReport,
                            setupCategoryTaskParentReport,
                            currentUserPersonalDetails.accountID,
                            hasOutstandingChildTask,
                            parentReportAction,
                        );
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
                        setWorkspaceCategoryEnabled(
                            policyData,
                            categoriesToEnable,
                            isSetupCategoryTaskParentReportArchived,
                            setupCategoryTaskReport,
                            setupCategoryTaskParentReport,
                            currentUserPersonalDetails.accountID,
                            hasOutstandingChildTask,
                            parentReportAction,
                        );
                    },
                });
            }

            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedCategories.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    isDisabled={!selectedCategories.length}
                    testID="WorkspaceCategoriesPage-header-dropdown-menu-button"
                />
            );
        }
        const shouldShowAddCategory = !policyHasAccountingConnections && hasVisibleCategories;
        return (
            <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                {shouldShowAddCategory && (
                    <Button
                        success
                        onPress={navigateToCreateCategoryPage}
                        icon={Expensicons.Plus}
                        text={translate('workspace.categories.addCategory')}
                        style={[shouldUseNarrowLayout && styles.flex1]}
                    />
                )}
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    options={secondaryActions}
                    isSplitButton={false}
                    wrapperStyle={shouldShowAddCategory ? styles.flexGrow0 : styles.flexGrow1}
                />
            </View>
        );
    };

    const isLoading = !isOffline && policyCategories === undefined;

    useEffect(() => {
        if (isMobileSelectionModeEnabled) {
            return;
        }

        setSelectedCategories([]);
    }, [setSelectedCategories, isMobileSelectionModeEnabled]);

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const headerContent = (
        <>
            <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                {!hasSyncError && isConnectionVerified && currentConnectionName ? (
                    <ImportedFromAccountingSoftware
                        policyID={policyId}
                        currentConnectionName={currentConnectionName}
                        connectedIntegration={connectedIntegration}
                        translatedText={translate('workspace.categories.importedFromAccountingSoftware')}
                    />
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
        </>
    );
    const subtitleText = useMemo(() => {
        if (!policyHasAccountingConnections) {
            return <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>{translate('workspace.categories.emptyCategories.subtitle')}</Text>;
        }
        return (
            <View style={[styles.renderHTML]}>
                <RenderHTML html={translate('workspace.categories.emptyCategories.subtitleWithAccounting', `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyId)}`)} />
            </View>
        );
    }, [policyHasAccountingConnections, styles.renderHTML, styles.textAlignCenter, styles.textSupporting, styles.textNormal, translate, environmentURL, policyId]);
    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyId}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspaceCategoriesPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.categories')}
                    icon={!selectionModeHeader ? illustrations.FolderOpen : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedCategories([]);
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
                {(!hasVisibleCategories || isLoading) && headerContent}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}
                {hasVisibleCategories && !isLoading && (
                    <SelectionListWithModal
                        data={filteredCategoryList}
                        ListItem={TableListItem}
                        onCheckboxPress={toggleCategory}
                        selectedItems={selectedCategories}
                        onSelectRow={navigateToCategorySettings}
                        onTurnOnSelectionMode={(item) => item && toggleCategory(item)}
                        onSelectAll={filteredCategoryList.length > 0 ? toggleAllCategories : undefined}
                        style={{listHeaderWrapperStyle: [styles.ph9, styles.pv3, styles.pb5]}}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        turnOnSelectionModeOnLongPress={isSmallScreenWidth}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        customListHeader={getCustomListHeader()}
                        customListHeaderContent={headerContent}
                        canSelectMultiple={canSelectMultiple}
                        showListEmptyContent={false}
                        onDismissError={dismissError}
                        showScrollIndicator={false}
                        shouldHeaderBeInsideList
                        shouldShowRightCaret
                    />
                )}
                {!hasVisibleCategories && !isLoading && inputValue.length === 0 && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        <EmptyStateComponent
                            SkeletonComponent={TableListItemSkeleton}
                            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                            headerMedia={LottieAnimations.GenericEmptyState}
                            title={translate('workspace.categories.emptyCategories.title')}
                            subtitleText={subtitleText}
                            headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]}
                            lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                            headerContentStyles={styles.emptyStateFolderWebStyles}
                            buttons={
                                !policyHasAccountingConnections
                                    ? [
                                          {
                                              icon: Expensicons.Plus,
                                              buttonText: translate('workspace.categories.addCategory'),
                                              buttonAction: navigateToCreateCategoryPage,
                                              success: true,
                                          },
                                          {
                                              icon: icons.Table,
                                              buttonText: translate('common.import'),
                                              buttonAction: navigateToImportSpreadsheet,
                                          },
                                      ]
                                    : undefined
                            }
                        />
                    </ScrollView>
                )}
                <ConfirmModal
                    isVisible={isCannotDeleteOrDisableLastCategoryModalVisible}
                    onConfirm={() => setIsCannotDeleteOrDisableLastCategoryModalVisible(false)}
                    onCancel={() => setIsCannotDeleteOrDisableLastCategoryModalVisible(false)}
                    title={translate('workspace.categories.cannotDeleteOrDisableAllCategories.title')}
                    prompt={translate('workspace.categories.cannotDeleteOrDisableAllCategories.description')}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
                />
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

export default WorkspaceCategoriesPage;
