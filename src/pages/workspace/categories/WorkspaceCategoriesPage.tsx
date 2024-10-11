import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
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
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useAutoTurnSelectionModeOffWhenHasNoActiveOption from '@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Modal from '@userActions/Modal';
import {deleteWorkspaceCategories, setWorkspaceCategoryEnabled} from '@userActions/Policy/Category';
import * as Category from '@userActions/Policy/Category';
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

type WorkspaceCategoriesPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceCategoriesPage({route}: WorkspaceCategoriesPageProps) {
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const [deleteCategoriesConfirmModalVisible, setDeleteCategoriesConfirmModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const {environmentURL} = useEnvironment();
    const policyId = route.params.policyID ?? '-1';
    const backTo = route.params?.backTo;
    const policy = usePolicy(policyId);
    const {selectionMode} = useMobileSelectionMode();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyId}`);
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);

    const canSelectMultiple = shouldUseNarrowLayout ? selectionMode?.isEnabled : true;

    const fetchCategories = useCallback(() => {
        Category.openPolicyCategoriesPage(policyId);
    }, [policyId]);

    const {isOffline} = useNetwork({onReconnect: fetchCategories});

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [fetchCategories]),
    );

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedCategories({});
    }, [isFocused]);

    const categoryList = useMemo<PolicyOption[]>(
        () =>
            (lodashSortBy(Object.values(policyCategories ?? {}), 'name', localeCompare) as PolicyCategory[]).map((value) => {
                const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                return {
                    text: value.name,
                    keyForList: value.name,
                    isSelected: !!selectedCategories[value.name] && canSelectMultiple,
                    isDisabled,
                    pendingAction: value.pendingAction,
                    errors: value.errors ?? undefined,
                    rightElement: <ListItemRightCaretWithLabel labelText={value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')} />,
                };
            }),
        [policyCategories, selectedCategories, canSelectMultiple, translate],
    );

    useAutoTurnSelectionModeOffWhenHasNoActiveOption(categoryList);

    const toggleCategory = useCallback((category: PolicyOption) => {
        setSelectedCategories((prev) => {
            if (prev[category.keyForList]) {
                const {[category.keyForList]: omittedCategory, ...newCategories} = prev;
                return newCategories;
            }
            return {...prev, [category.keyForList]: true};
        });
    }, []);

    const toggleAllCategories = () => {
        const availableCategories = categoryList.filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const isAllSelected = availableCategories.length === Object.keys(selectedCategories).length;
        setSelectedCategories(isAllSelected ? {} : Object.fromEntries(availableCategories.map((item) => [item.keyForList, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9, !canSelectMultiple && styles.m5]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const navigateToCategorySettings = (category: PolicyOption) => {
        Navigation.navigate(
            backTo ? ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList, backTo) : ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList),
        );
    };

    const navigateToCategoriesSettings = () => {
        Navigation.navigate(backTo ? ROUTES.SETTINGS_CATEGORIES_SETTINGS.getRoute(policyId, backTo) : ROUTES.WORKSPACE_CATEGORIES_SETTINGS.getRoute(policyId));
    };

    const navigateToCreateCategoryPage = () => {
        Navigation.navigate(backTo ? ROUTES.SETTINGS_CATEGORY_CREATE.getRoute(policyId, backTo) : ROUTES.WORKSPACE_CATEGORY_CREATE.getRoute(policyId));
    };

    const dismissError = (item: PolicyOption) => {
        Category.clearCategoryErrors(policyId, item.keyForList);
    };

    const selectedCategoriesArray = Object.keys(selectedCategories).filter((key) => selectedCategories[key]);

    const handleDeleteCategories = () => {
        setSelectedCategories({});
        deleteWorkspaceCategories(policyId, selectedCategoriesArray);
        setDeleteCategoriesConfirmModalVisible(false);
    };

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;

        if (shouldUseNarrowLayout ? canSelectMultiple : selectedCategoriesArray.length > 0) {
            if (!isThereAnyAccountingConnection) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedCategoriesArray.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: () => setDeleteCategoriesConfirmModalVisible(true),
                });
            }

            const enabledCategories = selectedCategoriesArray.filter((categoryName) => policyCategories?.[categoryName]?.enabled);
            if (enabledCategories.length > 0) {
                const categoriesToDisable = selectedCategoriesArray
                    .filter((categoryName) => policyCategories?.[categoryName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: false,
                        };
                        return acc;
                    }, {});

                options.push({
                    icon: Expensicons.DocumentSlash,
                    text: translate(enabledCategories.length === 1 ? 'workspace.categories.disableCategory' : 'workspace.categories.disableCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        setSelectedCategories({});
                        setWorkspaceCategoryEnabled(policyId, categoriesToDisable);
                    },
                });
            }

            const disabledCategories = selectedCategoriesArray.filter((categoryName) => !policyCategories?.[categoryName]?.enabled);
            if (disabledCategories.length > 0) {
                const categoriesToEnable = selectedCategoriesArray
                    .filter((categoryName) => !policyCategories?.[categoryName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: true,
                        };
                        return acc;
                    }, {});
                options.push({
                    icon: Expensicons.Document,
                    text: translate(disabledCategories.length === 1 ? 'workspace.categories.enableCategory' : 'workspace.categories.enableCategories'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        setSelectedCategories({});
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
                    customText={translate('workspace.common.selected', {count: selectedCategoriesArray.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    isDisabled={!selectedCategoriesArray.length}
                />
            );
        }

        return (
            <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                {!PolicyUtils.hasAccountingConnections(policy) && (
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

        setSelectedCategories({});
    }, [setSelectedCategories, selectionMode?.isEnabled]);

    const hasVisibleCategories = categoryList.some((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {isConnectedToAccounting ? (
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
    );

    const threeDotsMenuItems = useMemo(() => {
        const menuItems = [];
        if (!PolicyUtils.hasAccountingConnections(policy)) {
            menuItems.push({
                icon: Expensicons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: () => {
                    if (isOffline) {
                        Modal.close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    Navigation.navigate(backTo ? ROUTES.SETTINGS_CATEGORIES_IMPORT.getRoute(policyId, backTo) : ROUTES.WORKSPACE_CATEGORIES_IMPORT.getRoute(policyId));
                },
            });
        }
        if (hasVisibleCategories) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        Modal.close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    Modal.close(() => {
                        Category.downloadCategoriesCSV(policyId, () => {
                            setIsDownloadFailureModalVisible(true);
                        });
                    });
                },
            });
        }

        return menuItems;
    }, [policyId, translate, isOffline, hasVisibleCategories, policy]);

    const selectionModeHeader = selectionMode?.isEnabled && shouldUseNarrowLayout;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyId}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceCategoriesPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.categories')}
                    icon={!selectionModeHeader ? Illustrations.FolderOpen : undefined}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedCategories({});
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
                    isVisible={deleteCategoriesConfirmModalVisible}
                    onConfirm={handleDeleteCategories}
                    onCancel={() => setDeleteCategoriesConfirmModalVisible(false)}
                    title={translate(selectedCategoriesArray.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories')}
                    prompt={translate(selectedCategoriesArray.length === 1 ? 'workspace.categories.deleteCategoryPrompt' : 'workspace.categories.deleteCategoriesPrompt')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                {(!shouldUseNarrowLayout || !hasVisibleCategories || isLoading) && getHeaderText()}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}

                {!hasVisibleCategories && !isLoading && (
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
                )}
                {hasVisibleCategories && !isLoading && (
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress
                        onTurnOnSelectionMode={(item) => item && toggleCategory(item)}
                        sections={[{data: categoryList, isDisabled: false}]}
                        onCheckboxPress={toggleCategory}
                        onSelectRow={navigateToCategorySettings}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        onSelectAll={toggleAllCategories}
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
