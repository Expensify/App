import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceRequiresCategory} from '@libs/actions/Policy';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceCategoriesSettingsPageProps = WithPolicyConnectionsProps;

function WorkspaceCategoriesSettingsPage({policy, route}: WorkspaceCategoriesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const policyID = route.params.policyID ?? '';
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const toggleSubtitle = isConnectedToAccounting ? `${translate('workspace.categories.needCategoryForExportToIntegration')} ${translate('workspace.accounting.qbo')}` : '';

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceRequiresCategory(policyID, value);
    };

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
                <View style={styles.flexGrow1}>
                    <ToggleSettingOptionRow
                        title={translate('workspace.categories.requiresCategory')}
                        titleStyle={styles.textStrong}
                        subtitle={toggleSubtitle}
                        switchAccessibilityLabel={toggleSubtitle}
                        isActive={policy?.requiresCategory ?? false}
                        onToggle={updateWorkspaceRequiresCategory}
                        pendingAction={policy?.pendingFields?.requiresCategory}
                        disabled={!policy?.areCategoriesEnabled || !hasEnabledOptions || isConnectedToAccounting}
                        wrapperStyle={[styles.mt2, styles.mh4]}
                        errors={policy?.errorFields?.requiresCategory ?? undefined}
                        onCloseError={() => Policy.clearPolicyErrorField(policy?.id ?? '', 'requiresCategory')}
                        shouldPlaceSubtitleBelowSwitch
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesSettingsPage.displayName = 'WorkspaceCategoriesSettingsPage';

export default withPolicyConnections(WorkspaceCategoriesSettingsPage);
