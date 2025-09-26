import React, {useCallback, useMemo, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import CategorySelectorModal from '@components/CategorySelector/CategorySelectorModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
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
import {clearPolicyErrorField, setWorkspaceDefaultSpendCategory} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SpendCategorySelectorListItem from './SpendCategorySelectorListItem';

type WorkspaceCategoriesSettingsPageProps = WithPolicyConnectionsProps &
    (
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_SETTINGS>
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS>
    );

function WorkspaceCategoriesSettingsPage({policy, route}: WorkspaceCategoriesSettingsPageProps) {
    const {policyID, backTo} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyData = usePolicyData(policyID);
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const currentConnectionName = getCurrentConnectionName(policy);
    const [isSelectorModalVisible, setIsSelectorModalVisible] = useState(false);
    const [categoryID, setCategoryID] = useState<string>();
    const [groupID, setGroupID] = useState<string>();
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS;
    const toggleSubtitle =
        isConnectedToAccounting && currentConnectionName ? translate('workspace.categories.needCategoryForExportToIntegration', {connectionName: currentConnectionName}) : undefined;

    const updateWorkspaceRequiresCategory = useCallback(
        (value: boolean) => {
            if (policyData.policy === undefined) {
                return;
            }
            setWorkspaceRequiresCategory(policyData, value);
        },
        [policyData],
    );

    const {sections} = useMemo(() => {
        if (!(policy && policy.mccGroup)) {
            return {sections: [{data: []}]};
        }

        return {
            sections: [
                {
                    data: Object.entries(policy.mccGroup).map(
                        ([mccKey, mccGroup]) =>
                            ({
                                categoryID: mccGroup.category,
                                keyForList: mccKey,
                                groupID: mccKey,
                                tabIndex: -1,
                                pendingAction: mccGroup?.pendingAction,
                            }) as ListItem,
                    ),
                },
            ],
        };
    }, [policy]);

    const hasEnabledCategories = hasEnabledOptions(policyData.categories);
    const isToggleDisabled = !policy?.areCategoriesEnabled || !hasEnabledCategories || isConnectedToAccounting;

    const setNewCategory = (selectedCategory: ListItem) => {
        if (!selectedCategory.keyForList || !groupID) {
            return;
        }
        if (categoryID !== selectedCategory.keyForList) {
            setWorkspaceDefaultSpendCategory(policyID, groupID, selectedCategory.keyForList);
        }

        Keyboard.dismiss();
        InteractionManager.runAfterInteractions(() => {
            setIsSelectorModalVisible(false);
        });
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={WorkspaceCategoriesSettingsPage.displayName}
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
                        {!!policyData.policy && (sections.at(0)?.data?.length ?? 0) > 0 && (
                            <SelectionList
                                addBottomSafeAreaPadding
                                headerContent={
                                    <View style={[styles.mh5, styles.mt2, styles.mb1]}>
                                        <Text style={[styles.headerText]}>{translate('workspace.categories.defaultSpendCategories')}</Text>
                                        <Text style={[styles.mt1, styles.lh20]}>{translate('workspace.categories.spendCategoriesDescription')}</Text>
                                    </View>
                                }
                                sections={sections}
                                ListItem={SpendCategorySelectorListItem}
                                onSelectRow={(item) => {
                                    if (!item.groupID || !item.categoryID) {
                                        return;
                                    }
                                    setIsSelectorModalVisible(true);
                                    setCategoryID(item.categoryID);
                                    setGroupID(item.groupID);
                                }}
                            />
                        )}
                    </View>
                </ScrollView>
                {!!categoryID && !!groupID && (
                    <CategorySelectorModal
                        policyID={policyID}
                        isVisible={isSelectorModalVisible}
                        currentCategory={categoryID}
                        onClose={() => setIsSelectorModalVisible(false)}
                        onCategorySelected={setNewCategory}
                        label={groupID[0].toUpperCase() + groupID.slice(1)}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesSettingsPage.displayName = 'WorkspaceCategoriesSettingsPage';

export default withPolicyConnections(WorkspaceCategoriesSettingsPage);
