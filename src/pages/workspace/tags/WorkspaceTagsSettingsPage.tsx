import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Tag from '@libs/actions/Policy/Tag';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceTagsSettingsPageOnyxProps = {
    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;
};
type WorkspaceTagsSettingsPageProps = WorkspaceTagsSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_SETTINGS>;

function WorkspaceTagsSettingsPage({route, policyTags}: WorkspaceTagsSettingsPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policyTagLists, isMultiLevelTags] = useMemo(() => [PolicyUtils.getTagLists(policyTags), PolicyUtils.isMultiLevelTags(policyTags)], [policyTags]);
    const hasEnabledOptions = OptionsListUtils.hasEnabledOptions(Object.values(policyTags ?? {}).flatMap(({tags}) => Object.values(tags)));
    const updateWorkspaceRequiresTag = useCallback(
        (value: boolean) => {
            Tag.setPolicyRequiresTag(policyID, value);
        },
        [policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
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
                                    <Text style={[styles.textNormal]}>{translate('workspace.tags.requiresTag')}</Text>
                                    <Switch
                                        isOn={policy?.requiresTag ?? false}
                                        accessibilityLabel={translate('workspace.tags.requiresTag')}
                                        onToggle={updateWorkspaceRequiresTag}
                                        disabled={!policy?.areTagsEnabled || !hasEnabledOptions}
                                    />
                                </View>
                            </View>
                        </OfflineWithFeedback>
                        {!isMultiLevelTags && (
                            <OfflineWithFeedback
                                errors={policyTags?.[policyTagLists[0].name]?.errors}
                                onClose={() => Tag.clearPolicyTagListErrors(policyID, policyTagLists[0].orderWeight)}
                                pendingAction={policyTags?.[policyTagLists[0].name]?.pendingAction}
                                errorRowStyles={styles.mh5}
                            >
                                <MenuItemWithTopDescription
                                    title={policyTagLists[0].name}
                                    description={translate(`workspace.tags.customTagName`)}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EDIT_TAGS.getRoute(policyID, policyTagLists[0].orderWeight))}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                        )}
                    </View>
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTagsSettingsPage.displayName = 'WorkspaceTagsSettingsPage';

export default withOnyx<WorkspaceTagsSettingsPageProps, WorkspaceTagsSettingsPageOnyxProps>({
    policyTags: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`,
    },
})(WorkspaceTagsSettingsPage);
