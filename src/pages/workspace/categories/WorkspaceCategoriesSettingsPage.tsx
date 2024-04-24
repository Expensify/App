import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceRequiresCategory} from '@libs/actions/Policy';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceCategoriesSettingsPageProps = WithPolicyConnectionsProps;

function WorkspaceCategoriesSettingsPage({policy, route}: WorkspaceCategoriesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const policyID = route.params.policyID ?? '';
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceRequiresCategory(policyID, value);
    };

    const hasEnabledOptions = OptionsListUtils.hasEnabledOptions(policyCategories ?? {});
    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
                >
                    <ScreenWrapper
                        includeSafeAreaPaddingBottom={false}
                        style={[styles.defaultModalContainer]}
                        testID={WorkspaceCategoriesSettingsPage.displayName}
                    >
                        <HeaderWithBackButton title={translate('common.settings')} />
                        <View style={styles.flexGrow1}>
                            <OfflineWithFeedback
                                errors={policy?.errorFields?.requiresCategory}
                                pendingAction={policy?.pendingFields?.requiresCategory}
                                errorRowStyles={styles.mh5}
                            >
                                <View style={[styles.mt2, styles.mh4]}>
                                    <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                        <Text style={[styles.textNormal, styles.colorMuted, styles.flexShrink1, styles.mr2]}>{translate('workspace.categories.requiresCategory')}</Text>
                                        <Switch
                                            isOn={policy?.requiresCategory ?? false}
                                            accessibilityLabel={translate('workspace.categories.requiresCategory')}
                                            onToggle={updateWorkspaceRequiresCategory}
                                            disabled={!policy?.areCategoriesEnabled || !hasEnabledOptions}
                                        />
                                    </View>
                                </View>
                                {isConnectedToAccounting && (
                                    <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.categories.importedFromAccountingSoftware')}${translate(
                                        'workspace.accounting.qbo',
                                    )}`}</Text>
                                )}
                            </OfflineWithFeedback>
                        </View>
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesSettingsPage.displayName = 'WorkspaceCategoriesSettingsPage';

export default withPolicyConnections(WorkspaceCategoriesSettingsPage);
