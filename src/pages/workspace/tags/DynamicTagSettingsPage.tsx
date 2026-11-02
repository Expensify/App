import React, {useEffect} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isDisablingOrDeletingLastEnabledTag} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {
    arePolicyRulesEnabled,
    getCleanedTagName,
    getTagApproverRule,
    getTagListByOrderWeight,
    getWorkflowApprovalsUnavailable,
    hasAccountingConnections as hasAccountingConnectionsPolicyUtils,
    hasDependentTags as hasDependentTagsPolicyUtils,
    isControlPolicy,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearPolicyTagErrors, deletePolicyTags, setWorkspaceTagEnabled} from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type DynamicTagSettingsPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_TAG_SETTINGS>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_SETTINGS>;

function DynamicTagSettingsPage({route, navigation}: DynamicTagSettingsPageProps) {
    const {policyID, tagName, parentTagsFilter} = route.params;
    const orderWeight = Number(route.params.orderWeight);
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policyData = usePolicyData(policyID);
    const {policy, tags: policyTags} = policyData;
    const {canWrite: canWriteTags, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.TAGS);
    const policyTag = getTagListByOrderWeight(policyTags, orderWeight);
    const {environmentURL} = useEnvironment();
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock', 'Trashcan']);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_SETTINGS;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_TAG_SETTINGS.path);
    const tagApprover = getTagApproverRule(policy, route.params?.tagName)?.approver ?? '';
    const approver = getPersonalDetailByEmail(tagApprover);
    const approverText = formatPhoneNumber(approver?.displayName ?? tagApprover);
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);
    const currentPolicyTag = hasDependentTags
        ? Object.values(policyTag.tags ?? {}).find((tag) => tag?.name === tagName && tag.rules?.parentTagsFilter === parentTagsFilter)
        : (policyTag.tags[tagName] ?? Object.values(policyTag.tags ?? {}).find((tag) => tag.previousTagName === tagName));

    const shouldPreventDisableOrDelete = isDisablingOrDeletingLastEnabledTag(policyTag, [currentPolicyTag]);

    useEffect(() => {
        if (currentPolicyTag?.name === tagName || !currentPolicyTag) {
            return;
        }
        navigation.setParams({tagName: currentPolicyTag?.name});
    }, [tagName, currentPolicyTag, navigation]);

    if (!currentPolicyTag) {
        return <NotFoundPage />;
    }

    const updateWorkspaceTagEnabled = (value: boolean) => {
        if (shouldPreventDisableOrDelete) {
            showConfirmModal({
                title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
                prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }
        setWorkspaceTagEnabled(policyData, {[currentPolicyTag.name]: {name: currentPolicyTag.name, enabled: value}}, policyTag.orderWeight);
    };

    const navigateToEditTag = () => {
        Navigation.navigate(
            isQuickSettingsFlow
                ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_EDIT.getRoute(orderWeight, currentPolicyTag.name))
                : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAG_EDIT.path),
        );
    };

    const navigateToEditGlCode = () => {
        if (!isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.glCodes.alias,
                    isQuickSettingsFlow
                        ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_GL_CODE.getRoute(orderWeight, tagName))
                        : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAG_GL_CODE.path),
                ),
            );
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_GL_CODE.getRoute(orderWeight, currentPolicyTag.name))
                : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAG_GL_CODE.path),
        );
    };

    const navigateToEditTagApprover = () => {
        Navigation.navigate(isQuickSettingsFlow ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_APPROVER.path) : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAG_APPROVER.path));
    };

    const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
    const isMultiLevelTags = isMultiLevelTagsPolicyUtils(policyTags);

    const shouldShowDeleteMenuItem = !isThereAnyAccountingConnection && !isMultiLevelTags;
    const workflowApprovalsUnavailable = getWorkflowApprovalsUnavailable(policy);
    const approverDisabled = !policy?.areWorkflowsEnabled || workflowApprovalsUnavailable;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.TAGS}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicTagSettingsPage"
            >
                <HeaderWithBackButton
                    title={getCleanedTagName(tagName)}
                    shouldSetModalVisibility={false}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? backPath : undefined)}
                />

                <ScrollView>
                    {!hasDependentTags && (
                        <OfflineWithFeedback
                            errors={getLatestErrorMessageField(currentPolicyTag)}
                            pendingAction={currentPolicyTag.pendingFields?.enabled}
                            errorRowStyles={styles.mh5}
                            onClose={() => clearPolicyTagErrors({policyID, tagName, tagListIndex: orderWeight, policyTags})}
                        >
                            <View style={[styles.mt2, styles.mh5]}>
                                <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                    <Text
                                        accessible={false}
                                        aria-hidden
                                    >
                                        {translate('workspace.tags.enableTag')}
                                    </Text>
                                    <Switch
                                        isOn={currentPolicyTag.enabled}
                                        accessibilityLabel={translate('workspace.tags.enableTag')}
                                        onToggle={updateWorkspaceTagEnabled}
                                        disabled={!canWriteTags}
                                        disabledAction={withReadOnlyFallback()}
                                        showLockIcon={!canWriteTags || shouldPreventDisableOrDelete}
                                    />
                                </View>
                            </View>
                        </OfflineWithFeedback>
                    )}
                    <OfflineWithFeedback pendingAction={currentPolicyTag.pendingFields?.name}>
                        <MenuItemWithTopDescription
                            title={getCleanedTagName(currentPolicyTag.name)}
                            description={translate(`common.name`)}
                            onPress={navigateToEditTag}
                            interactive={canWriteTags && !hasDependentTags}
                            shouldShowRightIcon={canWriteTags && !hasDependentTags}
                        />
                    </OfflineWithFeedback>
                    {(!hasDependentTags || !!currentPolicyTag?.['GL Code']) && (
                        <OfflineWithFeedback pendingAction={currentPolicyTag.pendingFields?.['GL Code']}>
                            <MenuItemWithTopDescription
                                description={translate(`workspace.tags.glCode`)}
                                title={currentPolicyTag?.['GL Code']}
                                onPress={navigateToEditGlCode}
                                iconRight={hasAccountingConnections ? expensifyIcons.Lock : undefined}
                                interactive={canWriteTags && !hasAccountingConnections && !hasDependentTags}
                                shouldShowRightIcon={canWriteTags && !hasDependentTags}
                            />
                        </OfflineWithFeedback>
                    )}

                    {arePolicyRulesEnabled(policy, policyData.categories) && !isMultiLevelTags && (
                        <>
                            <View style={[styles.mh5, styles.mv3, styles.pt3, styles.borderTop]}>
                                <Text style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.tags.tagRules')}</Text>
                            </View>
                            <MenuItemWithTopDescription
                                title={approverText}
                                description={translate(`workspace.tags.approverDescription`)}
                                onPress={navigateToEditTagApprover}
                                interactive={canWriteTags}
                                shouldShowRightIcon={canWriteTags}
                                disabled={approverDisabled}
                                helperText={
                                    approverDisabled
                                        ? translate('workspace.rules.categoryRules.enableWorkflows', `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)}`)
                                        : undefined
                                }
                                shouldParseHelperText
                            />
                        </>
                    )}

                    {canWriteTags && shouldShowDeleteMenuItem && (
                        <MenuItem
                            icon={expensifyIcons.Trashcan}
                            title={translate('common.delete')}
                            onPress={async () => {
                                if (shouldPreventDisableOrDelete) {
                                    showConfirmModal({
                                        title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
                                        prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
                                        confirmText: translate('common.buttonConfirm'),
                                        shouldShowCancelButton: false,
                                    });
                                    return;
                                }
                                const {action} = await showConfirmModal({
                                    title: translate('workspace.tags.deleteTag'),
                                    prompt: translate('workspace.tags.deleteTagConfirmation'),
                                    confirmText: translate('common.delete'),
                                    cancelText: translate('common.cancel'),
                                    danger: true,
                                });
                                if (action === ModalActions.CONFIRM) {
                                    if (!currentPolicyTag?.name) {
                                        return;
                                    }
                                    deletePolicyTags(policyData, [currentPolicyTag.name]);
                                    Navigation.goBack(isQuickSettingsFlow ? backPath : undefined);
                                }
                            }}
                        />
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicTagSettingsPage;
