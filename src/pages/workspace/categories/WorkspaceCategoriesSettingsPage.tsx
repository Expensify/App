import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import SpendCategorySelectorListItem from '@components/SelectionList/ListItem/SpendCategorySelectorListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getCurrentConnectionName} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {setWorkspaceRequiresCategory} from '@userActions/Policy/Category';
import {clearPolicyErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type WorkspaceCategoriesSettingsPageProps = WithPolicyConnectionsProps &
    (
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_SETTINGS>
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS>
    );

function WorkspaceCategoriesSettingsPage({policy, route}: WorkspaceCategoriesSettingsPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyData = usePolicyData(policyID);
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const currentConnectionName = getCurrentConnectionName(policy);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS;
    const backTo = isQuickSettingsFlow && 'backTo' in route.params ? route.params.backTo : undefined;
    const toggleSubtitle = isConnectedToAccounting && currentConnectionName ? translate('workspace.categories.needCategoryForExportToIntegration', currentConnectionName) : undefined;

    const updateWorkspaceRequiresCategory = useCallback(
        (value: boolean) => {
            setWorkspaceRequiresCategory(policyData, value);
        },
        [policyData],
    );

    const data = useMemo(() => {
        if (!policyData.policy?.mccGroup) {
            return [];
        }

        return Object.entries(policyData.policy?.mccGroup).map(
            ([mccKey, mccGroup]): ListItem => ({
                categoryID: mccGroup.category,
                keyForList: mccKey,
                groupID: mccKey,
                tabIndex: -1,
                pendingAction: mccGroup?.pendingAction,
            }),
        );
    }, [policyData.policy]);

    const hasEnabledCategories = hasEnabledOptions(policyData.categories);
    const isToggleDisabled = !policy?.areCategoriesEnabled || !hasEnabledCategories || isConnectedToAccounting;

    const onSelectItem = (item: ListItem) => {
        if (!item.groupID) {
            return;
        }

        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SPEND_CATEGORY_SELECTOR.getRoute(item.groupID)));
    };

    const selectionListHeaderContent = (
        <View style={[styles.mh5, styles.mt2, styles.mb1]}>
            <Text
                style={[styles.headerText]}
                accessibilityRole={CONST.ROLE.HEADER}
            >
                {translate('workspace.categories.defaultSpendCategories')}
            </Text>
            <Text style={[styles.mt1, styles.lh20]}>{translate('workspace.categories.spendCategoriesDescription')}</Text>
        </View>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspaceCategoriesSettingsPage"
            >
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : undefined)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <ToggleSettingOptionRow
                        title={translate('workspace.categories.requiresCategory')}
                        subtitle={toggleSubtitle}
                        switchAccessibilityLabel={translate('workspace.categories.requiresCategory')}
                        isActive={policy?.requiresCategory ?? false}
                        onToggle={updateWorkspaceRequiresCategory}
                        pendingAction={policy?.pendingFields?.requiresCategory}
                        disabled={isToggleDisabled}
                        wrapperStyle={[styles.pv2, styles.mh5]}
                        errors={policy?.errorFields?.requiresCategory ?? undefined}
                        onCloseError={() => clearPolicyErrorField(policy?.id, 'requiresCategory')}
                        shouldPlaceSubtitleBelowSwitch
                    />
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv6]} />
                    <View style={[styles.containerWithSpaceBetween]}>
                        {!!policyData.policy && (data?.length ?? 0) > 0 && (
                            <SelectionList
                                addBottomSafeAreaPadding
                                customListHeaderContent={selectionListHeaderContent}
                                data={data}
                                ListItem={SpendCategorySelectorListItem}
                                onSelectRow={onSelectItem}
                            />
                        )}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyConnections(WorkspaceCategoriesSettingsPage);
