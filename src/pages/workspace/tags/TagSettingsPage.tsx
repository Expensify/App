import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isDisablingOrDeletingLastEnabledTag} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {
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
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type TagSettingsPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_SETTINGS>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAG_SETTINGS>;

function TagSettingsPage({route, navigation}: TagSettingsPageProps) {
    const {orderWeight, policyID, tagName, backTo, parentTagsFilter} = route.params;
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock', 'Trashcan'] as const);
    const {translate} = useLocalize();
    const policyData = usePolicyData(policyID);
    const {policy, tags: policyTags} = policyData;
    const policyTag = getTagListByOrderWeight(policyTags, orderWeight);
    const {environmentURL} = useEnvironment();
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = React.useState(false);
    const [isCannotDeleteOrDisableLastTagModalVisible, setIsCannotDeleteOrDisableLastTagModalVisible] = useState(false);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAG_SETTINGS;
    const tagApprover = getTagApproverRule(policy, route.params?.tagName)?.approver ?? '';
    const approver = getPersonalDetailByEmail(tagApprover);
    const approverText = approver?.displayName ?? tagApprover;
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

    const deleteTagAndHideModal = () => {
        deletePolicyTags(policyData, [currentPolicyTag.name]);
        setIsDeleteTagModalOpen(false);
        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined);
    };

    const updateWorkspaceTagEnabled = (value: boolean) => {
        if (shouldPreventDisableOrDelete) {
            setIsCannotDeleteOrDisableLastTagModalVisible(true);
            return;
        }
        setWorkspaceTagEnabled(policyData, {[currentPolicyTag.name]: {name: currentPolicyTag.name, enabled: value}}, policyTag.orderWeight);
    };

    const navigateToEditTag = () => {
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAG_EDIT.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
                : ROUTES.WORKSPACE_TAG_EDIT.getRoute(policyID, orderWeight, currentPolicyTag.name),
        );
    };

    const navigateToEditGlCode = () => {
        if (!isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.glCodes.alias,
                    isQuickSettingsFlow
                        ? ROUTES.SETTINGS_TAG_GL_CODE.getRoute(policyID, orderWeight, tagName, backTo)
                        : ROUTES.WORKSPACE_TAG_GL_CODE.getRoute(policyID, orderWeight, tagName),
                ),
            );
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAG_GL_CODE.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
                : ROUTES.WORKSPACE_TAG_GL_CODE.getRoute(policyID, orderWeight, currentPolicyTag.name),
        );
    };

    const navigateToEditTagApprover = () => {
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAG_APPROVER.getRoute(policyID, orderWeight, currentPolicyTag.name, backTo)
                : ROUTES.WORKSPACE_TAG_APPROVER.getRoute(policyID, orderWeight, currentPolicyTag.name),
        );
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
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="TagSettingsPage"
            >
                <HeaderWithBackButton
                    title={getCleanedTagName(tagName)}
                    shouldSetModalVisibility={false}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : undefined)}
                />
                <ConfirmModal
                    title={translate('workspace.tags.deleteTag')}
                    isVisible={isDeleteTagModalOpen}
                    onConfirm={deleteTagAndHideModal}
                    onCancel={() => setIsDeleteTagModalOpen(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('workspace.tags.deleteTagConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ConfirmModal
                    isVisible={isCannotDeleteOrDisableLastTagModalVisible}
                    onConfirm={() => setIsCannotDeleteOrDisableLastTagModalVisible(false)}
                    onCancel={() => setIsCannotDeleteOrDisableLastTagModalVisible(false)}
                    title={translate('workspace.tags.cannotDeleteOrDisableAllTags.title')}
                    prompt={translate('workspace.tags.cannotDeleteOrDisableAllTags.description')}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
                />

                <View style={styles.flexGrow1}>
                    {!hasDependentTags && (
                        <OfflineWithFeedback
                            errors={getLatestErrorMessageField(currentPolicyTag)}
                            pendingAction={currentPolicyTag.pendingFields?.enabled}
                            errorRowStyles={styles.mh5}
                            onClose={() => clearPolicyTagErrors({policyID, tagName, tagListIndex: orderWeight, policyTags})}
                        >
                            <View style={[styles.mt2, styles.mh5]}>
                                <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                    <Text>{translate('workspace.tags.enableTag')}</Text>
                                    <Switch
                                        isOn={currentPolicyTag.enabled}
                                        accessibilityLabel={translate('workspace.tags.enableTag')}
                                        onToggle={updateWorkspaceTagEnabled}
                                        showLockIcon={shouldPreventDisableOrDelete}
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
                            interactive={!hasDependentTags}
                            shouldShowRightIcon={!hasDependentTags}
                        />
                    </OfflineWithFeedback>
                    {(!hasDependentTags || !!currentPolicyTag?.['GL Code']) && (
                        <OfflineWithFeedback pendingAction={currentPolicyTag.pendingFields?.['GL Code']}>
                            <MenuItemWithTopDescription
                                description={translate(`workspace.tags.glCode`)}
                                title={currentPolicyTag?.['GL Code']}
                                onPress={navigateToEditGlCode}
                                iconRight={hasAccountingConnections ? expensifyIcons.Lock : undefined}
                                interactive={!hasAccountingConnections && !hasDependentTags}
                                shouldShowRightIcon={!hasDependentTags}
                            />
                        </OfflineWithFeedback>
                    )}

                    {!!policy?.areRulesEnabled && !isMultiLevelTags && (
                        <>
                            <View style={[styles.mh5, styles.mv3, styles.pt3, styles.borderTop]}>
                                <Text style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.tags.tagRules')}</Text>
                            </View>
                            <MenuItemWithTopDescription
                                title={approverText}
                                description={translate(`workspace.tags.approverDescription`)}
                                onPress={navigateToEditTagApprover}
                                shouldShowRightIcon
                                disabled={approverDisabled}
                                helperText={
                                    approverDisabled
                                        ? translate('workspace.rules.categoryRules.enableWorkflows', {
                                              moreFeaturesLink: `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)}`,
                                          })
                                        : undefined
                                }
                                shouldParseHelperText
                            />
                        </>
                    )}

                    {shouldShowDeleteMenuItem && (
                        <MenuItem
                            icon={expensifyIcons.Trashcan}
                            title={translate('common.delete')}
                            onPress={() => {
                                if (shouldPreventDisableOrDelete) {
                                    setIsCannotDeleteOrDisableLastTagModalVisible(true);
                                    return;
                                }
                                setIsDeleteTagModalOpen(true);
                            }}
                        />
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default TagSettingsPage;
