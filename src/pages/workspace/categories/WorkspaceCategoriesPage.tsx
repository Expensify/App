import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {deleteWorkspaceCategories, setWorkspaceCategoryEnabled} from '@libs/actions/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PolicyOption = ListItem;

type WorkspaceCategoriesOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type WorkspaceCategoriesPageProps = WorkspaceCategoriesOnyxProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceCategoriesPage({policyCategories, route}: WorkspaceCategoriesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    const dropdownButtonRef = useRef(null);

    const categoryList = useMemo(
        () =>
            Object.values(policyCategories ?? {}).map<PolicyOption>((value) => {
                const isDisabled = value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                return {
                    text: value.name,
                    keyForList: value.name,
                    isSelected: !!selectedCategories[value.name],
                    isDisabled,
                    pendingAction: value.pendingAction,
                    errors: value.errors ?? undefined,
                    rightElement: (
                        <View style={[styles.flexRow, isDisabled && styles.buttonOpacityDisabled]}>
                            <Text style={[styles.disabledText, styles.alignSelfCenter]}>
                                {value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')}
                            </Text>
                            <View style={[styles.p1, styles.pl2]}>
                                <Icon
                                    src={Expensicons.ArrowRight}
                                    fill={theme.icon}
                                />
                            </View>
                        </View>
                    ),
                };
            }),
        [policyCategories, selectedCategories, styles.alignSelfCenter, styles.buttonOpacityDisabled, styles.disabledText, styles.flexRow, styles.p1, styles.pl2, theme.icon, translate],
    );

    const toggleCategory = (category: PolicyOption) => {
        setSelectedCategories((prev) => ({
            ...prev,
            [category.keyForList]: !prev[category.keyForList],
        }));
    };

    const toggleAllCategories = () => {
        const isAllSelected = categoryList.every((category) => !!selectedCategories[category.keyForList]);
        setSelectedCategories(isAllSelected ? {} : Object.fromEntries(categoryList.map((item) => [item.keyForList, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const navigateToCategorySettings = (category: PolicyOption) => {
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, category.text));
    };

    const dismissError = (item: PolicyOption) => {
        Policy.clearCategoryErrors(route.params.policyID, item.keyForList);
    };

    const selectedCategoriesArray = Object.keys(selectedCategories).filter((key) => selectedCategories[key]);

    const renderButtons = useCallback(() => {
        if (selectedCategoriesArray.length > 0) {
            const isAllEnabled = selectedCategoriesArray.every((categoryName) => policyCategories?.[categoryName].enabled);

            const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES>>> = [
                {
                    icon: Expensicons.Trashcan,
                    text: translate('workspace.categories.deleteCategories'),
                    value: CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES.DELETE,
                    onSelected: () => {
                        setSelectedCategories({});
                        deleteWorkspaceCategories(route.params.policyID, selectedCategoriesArray);
                    },
                },
            ];

            if (isAllEnabled) {
                const categoriesToDisable = selectedCategoriesArray
                    .filter((categoryName) => policyCategories?.[categoryName].enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: false,
                        };
                        return acc;
                    }, {});

                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate('workspace.categories.disableCategories'),
                    value: CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        setSelectedCategories({});
                        setWorkspaceCategoryEnabled(route.params.policyID, categoriesToDisable);
                    },
                });
            } else {
                const categoriesToEnable = selectedCategoriesArray
                    .filter((categoryName) => !policyCategories?.[categoryName].enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, categoryName) => {
                        acc[categoryName] = {
                            name: categoryName,
                            enabled: true,
                        };
                        return acc;
                    }, {});
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate('workspace.categories.enableCategories'),
                    value: CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        setSelectedCategories({});
                        setWorkspaceCategoryEnabled(route.params.policyID, categoriesToEnable);
                    },
                });
            }

            return (
                <ButtonWithDropdownMenu<DeepValueOf<typeof CONST.POLICY.CATEGORIES_BULK_ACTION_TYPES>>
                    buttonRef={dropdownButtonRef}
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {selectedNumber: selectedCategoriesArray.length})}
                    options={options}
                />
            );
        }
        const navigateToCategoriesSettings = () => {
            Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES_SETTINGS.getRoute(route.params.policyID));
        };

        return (
            <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
                <Button
                    medium
                    onPress={navigateToCategoriesSettings}
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={[isSmallScreenWidth && styles.w50]}
                />
            </View>
        );
    }, [isSmallScreenWidth, policyCategories, route.params.policyID, selectedCategoriesArray, styles.flexRow, styles.mb3, styles.w100, styles.w50, translate]);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceCategoriesPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        icon={Illustrations.FolderOpen}
                        title={translate('workspace.common.categories')}
                        shouldShowBackButton={isSmallScreenWidth}
                    >
                        {!isSmallScreenWidth && renderButtons()}
                    </HeaderWithBackButton>
                    {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{renderButtons()}</View>}
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.categories.subtitle')}</Text>
                    </View>
                    {categoryList.length ? (
                        <SelectionList
                            canSelectMultiple
                            sections={[{data: categoryList, indexOffset: 0, isDisabled: false}]}
                            onCheckboxPress={toggleCategory}
                            onSelectRow={navigateToCategorySettings}
                            onSelectAll={toggleAllCategories}
                            showScrollIndicator
                            ListItem={TableListItem}
                            onDismissError={dismissError}
                            customListHeader={getCustomListHeader()}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        />
                    ) : (
                        <WorkspaceEmptyStateSection
                            title={translate('workspace.categories.emptyCategories.title')}
                            icon={Illustrations.EmptyStateExpenses}
                            subtitle={translate('workspace.categories.emptyCategories.subtitle')}
                        />
                    )}
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesPage.displayName = 'WorkspaceCategoriesPage';

export default withOnyx<WorkspaceCategoriesPageProps, WorkspaceCategoriesOnyxProps>({
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
    },
})(WorkspaceCategoriesPage);
