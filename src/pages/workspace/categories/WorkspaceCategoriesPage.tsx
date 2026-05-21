import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import type {ListItem} from '@components/SelectionList/types';
import WorkspaceCategoriesTable, {WorkspaceCategoryTableRowData} from '@components/Tables/WorkspaceCategoriesTable';
import Text from '@components/Text';
import useAutoTurnSelectionModeOffWhenHasNoActiveOption from '@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useGenericEmptyStateIllustration from '@hooks/useGenericEmptyStateIllustration';
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
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {getCategoryApproverRule, getDecodedCategoryName} from '@libs/CategoryUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isDisablingOrDeletingLastEnabledCategory} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections, hasTags, isControlPolicy, shouldShowSyncError} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {close} from '@userActions/Modal';
import {clearCategoryErrors, deleteWorkspaceCategories, downloadCategoriesCSV, openPolicyCategoriesPage, setWorkspaceCategoryEnabled} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
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
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const {environmentURL} = useEnvironment();
    const {backTo, policyID: policyId} = route.params;
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const policyData = usePolicyData(policyId);
    const {policy, categories: policyCategories} = policyData;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.categories');
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const syncingAccountingIntegration = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.find((connectionName) => connectionName === connectionSyncProgress?.connectionName);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);
    const connectedIntegration = getConnectedIntegration(policy) ?? syncingAccountingIntegration;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>([]);
    const canSelectMultiple = isSmallScreenWidth ? isMobileSelectionModeEnabled : true;
    const isControlPolicyWithWideLayout = !shouldUseNarrowLayout && isControlPolicy(policy);
    const shouldShowApproverColumn = isControlPolicyWithWideLayout && !!policy?.areRulesEnabled;
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Close', 'Download', 'Gear', 'Plus', 'Table', 'Trashcan']);
    const illustrations = useMemoizedLazyIllustrations(['FolderOpen']);
    const genericIllustration = useGenericEmptyStateIllustration();

    const {
        taskReport: setupCategoryTaskReport,
        taskParentReport: setupCategoryTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES);

    const {
        taskReport: setupCategoriesAndTagsTaskReport,
        taskParentReport: setupCategoriesAndTagsTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoriesAndTagsTaskParentReportArchived,
        hasOutstandingChildTask: setupCategoriesAndTagsHasOutstandingChildTask,
        parentReportAction: setupCategoriesAndTagsParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES_AND_TAGS);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyId}`);

    const policyHasTags = hasTags(policyTags);

    const fetchCategories = useCallback(() => {
        openPolicyCategoriesPage(policyId);
    }, [policyId]);

    const {isOffline} = useNetwork({onReconnect: fetchCategories});

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cleanupSelectedOption = useCallback(() => setSelectedCategoryNames([]), []);
    useCleanupSelectedOptions(cleanupSelectedOption);

    useEffect(() => {
        if (selectedCategoryNames.length === 0 || !canSelectMultiple) {
            return;
        }

        setSelectedCategoryNames((prevSelectedCategories) => {
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
        onClearSelection: () => setSelectedCategoryNames([]),
        onNavigationCallBack: () => Navigation.goBack(backTo),
    });

    // eslint-disable-next-line rulesdir/no-negated-variables
    const showCannotDeleteOrDisableLastCategoryModal = useCallback(() => {
        showConfirmModal({
            title: translate('workspace.categories.cannotDeleteOrDisableAllCategories.title'),
            prompt: translate('workspace.categories.cannotDeleteOrDisableAllCategories.description'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const updateWorkspaceCategoryEnabled = useCallback(
        (value: boolean, categoryName: string) => {
            setWorkspaceCategoryEnabled({
                policyData,
                categoriesToUpdate: {[categoryName]: {name: categoryName, enabled: value}},
                isSetupCategoriesTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
                setupCategoryTaskReport,
                setupCategoryTaskParentReport,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
                setupCategoriesAndTagsTaskReport,
                setupCategoriesAndTagsTaskParentReport,
                isSetupCategoriesAndTagsTaskParentReportArchived,
                setupCategoriesAndTagsHasOutstandingChildTask,
                setupCategoriesAndTagsParentReportAction,
                policyHasTags,
            });
        },
        [
            policyData,
            isSetupCategoryTaskParentReportArchived,
            setupCategoryTaskReport,
            setupCategoryTaskParentReport,
            currentUserPersonalDetails.accountID,
            hasOutstandingChildTask,
            parentReportAction,
            setupCategoriesAndTagsTaskReport,
            setupCategoriesAndTagsTaskParentReport,
            isSetupCategoriesAndTagsTaskParentReportArchived,
            setupCategoriesAndTagsHasOutstandingChildTask,
            setupCategoriesAndTagsParentReportAction,
            policyHasTags,
        ],
    );

    const glCodeContainerStyle = useMemo(() => [styles.flex1], [styles.flex1]);
    const glCodeTextStyle = useMemo(() => [styles.alignSelfStart], [styles.alignSelfStart]);
    const switchContainerStyle = useMemo(() => [StyleUtils.getMinimumWidth(variables.w72)], [StyleUtils]);

    const categoryRows = useMemo<WorkspaceCategoryTableRowData[]>(() => {
        const categories = Object.values(policyCategories ?? {});

        return categories.reduce<WorkspaceCategoryTableRowData[]>((acc, value, index) => {
            const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (!isOffline && isDisabled) {
                return acc;
            }

            const approverEmail = shouldShowApproverColumn ? (getCategoryApproverRule(policy?.rules?.approvalRules ?? [], value.name)?.approver ?? '') : '';
            const approverPersonalDetail = getPersonalDetailByEmail(approverEmail);
            const {avatar: approverAvatar, displayName = approverEmail, accountID: approverAccountID} = approverPersonalDetail ?? {};
            const approverDisplayName = displayName ? formatPhoneNumber(displayName) : '';

            acc.push({
                keyForList: `${value.name}-${index}`,
                name: getDecodedCategoryName(value.name),
                glCode: value['GL Code'],
                isDisabled,
                approverAvatar,
                approverAccountID,
                approverDisplayName,
                enabled: value.enabled,
                errors: value.errors ?? undefined,
                pendingAction: value.pendingAction,
                action: () => {
                    const path = isQuickSettingsFlow
                        ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(policyId, value.name, backTo)
                        : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(value.name));

                    Navigation.navigate(path);
                },
                onToggleEnabled: (enabled: boolean) => {
                    if (isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, [value])) {
                        showCannotDeleteOrDisableLastCategoryModal();
                        return;
                    }

                    updateWorkspaceCategoryEnabled(enabled, value.name);
                },
            });

            return acc;
        }, []);
    }, [
        showCannotDeleteOrDisableLastCategoryModal,
        policyCategories,
        isOffline,
        translate,
        updateWorkspaceCategoryEnabled,
        policy,
        isControlPolicyWithWideLayout,
        glCodeContainerStyle,
        glCodeTextStyle,
        switchContainerStyle,
        shouldShowApproverColumn,
        styles.alignItemsCenter,
        styles.flexRow,
        styles.mr3,
    ]);

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

    const [inputValue, setInputValue, filteredCategoryList] = useSearchResults(categoryRows, filterCategory, sortCategories);

    useAutoTurnSelectionModeOffWhenHasNoActiveOption(categoryRows);

    const handleCategorySelectionChange = (categories: WorkspaceCategoryTableRowData[]) => {
        setSelectedCategoryNames(categories.map((category) => category.name));
    };

    const navigateToCategoriesSettings = useCallback(() => {
        Navigation.navigate(createDynamicRoute(isQuickSettingsFlow ? DYNAMIC_ROUTES.SETTINGS_CATEGORIES_SETTINGS.path : DYNAMIC_ROUTES.WORKSPACE_CATEGORIES_SETTINGS.path));
    }, [isQuickSettingsFlow]);

    const navigateToCreateCategoryPage = () => {
        Navigation.navigate(createDynamicRoute(isQuickSettingsFlow ? DYNAMIC_ROUTES.SETTINGS_CATEGORY_CREATE.path : DYNAMIC_ROUTES.WORKSPACE_CATEGORY_CREATE.path));
    };

    const dismissError = (item: ListItem) => {
        clearCategoryErrors(policyId, item.keyForList, policyCategories);
    };

    const handleDeleteCategories = () => {
        if (selectedCategoryNames.length > 0) {
            deleteWorkspaceCategories(
                policyData,
                selectedCategoryNames,
                isSetupCategoryTaskParentReportArchived,
                setupCategoryTaskReport,
                setupCategoryTaskParentReport,
                currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
            );
        }

        setSelectedCategoryNames([]);
    };
    const hasVisibleCategories = categoryRows.some((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const policyHasAccountingConnections = hasAccountingConnections(policy);

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

    const navigateToImportSpreadsheet = useCallback(() => {
        if (isOffline) {
            showOfflineModal();
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_CATEGORIES_IMPORT.getRoute(policyId, ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyId, backTo))
                : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORIES_IMPORT.path),
        );
    }, [backTo, isOffline, isQuickSettingsFlow, policyId, showOfflineModal]);

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
                        showOfflineModal();
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
        showOfflineModal,
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

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
        const selectedCategoriesObject = selectedCategoryNames.map((key) => policyCategories?.[key]);

        if (isSmallScreenWidth ? canSelectMultiple : selectedCategoryNames.length > 0) {
            if (!isThereAnyAccountingConnection) {
                options.push({
                    icon: icons.Trashcan,
                    text: translate(selectedCategoryNames.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: async () => {
                        if (isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, selectedCategoriesObject)) {
                            showCannotDeleteOrDisableLastCategoryModal();
                            return;
                        }

                        const {action} = await showConfirmModal({
                            title: translate(selectedCategoryNames.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories'),
                            prompt: translate(selectedCategoryNames.length === 1 ? 'workspace.categories.deleteCategoryPrompt' : 'workspace.categories.deleteCategoriesPrompt'),
                            confirmText: translate('common.delete'),
                            cancelText: translate('common.cancel'),
                            danger: true,
                        });
                        if (action === ModalActions.CONFIRM) {
                            handleDeleteCategories();
                        }
                    },
                });
            }

            const enabledCategories = selectedCategoryNames.filter((categoryName) => policyCategories?.[categoryName]?.enabled);
            if (enabledCategories.length > 0) {
                const categoriesToDisable = selectedCategoryNames
                    .filter((categoryName) => policyCategories?.[categoryName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: false,
                        };
                        return acc;
                    }, {});
                options.push({
                    icon: icons.Close,
                    text: translate(enabledCategories.length === 1 ? 'workspace.categories.disableCategory' : 'workspace.categories.disableCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        if (isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, selectedCategoriesObject)) {
                            showCannotDeleteOrDisableLastCategoryModal();
                            return;
                        }
                        setSelectedCategoryNames([]);
                        setWorkspaceCategoryEnabled({
                            policyData,
                            categoriesToUpdate: categoriesToDisable,
                            isSetupCategoriesTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
                            setupCategoryTaskReport,
                            setupCategoryTaskParentReport,
                            currentUserAccountID: currentUserPersonalDetails.accountID,
                            hasOutstandingChildTask,
                            parentReportAction,
                            setupCategoriesAndTagsTaskReport,
                            setupCategoriesAndTagsTaskParentReport,
                            isSetupCategoriesAndTagsTaskParentReportArchived,
                            setupCategoriesAndTagsHasOutstandingChildTask,
                            setupCategoriesAndTagsParentReportAction,
                            policyHasTags,
                        });
                    },
                });
            }

            const disabledCategories = selectedCategoryNames.filter((categoryName) => !policyCategories?.[categoryName]?.enabled);
            if (disabledCategories.length > 0) {
                const categoriesToEnable = selectedCategoryNames
                    .filter((categoryName) => !policyCategories?.[categoryName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: true,
                        };
                        return acc;
                    }, {});
                options.push({
                    icon: icons.Checkmark,
                    text: translate(disabledCategories.length === 1 ? 'workspace.categories.enableCategory' : 'workspace.categories.enableCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        setSelectedCategoryNames([]);
                        setWorkspaceCategoryEnabled({
                            policyData,
                            categoriesToUpdate: categoriesToEnable,
                            isSetupCategoriesTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
                            setupCategoryTaskReport,
                            setupCategoryTaskParentReport,
                            currentUserAccountID: currentUserPersonalDetails.accountID,
                            hasOutstandingChildTask,
                            parentReportAction,
                            setupCategoriesAndTagsTaskReport,
                            setupCategoriesAndTagsTaskParentReport,
                            isSetupCategoriesAndTagsTaskParentReportArchived,
                            setupCategoriesAndTagsHasOutstandingChildTask,
                            setupCategoriesAndTagsParentReportAction,
                            policyHasTags,
                        });
                    },
                });
            }

            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedCategoryNames.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                    isDisabled={!selectedCategoryNames.length}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.BULK_ACTIONS_DROPDOWN}
                    testID="WorkspaceCategoriesPage-header-dropdown-menu-button"
                />
            );
        }
        const shouldShowAddCategory = !policyHasAccountingConnections && hasVisibleCategories;
        return (
            <View style={[styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
                {shouldShowAddCategory && (
                    <Button
                        success
                        onPress={navigateToCreateCategoryPage}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.ADD_BUTTON}
                        icon={icons.Plus}
                        text={translate('workspace.categories.addCategory')}
                        style={[shouldDisplayButtonsInSeparateLine && styles.flex1]}
                    />
                )}
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.MORE_DROPDOWN}
                    options={secondaryActions}
                    isSplitButton={false}
                    wrapperStyle={shouldShowAddCategory || !shouldDisplayButtonsInSeparateLine ? styles.flexGrow0 : styles.flexGrow1}
                />
            </View>
        );
    };

    const isLoading = !isOffline && policyCategories === undefined;
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'WorkspaceCategoriesPage', isOffline, isPolicyCategoriesUndefined: policyCategories === undefined};

    useEffect(() => {
        if (isMobileSelectionModeEnabled) {
            return;
        }

        setSelectedCategoryNames([]);
    }, [setSelectedCategoryNames, isMobileSelectionModeEnabled]);

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
            {categoryRows.length > CONST.SEARCH_ITEM_LIMIT && (
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
            <View style={[styles.renderHTML, styles.textAlignCenter, styles.alignItemsCenter]}>
                <RenderHTML html={translate('workspace.categories.emptyCategories.subtitleWithAccounting', `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyId)}`)} />
            </View>
        );
    }, [policyHasAccountingConnections, styles.renderHTML, styles.textAlignCenter, styles.alignItemsCenter, styles.textSupporting, styles.textNormal, translate, environmentURL, policyId]);
    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyId}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
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
                    shouldDisplayHelpButton
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedCategoryNames([]);
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
                    {!shouldDisplayButtonsInSeparateLine && getHeaderButtons()}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                {(!hasVisibleCategories || isLoading) && headerContent}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        reasonAttributes={reasonAttributes}
                    />
                )}
                {hasVisibleCategories && !isLoading && (
                    <WorkspaceCategoriesTable
                        categories={categoryRows}
                        shouldShowApproverColumn={shouldShowApproverColumn}
                        onRowSelectionChange={handleCategorySelectionChange}
                    />
                )}
                {!hasVisibleCategories && !isLoading && inputValue.length === 0 && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        <GenericEmptyStateComponent
                            {...genericIllustration}
                            title={translate('workspace.categories.emptyCategories.title')}
                            subtitleText={subtitleText}
                            headerStyles={styles.emptyStateCardIllustrationContainer}
                            buttons={
                                !policyHasAccountingConnections
                                    ? [
                                          {
                                              icon: icons.Table,
                                              buttonText: translate('common.import'),
                                              buttonAction: navigateToImportSpreadsheet,
                                          },
                                          {
                                              icon: icons.Plus,
                                              buttonText: translate('workspace.categories.addCategory'),
                                              buttonAction: navigateToCreateCategoryPage,
                                              success: true,
                                          },
                                      ]
                                    : undefined
                            }
                        />
                    </ScrollView>
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

export default WorkspaceCategoriesPage;
