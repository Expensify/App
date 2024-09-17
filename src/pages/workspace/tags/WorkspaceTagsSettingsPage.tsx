import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Tag from '@libs/actions/Policy/Tag';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceTagsSettingsPageOnyxProps = {
    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
};
type WorkspaceTagsSettingsPageProps = WorkspaceTagsSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_SETTINGS>;

/**
 * The pending state might be set by either setPolicyBillableMode or disableWorkspaceBillableExpenses.
 * setPolicyBillableMode changes disabledFields and defaultBillable and is called when disabledFields.defaultBillable is set.
 * Otherwise, disableWorkspaceBillableExpenses is used and it changes only disabledFields
 * */
function billableExpensesPending(policy: OnyxEntry<OnyxTypes.Policy>) {
    if (policy?.disabledFields?.defaultBillable) {
        return policy?.pendingFields?.disabledFields ?? policy?.pendingFields?.defaultBillable;
    }
    return policy?.pendingFields?.disabledFields;
}

function toggleBillableExpenses(policy: OnyxEntry<OnyxTypes.Policy>) {
    if (policy?.disabledFields?.defaultBillable) {
        Policy.setPolicyBillableMode(policy.id, false);
    } else if (policy) {
        Policy.disableWorkspaceBillableExpenses(policy.id);
    }
}

function WorkspaceTagsSettingsPage({route, policyTags}: WorkspaceTagsSettingsPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policyTagLists, isMultiLevelTags] = useMemo(() => [PolicyUtils.getTagLists(policyTags), PolicyUtils.isMultiLevelTags(policyTags)], [policyTags]);
    const isLoading = !PolicyUtils.getTagLists(policyTags)?.at(0) || Object.keys(policyTags ?? {}).at(0) === 'undefined';
    const {isOffline} = useNetwork();
    const hasEnabledOptions = OptionsListUtils.hasEnabledOptions(Object.values(policyTags ?? {}).flatMap(({tags}) => Object.values(tags)));
    const {canUseWorkspaceRules} = usePermissions();

    const updateWorkspaceRequiresTag = useCallback(
        (value: boolean) => {
            Tag.setPolicyRequiresTag(policyID, value);
        },
        [policyID],
    );

    const getTagsSettings = (policy: OnyxEntry<OnyxTypes.Policy>) => (
        <View style={styles.flexGrow1}>
            {!isMultiLevelTags && (
                <OfflineWithFeedback
                    errors={policyTags?.[policyTagLists.at(0)?.name ?? '']?.errors}
                    onClose={() => Tag.clearPolicyTagListErrors(policyID, policyTagLists.at(0)?.orderWeight ?? 0)}
                    pendingAction={policyTags?.[policyTagLists.at(0)?.name ?? '']?.pendingAction}
                    errorRowStyles={styles.mh5}
                >
                    <MenuItemWithTopDescription
                        title={policyTagLists.at(0)?.name}
                        description={translate(`workspace.tags.customTagName`)}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EDIT_TAGS.getRoute(policyID, policyTagLists.at(0)?.orderWeight ?? 0))}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
            )}
            <OfflineWithFeedback
                errors={policy?.errorFields?.requiresTag}
                pendingAction={policy?.pendingFields?.requiresTag}
                errorRowStyles={styles.mh5}
            >
                <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text style={[styles.textNormal]}>{translate('workspace.tags.requiresTag')}</Text>
                    <Switch
                        isOn={policy?.requiresTag ?? false}
                        accessibilityLabel={translate('workspace.tags.requiresTag')}
                        onToggle={updateWorkspaceRequiresTag}
                        disabled={!policy?.areTagsEnabled || !hasEnabledOptions}
                    />
                </View>
            </OfflineWithFeedback>
            {canUseWorkspaceRules && policy?.areRulesEnabled && (
                <OfflineWithFeedback pendingAction={billableExpensesPending(policy)}>
                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.textNormal]}>{translate('workspace.tags.trackBillable')}</Text>
                        <Switch
                            isOn={!(policy?.disabledFields?.defaultBillable ?? false)}
                            accessibilityLabel={translate('workspace.tags.trackBillable')}
                            onToggle={() => toggleBillableExpenses(policy)}
                        />
                    </View>
                </OfflineWithFeedback>
            )}
            <OfflineWithFeedback
                errors={policy?.errorFields?.requiresTag}
                pendingAction={policy?.pendingFields?.requiresTag}
                errorRowStyles={styles.mh5}
            >
                <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text style={[styles.textNormal]}>{translate('workspace.tags.requiresTag')}</Text>
                    <Switch
                        isOn={policy?.requiresTag ?? false}
                        accessibilityLabel={translate('workspace.tags.requiresTag')}
                        onToggle={updateWorkspaceRequiresTag}
                        disabled={!policy?.areTagsEnabled || !hasEnabledOptions}
                    />
                </View>
            </OfflineWithFeedback>
            {canUseWorkspaceRules && policy?.areRulesEnabled && (
                <OfflineWithFeedback pendingAction={billableExpensesPending(policy)}>
                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.textNormal]}>{translate('workspace.tags.trackBillable')}</Text>
                        <Switch
                            isOn={!(policy?.disabledFields?.defaultBillable ?? false)}
                            accessibilityLabel={translate('workspace.tags.trackBillable')}
                            onToggle={() => toggleBillableExpenses(policy)}
                        />
                    </View>
                </OfflineWithFeedback>
            )}
            <OfflineWithFeedback
                errors={policy?.errorFields?.requiresTag}
                pendingAction={policy?.pendingFields?.requiresTag}
                errorRowStyles={styles.mh5}
            >
                <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text style={[styles.textNormal]}>{translate('workspace.tags.requiresTag')}</Text>
                    <Switch
                        isOn={policy?.requiresTag ?? false}
                        accessibilityLabel={translate('workspace.tags.requiresTag')}
                        onToggle={updateWorkspaceRequiresTag}
                        disabled={!policy?.areTagsEnabled || !hasEnabledOptions}
                    />
                </View>
            </OfflineWithFeedback>
            {canUseWorkspaceRules && policy?.areRulesEnabled && (
                <OfflineWithFeedback pendingAction={billableExpensesPending(policy)}>
                    <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.textNormal]}>{translate('workspace.tags.trackBillable')}</Text>
                        <Switch
                            isOn={!(policy?.disabledFields?.defaultBillable ?? false)}
                            accessibilityLabel={translate('workspace.tags.trackBillable')}
                            onToggle={() => toggleBillableExpenses(policy)}
                        />
                    </View>
                </OfflineWithFeedback>
            )}
        </View>
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
                    {isOffline && isLoading ? <FullPageOfflineBlockingView>{getTagsSettings(policy)}</FullPageOfflineBlockingView> : getTagsSettings(policy)}
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
