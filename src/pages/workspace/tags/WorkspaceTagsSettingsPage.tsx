import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyRequiresTag} from '@libs/actions/Policy';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';

type WorkspaceTagsSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_SETTINGS>;

function WorkspaceTagsSettingsPage({route}: WorkspaceTagsSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const updateWorkspaceRequiresTag = (value: boolean) => {
        setPolicyRequiresTag(route.params.policyID, value);
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                {({policy}) => (
                    <ScreenWrapper
                        includeSafeAreaPaddingBottom={false}
                        style={[styles.defaultModalContainer]}
                        testID={WorkspaceTagsSettingsPage.displayName}
                    >
                        <HeaderWithBackButton title={translate('common.settings')} />
                        <View style={styles.flexGrow1}>
                            <OfflineWithFeedback
                                errors={policy?.errorFields?.requiresTag}
                                pendingAction={policy?.pendingFields?.requiresTag}
                                errorRowStyles={styles.mh5}
                            >
                                <View style={[styles.mt2, styles.mh4]}>
                                    <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.requiresTag')}</Text>
                                        <Switch
                                            isOn={policy?.requiresTag ?? false}
                                            accessibilityLabel={translate('workspace.tags.requiresTag')}
                                            onToggle={updateWorkspaceRequiresTag}
                                        />
                                    </View>
                                </View>
                            </OfflineWithFeedback>
                        </View>
                    </ScreenWrapper>
                )}
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTagsSettingsPage.displayName = 'WorkspaceTagsSettingsPage';

export default WorkspaceTagsSettingsPage;
