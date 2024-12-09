import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import CategorySelectorModal from '@components/CategorySelector/CategorySelectorModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {setWorkspaceRequiresCategory} from '@userActions/Policy/Category';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import SpendCategorySelectorListItem from './SpendCategorySelectorListItem';

type WorkspaceCategoriesSettingsPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_SETTINGS>;

function WorkspaceCategoriesSettingsPage({policy, route}: WorkspaceCategoriesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const policyID = route.params.policyID ?? '-1';
    const backTo = route.params.backTo;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [currentPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);
    const [isSelectorModalVisible, setIsSelectorModalVisible] = useState(false);
    const [categoryID, setCategoryID] = useState<string>();
    const [groupID, setGroupID] = useState<string>();
    const isQuickSettingsFlow = backTo;

    const toggleSubtitle = isConnectedToAccounting && currentConnectionName ? `${translate('workspace.categories.needCategoryForExportToIntegration')} ${currentConnectionName}.` : undefined;

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceRequiresCategory(policyID, value);
    };

    const {sections} = useMemo(() => {
        if (!(currentPolicy && currentPolicy.mccGroup)) {
            return {sections: [{data: []}]};
        }

        return {
            sections: [
                {
                    data: Object.entries(currentPolicy.mccGroup).map(
                        ([mccKey, mccGroup]) =>
                            ({
                                categoryID: mccGroup.category,
                                keyForList: mccKey,
                                groupID: mccKey,
                                tabIndex: -1,
                                pendingAction: mccGroup?.pendingAction,
                            } as ListItem),
                    ),
                },
            ],
        };
    }, [currentPolicy]);

    const hasEnabledOptions = OptionsListUtils.hasEnabledOptions(policyCategories ?? {});
    const isToggleDisabled = !policy?.areCategoriesEnabled || !hasEnabledOptions || isConnectedToAccounting;

    const setNewCategory = (selectedCategory: ListItem) => {
        if (!selectedCategory.keyForList || !groupID) {
            return;
        }
        if (categoryID !== selectedCategory.keyForList) {
            Policy.setWorkspaceDefaultSpendCategory(policyID, groupID, selectedCategory.keyForList);
        }
        setIsSelectorModalVisible(false);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceCategoriesSettingsPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : undefined)}
                />
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
                    onCloseError={() => Policy.clearPolicyErrorField(policy?.id ?? '-1', 'requiresCategory')}
                    shouldPlaceSubtitleBelowSwitch
                />
                <View style={[styles.sectionDividerLine]} />
                <View style={[styles.containerWithSpaceBetween]}>
                    {!!currentPolicy && (sections.at(0)?.data?.length ?? 0) > 0 && (
                        <SelectionList
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
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesSettingsPage.displayName = 'WorkspaceCategoriesSettingsPage';

export default withPolicyConnections(WorkspaceCategoriesSettingsPage);
