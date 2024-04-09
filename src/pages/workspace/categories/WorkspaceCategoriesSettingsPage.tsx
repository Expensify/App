import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceRequiresCategory} from '@libs/actions/Policy';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceCategoriesSettingsPageOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type WorkspaceCategoriesSettingsPageProps = WorkspaceCategoriesSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_SETTINGS>;

function WorkspaceCategoriesSettingsPage({route, policyCategories}: WorkspaceCategoriesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceRequiresCategory(route.params.policyID, value);
    };

    const hasEnabledOptions = OptionsListUtils.hasEnabledOptions(policyCategories ?? {});
    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={route.params.policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
                >
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
                                            <Text style={[styles.textNormal, styles.colorMuted, styles.flexShrink1, styles.mr2]}>{translate('workspace.categories.requiresCategory')}</Text>
                                            <Switch
                                                isOn={policy?.requiresCategory ?? false}
                                                accessibilityLabel={translate('workspace.categories.requiresCategory')}
                                                onToggle={updateWorkspaceRequiresCategory}
                                                disabled={!policy?.areCategoriesEnabled || !hasEnabledOptions}
                                            />
                                        </View>
                                    </View>
                                </OfflineWithFeedback>
                            </View>
                        </ScreenWrapper>
                    )}
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesSettingsPage.displayName = 'WorkspaceCategoriesSettingsPage';

export default withOnyx<WorkspaceCategoriesSettingsPageProps, WorkspaceCategoriesSettingsPageOnyxProps>({
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
    },
})(WorkspaceCategoriesSettingsPage);
