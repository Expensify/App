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
import {setWorkspaceRequiresCategory} from '@libs/actions/Policy';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';

type WorkspaceCategoriesSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_SETTINGS>;

function WorkspaceCategoriesSettingsPage({route}: WorkspaceCategoriesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceRequiresCategory(route.params.policyID, value);
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                {({policy}) => (
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
                                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.categories.requiresCategory')}</Text>
                                        <Switch
                                            isOn={policy?.requiresCategory ?? false}
                                            accessibilityLabel={translate('workspace.categories.requiresCategory')}
                                            onToggle={updateWorkspaceRequiresCategory}
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

WorkspaceCategoriesSettingsPage.displayName = 'WorkspaceCategoriesSettingsPage';

export default WorkspaceCategoriesSettingsPage;
