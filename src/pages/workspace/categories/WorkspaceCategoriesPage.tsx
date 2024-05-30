import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {deleteWorkspaceCategories, setWorkspaceCategoryEnabled} from '@userActions/Policy/Category';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PolicyOption = ListItem & {
    /** Category name is used as a key for the selectedCategories state */
    keyForList: string;
};

type WorkspaceCategoriesPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceCategoriesPage({route}: WorkspaceCategoriesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    const [deleteCategoriesConfirmModalVisible, setDeleteCategoriesConfirmModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const {environmentURL} = useEnvironment();
    const policyId = route.params.policyID ?? '';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyId}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyId}`);

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
            Object.values(policyCategories ?? {})
                .sort((a, b) => localeCompare(a.name, b.name))
                .map((value) => {
                    const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                    return {
                        text: value.name,
                        keyForList: value.name,
                        isSelected: !!selectedCategories[value.name],
                        isDisabled,
                        pendingAction: value.pendingAction,
                        errors: value.errors ?? undefined,
                        rightElement: <ListItemRightCaretWithLabel labelText={value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')} />,
                    };
                }),
        [policyCategories, selectedCategories, translate],
    );

    const toggleCategory = (category: PolicyOption) => {
        setSelectedCategories((prev) => {
            if (prev[category.keyForList]) {
                const {[category.keyForList]: omittedCategory, ...newCategories} = prev;
                return newCategories;
            }
            return {...prev, [category.keyForList]: true};
        });
    };

    const toggleAllCategories = () => {
        const availableCategories = categoryList.filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const isAllSelected = availableCategories.length === Object.keys(selectedCategories).length;
        setSelectedCategories(isAllSelected ? {} : Object.fromEntries(availableCategories.map((item) => [item.keyForList, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const navigateToCategorySettings = (category: PolicyOption) => {
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyId, category.keyForList));
    };

    const navigateToCategoriesSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES_SETTINGS.getRoute(policyId));
    };

    const navigateToCreateCategoryPage = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_CREATE.getRoute(policyId));
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
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES>>> = [];
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;

        if (selectedCategoriesArray.length > 0) {
            if (!isThereAnyAccountingConnection) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedCategoriesArray.length === 1 ? 'workspace.categories.deleteCategory' : 'workspace.categories.deleteCategories'),
                    value: CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES.DELETE,
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
                    value: CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES.DISABLE,
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
                    value: CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES.ENABLE,
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
                    customText={translate('workspace.common.selected', {selectedNumber: selectedCategoriesArray.length})}
                    options={options}
                    isSplitButton={false}
                    style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                />
            );
        }

        return (
            <View style={[styles.w100, styles.flexRow, styles.gap2, isSmallScreenWidth && styles.mb3]}>
                {!PolicyUtils.hasAccountingConnections(policy) && (
                    <Button
                        medium
                        success
                        onPress={navigateToCreateCategoryPage}
                        icon={Expensicons.Plus}
                        text={translate('workspace.categories.addCategory')}
                        style={[isSmallScreenWidth && styles.flex1]}
                    />
                )}
                <Button
                    medium
                    onPress={navigateToCategoriesSettings}
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={[isSmallScreenWidth && styles.flex1]}
                />
            </View>
        );
    };

    const isLoading = !isOffline && policyCategories === undefined;

    const shouldShowEmptyState = !categoryList.some((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) && !isLoading;

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3]}>
            {Object.keys(policy?.connections ?? {}).length > 0 ? (
                <Text>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.categories.importedFromAccountingSoftware')} `}</Text>
                    <TextLink
                        style={[styles.textNormal, styles.link]}
                        href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyId)}`}
                    >
                        {`${translate('workspace.accounting.qbo')} ${translate('workspace.accounting.settings')}`}
                    </TextLink>
                </Text>
            ) : (
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.categories.subtitle')}</Text>
            )}
        </View>
    );

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
                    icon={Illustrations.FolderOpen}
                    title={translate('workspace.common.categories')}
                    shouldShowBackButton={isSmallScreenWidth}
                >
                    {!isSmallScreenWidth && getHeaderButtons()}
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
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                {!isSmallScreenWidth && getHeaderText()}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}
                {shouldShowEmptyState && (
                    <WorkspaceEmptyStateSection
                        title={translate('workspace.categories.emptyCategories.title')}
                        icon={Illustrations.EmptyStateExpenses}
                        subtitle={translate('workspace.categories.emptyCategories.subtitle')}
                    />
                )}
                {!shouldShowEmptyState && !isLoading && (
                    <SelectionList
                        canSelectMultiple
                        sections={[{data: categoryList, isDisabled: false}]}
                        onCheckboxPress={toggleCategory}
                        onSelectRow={navigateToCategorySettings}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        onSelectAll={toggleAllCategories}
                        ListItem={TableListItem}
                        onDismissError={dismissError}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        listHeaderContent={isSmallScreenWidth ? getHeaderText() : null}
                        showScrollIndicator={false}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesPage.displayName = 'WorkspaceCategoriesPage';

export default WorkspaceCategoriesPage;
