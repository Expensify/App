import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Tag from '@libs/actions/Policy/Tag';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Modal from '@userActions/Modal';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceTagsSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_SETTINGS>;

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

function WorkspaceTagsSettingsPage({route}: WorkspaceTagsSettingsPageProps) {
    const policyID = route.params.policyID ?? '-1';
    const backTo = route.params.backTo;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
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
    const isQuickSettingsFlow = !!backTo;
    const [showWarningSwitchTagLevelsModal, setShowWarningSwitchTagLevelsModal] = useState(false);
    const isUsingMultiLevelTags = policy?.isUsingMultiLevelTags ?? false;
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const hasDependentTags = useMemo(() => PolicyUtils.hasDependentTags(policy, policyTags), [policy, policyTags]);
    const confirmModalPrompt = (
        <Text>
            {translate('workspace.tags.switchTagLevelsDescription')}
            {translate('workspace.tags.switchTagLevelsPromptPt1')}
            {hasDependentTags && (
                <TextLink
                    onPress={() => {
                        if (isOffline) {
                            Modal.close(() => setIsOfflineModalVisible(true));
                            return;
                        }

                        Tag.downloadTagsCSV(policyID, () => {
                            setIsDownloadFailureModalVisible(true);
                        });
                    }}
                >
                    {translate('workspace.tags.exportTags')}
                </TextLink>
            )}

            {translate('workspace.tags.exportTags')}
            {translate('workspace.tags.switchTagLevelsPromptPt2')}
            {/* Update the link when article is available */}
            <TextLink href="/">{translate('workspace.tags.switchTagLevelsPromptLearnMore')}</TextLink>
            {translate('workspace.tags.switchTagLevelsPromptPt3')}
        </Text>
    );

    const getTagsSettings = () => (
        <View style={styles.flexGrow1}>
            {!isMultiLevelTags && (
                <OfflineWithFeedback
                    errors={policyTags?.[policyTagLists.at(0)?.name ?? '']?.errors}
                    onClose={() => Tag.clearPolicyTagListErrors(policyID, policyTagLists.at(0)?.orderWeight ?? 0)}
                    pendingAction={policyTags?.[policyTagLists.at(0)?.name ?? '']?.pendingAction}
                    errorRowStyles={styles.mh5}
                >
                    <MenuItemWithTopDescription
                        title={policyTagLists.at(0)?.name ?? ''}
                        description={translate(`workspace.tags.customTagName`)}
                        onPress={() => {
                            Navigation.navigate(
                                isQuickSettingsFlow
                                    ? ROUTES.SETTINGS_TAGS_EDIT.getRoute(policyID, policyTagLists.at(0)?.orderWeight ?? 0, backTo)
                                    : ROUTES.WORKSPACE_EDIT_TAGS.getRoute(policyID, policyTagLists.at(0)?.orderWeight ?? 0),
                            );
                        }}
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
            <OfflineWithFeedback
                errors={policy?.errorFields?.isUsingMultiLevelTags}
                pendingAction={policy?.pendingFields?.isUsingMultiLevelTags}
                errorRowStyles={styles.mh5}
            >
                <View style={[styles.flexRow, styles.mh5, styles.mv4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text style={[styles.textNormal]}>{translate('workspace.tags.useMultiLevelTag')}</Text>
                    <Switch
                        isOn={policy?.isUsingMultiLevelTags ?? false}
                        accessibilityLabel={translate('workspace.tags.useMultiLevelTag')}
                        onToggle={() => {
                            // Put a condition here to directly download in case no tag are present
                            setShowWarningSwitchTagLevelsModal(true);
                        }}
                        disabled={!policy?.areTagsEnabled || isConnectedToAccounting}
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
            {() => (
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceTagsSettingsPage.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('common.settings')}
                        onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined)}
                    />
                    {isOffline && isLoading ? <FullPageOfflineBlockingView>{getTagsSettings()}</FullPageOfflineBlockingView> : getTagsSettings()}
                    <ConfirmModal
                        title={translate('workspace.tags.switchTagLevels')}
                        prompt={confirmModalPrompt}
                        confirmText={translate('workspace.tags.switchTagLevels')}
                        cancelText={translate('common.cancel')}
                        isVisible={showWarningSwitchTagLevelsModal}
                        onConfirm={() => {
                            Tag.togglePolicyMultiLevelTags(policyID, !isUsingMultiLevelTags);
                            setShowWarningSwitchTagLevelsModal(false);
                        }}
                        onCancel={() => setShowWarningSwitchTagLevelsModal(false)}
                        danger
                    />
                    <ConfirmModal
                        isVisible={isOfflineModalVisible}
                        onConfirm={() => setIsOfflineModalVisible(false)}
                        title={translate('common.youAppearToBeOffline')}
                        prompt={translate('common.thisFeatureRequiresInternet')}
                        confirmText={translate('common.buttonConfirm')}
                        shouldShowCancelButton={false}
                    />
                    <DecisionModal
                        title={translate('common.downloadFailedTitle')}
                        prompt={translate('common.downloadFailedDescription')}
                        isSmallScreenWidth={shouldUseNarrowLayout}
                        onSecondOptionSubmit={() => setIsDownloadFailureModalVisible(false)}
                        secondOptionText={translate('common.buttonConfirm')}
                        isVisible={isDownloadFailureModalVisible}
                        onClose={() => setIsDownloadFailureModalVisible(false)}
                    />
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTagsSettingsPage.displayName = 'WorkspaceTagsSettingsPage';

export default WorkspaceTagsSettingsPage;
