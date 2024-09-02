import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FlatList from '@components/FlatList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CategorySelector from '@pages/workspace/distanceRates/CategorySelector';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {setWorkspaceRequiresCategory} from '@userActions/Policy/Category';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceCategoriesSettingsPageProps = WithPolicyConnectionsProps;

function WorkspaceCategoriesSettingsPage({policy, route}: WorkspaceCategoriesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const policyID = route.params.policyID ?? '-1';
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [currentPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);

    const toggleSubtitle = isConnectedToAccounting && currentConnectionName ? `${translate('workspace.categories.needCategoryForExportToIntegration')} ${currentConnectionName}.` : undefined;

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceRequiresCategory(policyID, value);
    };

    const {data} = useMemo(() => {
        if (!(currentPolicy && currentPolicy.mccGroup)) {
            return {data: []};
        }

        return {
            data: Object.keys(currentPolicy.mccGroup).map((mccKey) => ({
                mcc: mccKey[0].toUpperCase() + mccKey.slice(1),
                category: currentPolicy.mccGroup?.[mccKey].category,
                keyForList: mccKey,
                groupID: mccKey,
            })),
        };
    }, [currentPolicy]);

    const hasEnabledOptions = OptionsListUtils.hasEnabledOptions(policyCategories ?? {});
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
                <HeaderWithBackButton title={translate('common.settings')} />
                <ScrollView style={styles.flexGrow1}>
                    <ToggleSettingOptionRow
                        title={translate('workspace.categories.requiresCategory')}
                        subtitle={toggleSubtitle}
                        switchAccessibilityLabel={translate('workspace.categories.requiresCategory')}
                        isActive={policy?.requiresCategory ?? false}
                        onToggle={updateWorkspaceRequiresCategory}
                        pendingAction={policy?.pendingFields?.requiresCategory}
                        disabled={!policy?.areCategoriesEnabled || !hasEnabledOptions || isConnectedToAccounting}
                        wrapperStyle={[styles.pv2, styles.mh4]}
                        errors={policy?.errorFields?.requiresCategory ?? undefined}
                        onCloseError={() => Policy.clearPolicyErrorField(policy?.id ?? '-1', 'requiresCategory')}
                        shouldPlaceSubtitleBelowSwitch
                    />
                    {!!currentPolicy && data?.length > 0 && (
                        <>
                            <View style={[styles.mh4, styles.mt2]}>
                                <Text style={[styles.headerText]}>Default spend categories</Text>
                                <Text style={[styles.mt1, styles.lh20]}>Customize how merchant spend is categorized for credit card transactions and scanned receipts.</Text>
                            </View>
                            <FlatList
                                data={data}
                                renderItem={({item}) => (
                                    <CategorySelector
                                        policyID={policyID}
                                        label={item.mcc}
                                        defaultValue={item.category}
                                        wrapperStyle={[styles.ph5, styles.mt2]}
                                        setNewCategory={(selectedCategory) => {
                                            if (!selectedCategory.text) {
                                                return;
                                            }
                                            Policy.setWorkspaceDefaultSpendCategory(policyID, item.groupID, selectedCategory.text);
                                        }}
                                    />
                                )}
                            />
                        </>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesSettingsPage.displayName = 'WorkspaceCategoriesSettingsPage';

export default withPolicyConnections(WorkspaceCategoriesSettingsPage);
